<template>
  <!-- 顶部导航 -->
  <van-nav-bar title="旅游规划" left-text="返回" left-arrow @click-left="handleBack" />
  <div v-if="loading" class="loading-container">
    <van-loading size="24px" vertical>加载中...</van-loading>
  </div>
  <div v-else class="trip-plan">
    <!-- 概览卡片 -->
    <div class="summary-card">
      <div class="summary-header">
        <span class="destination">{{ planData.destination }}</span>
        <van-tag color="#1989fa" size="large">{{ planData.days }}天</van-tag>
        <van-tag color="#07c160" size="large" plain>预算 {{ planData.budget }}</van-tag>
      </div>
      <div class="summary-text">{{ planData.summary }}</div>
    </div>

    <!-- 每日行程 -->
    <div class="daily-collapse">
      <van-collapse v-model="activeDays">
        <van-collapse-item
          v-for="(day, index) in planData.itinerary"
          :key="index"
          :name="index"
          :title="`第 ${day.day} 天 (${day.date})`"
          :extra="`当日 ¥${day.daily_total}`"
        >
          <!-- ⭐ 外层循环：上午 / 下午 / 晚上 -->
          <div v-for="(period, pIdx) in day.schedule" :key="pIdx" class="period-block">
            <div class="period-title">{{ period.period }}</div>

            <!-- ⭐ 内层循环：每个时段的具体活动 -->
            <div v-for="(act, aIdx) in period.activities" :key="aIdx" class="activity-card">
              <div class="activity-header">
                <span class="activity-time">{{ act.time }}</span>
                <span class="activity-cost-tag" :class="{ free: act.cost === 0 }">
                  {{ act.cost === 0 ? '免费' : `¥${act.cost}` }}
                </span>
              </div>
              <div class="activity-body">
                <div class="activity-name">{{ act.activity }}</div>
                <div class="activity-location" v-if="act.location">
                  <van-icon name="location-o" size="14px" />
                  {{ act.location }}
                </div>
                <div class="activity-transport" v-if="act.transport">
                  <van-icon name="guide-o" size="14px" />
                  {{ act.transport }}
                </div>
                <div class="activity-note" v-if="act.note">
                  <van-icon name="info-o" size="14px" />
                  {{ act.note }}
                </div>
              </div>
            </div>
          </div>

          <!-- 住宿 -->
          <div class="accommodation-block" v-if="day.accommodation">
            <van-divider>住宿</van-divider>
            <div class="accommodation-card">
              <div class="accommodation-name">{{ day.accommodation.name }}</div>
              <div class="accommodation-cost">¥{{ day.accommodation.cost }}</div>
              <div class="accommodation-note" v-if="day.accommodation.note">
                {{ day.accommodation.note }}
              </div>
            </div>
          </div>

          <!-- 当日汇总 -->
          <div class="day-summary">
            <span
              >交通：<strong>¥{{ day.transport_total }}</strong></span
            >
            <span
              >住宿：<strong>¥{{ day.accommodation?.cost ?? 0 }}</strong></span
            >
            <span
              >当日总计：<strong class="total-highlight">¥{{ day.daily_total }}</strong></span
            >
          </div>
        </van-collapse-item>
      </van-collapse>
    </div>

    <!-- 费用明细（全部使用可选链和默认值） -->
    <div class="cost-breakdown" v-if="planData.cost_breakdown">
      <van-divider>费用明细</van-divider>
      <div class="cost-grid">
        <div class="cost-item">
          <span class="cost-label">景点</span>
          <span class="cost-value">¥{{ planData.cost_breakdown.attractions ?? 0 }}</span>
        </div>
        <div class="cost-item">
          <span class="cost-label">餐饮</span>
          <span class="cost-value">¥{{ planData.cost_breakdown.meals ?? 0 }}</span>
        </div>
        <div class="cost-item">
          <span class="cost-label">住宿</span>
          <span class="cost-value">¥{{ planData.cost_breakdown.accommodation ?? 0 }}</span>
        </div>
        <div class="cost-item">
          <span class="cost-label">交通</span>
          <span class="cost-value">¥{{ planData.cost_breakdown.transport ?? 0 }}</span>
        </div>
        <div class="cost-item">
          <span class="cost-label">其他</span>
          <span class="cost-value">¥{{ planData.cost_breakdown.other ?? 0 }}</span>
        </div>
        <div class="cost-item total-item">
          <span class="cost-label">总计</span>
          <span class="cost-value total-value">¥{{ planData.cost_breakdown.total ?? 0 }}</span>
        </div>
      </div>
    </div>

    <!-- 贴士 -->
    <div class="tips" v-if="planData.tips">
      <van-divider>实用贴士</van-divider>
      <div class="tips-content">{{ planData.tips }}</div>
    </div>

    <!-- 底部按钮 -->
    <div class="bottom-actions">
      <van-button
        type="primary"
        block
        round
        :loading="saving"
        @click="handleSave"
        style="margin-bottom: 8px"
      >
        保存行程
      </van-button>
      <van-button type="primary" block round @click="handleRegenerate">重新规划</van-button>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import request from '@/utils/request'
import { useUserStore } from '@/stores/user'
import { saveTripPlan, getTripPlanDetail } from '@/service/tripPlan'
import { showToast } from 'vant/es/toast'

const router = useRouter()
const loading = ref(true)
const saving = ref(false)

const userStore = useUserStore()

const querys = ref({
  destination: '',
  days: 0,
  budget: 0,
})

// 完整的默认结构，确保即使后端数据缺失也不会报错
const planData = ref({
  destination: '',
  days: 0,
  budget: 0,
  summary: '',
  itinerary: [],
  cost_breakdown: {
    attractions: 0,
    meals: 0,
    accommodation: 0,
    transport: 0,
    other: 0,
    total: 0,
  },
  tips: '',
})

async function handleSave() {
  // 判断用户是否登录
  if (!userStore.isLoggedIn) {
    router.replace({ path: '/login', query: { redirect: router.fullPath } })
  }
  saving.value = true
  try {
    await saveTripPlan({
      destination: planData.value.destination,
      days: planData.value.days,
      budget: planData.value.budget,
      planData: planData.value,
    })
    showToast('行程已保存')
  } catch (error) {
    console.error('保存行程失败:', error)
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  const route = useRoute()

  if (route.query.planId) {
    await loadFromSaved(route.query.planId)
    return
  }

  querys.value.destination = route.query.destination
  querys.value.days = route.query.days
  querys.value.budget = route.query.budget
  await getPlanData()
})

// 加载已保存行程
const loadFromSaved = async (planId) => {
  try {
    const res = await getTripPlanDetail(planId)
    planData.value = {
      ...planData.value,
      ...res.planData,
    }
    loading.value = false
  } catch (error) {
    loading.value = false
    console.error('加载行程失败:', error)
  }
}

const getPlanData = async () => {
  try {
    console.log('===== 即将请求 recommend，参数:', querys.value) // ⭐ 加
    const res = await request.post('travel/recommend', querys.value)
    console.log('===== 请求成功，res:', res) // ⭐ 加
    // 合并默认值，防止后端返回的字段不全
    planData.value = {
      ...planData.value,
      ...res,
      cost_breakdown: {
        ...planData.value.cost_breakdown,
        ...(res.cost_breakdown || {}),
      },
    }
    loading.value = false
  } catch (error) {
    loading.value = false
    console.error('获取行程失败:', error)
  }
}

const activeDays = ref([0])

const handleBack = () => {
  router.back()
}

const handleRegenerate = async () => {
  try {
    loading.value = true
    await getPlanData()

    loading.value = false
  } catch (error) {
    loading.value = false
    console.error(error)
  }
}
</script>

<style scoped>
/* 你的原有样式保持不变，直接复制下面的内容 */
.trip-plan {
  background-color: #f5f6fa;
  min-height: 100vh;
  padding-bottom: 80px;
}

.summary-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  margin: 12px 16px;
  padding: 18px 16px;
  border-radius: 12px;
  color: white;
}
.summary-header {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}
.destination {
  font-size: 20px;
  font-weight: bold;
}
.summary-text {
  font-size: 13px;
  opacity: 0.9;
  line-height: 1.6;
}

.daily-collapse {
  margin: 0 16px;
}

.activity-card {
  background: #ffffff;
  border-radius: 8px;
  padding: 12px 14px;
  margin-bottom: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}
.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.activity-time {
  font-size: 13px;
  color: #646566;
  background: #f0f0f0;
  padding: 0 8px;
  border-radius: 10px;
  line-height: 22px;
}
.activity-cost-tag {
  font-size: 14px;
  font-weight: 600;
  color: #ee0a24;
}
.activity-cost-tag.free {
  color: #07c160;
}
.activity-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.activity-name {
  font-size: 15px;
  font-weight: 500;
  color: #323233;
  line-height: 1.5;
}
.activity-location,
.activity-transport,
.activity-note {
  font-size: 13px;
  color: #969799;
  display: flex;
  align-items: flex-start;
  gap: 4px;
  line-height: 1.5;
}
.activity-note {
  color: #ff8c00;
  background: #fff7e6;
  padding: 4px 8px;
  border-radius: 4px;
  margin-top: 4px;
}

.accommodation-block {
  margin-top: 4px;
}
.accommodation-card {
  background: #f0f7ff;
  border-radius: 8px;
  padding: 12px 14px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 12px;
}
.accommodation-name {
  font-size: 15px;
  font-weight: 500;
  color: #323233;
}
.accommodation-cost {
  font-size: 16px;
  font-weight: bold;
  color: #ee0a24;
  margin-left: auto;
}
.accommodation-note {
  font-size: 13px;
  color: #646566;
  width: 100%;
}

.day-summary {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  font-size: 14px;
  color: #646566;
  padding: 10px 4px 4px;
  border-top: 1px dashed #ebedf0;
  margin-top: 8px;
}
.day-summary strong {
  color: #323233;
}
.day-summary .total-highlight {
  color: #ee0a24;
  font-size: 16px;
}

.cost-breakdown {
  background: white;
  margin: 16px;
  border-radius: 12px;
  padding: 8px 0;
}
.cost-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px 0;
  padding: 4px 0;
}
.cost-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 0;
  border-right: 1px solid #f0f0f0;
}
.cost-item:nth-child(3n) {
  border-right: none;
}
.cost-label {
  font-size: 12px;
  color: #969799;
}
.cost-value {
  font-size: 16px;
  font-weight: 500;
  color: #323233;
  margin-top: 2px;
}
.total-item {
  border-right: none;
}
.total-value {
  color: #ee0a24;
  font-weight: bold;
}

.tips {
  background: white;
  margin: 16px;
  margin-bottom: 50px;
  border-radius: 12px;
  padding: 4px 16px 16px;
}
.tips-content {
  font-size: 14px;
  color: #646566;
  line-height: 1.8;
  white-space: pre-line;
}

.bottom-actions {
  position: fixed;
  bottom: 40px;
  left: 0;
  right: 0;
  padding: 12px 16px;
  background: white;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
}

.period-block {
  margin-bottom: 16px;
}
.period-title {
  font-size: 15px;
  font-weight: 600;
  color: #1989fa;
  padding: 8px 0 6px 10px;
  border-left: 3px solid #1989fa;
  margin-bottom: 10px;
  background: #f0f7ff;
  border-radius: 0 6px 6px 0;
}
</style>
