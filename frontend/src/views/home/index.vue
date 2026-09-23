<script setup>
import { ref, reactive } from 'vue'

import { useRouter } from 'vue-router'
import { showToast } from 'vant/es/toast'
import CityCard from '@/components/CityCard.vue'
import { onBeforeMount } from 'vue'
import { getCityList } from '@/service/index'

const router = useRouter()

// 规划表单
const planForm = reactive({
  destination: '',
  budget: '',
  days: '',
})
// 表单实例
const formRef = ref(null)
// 快捷标签
const quickTags = ['周边游', '亲子游', '情侣出行', '独自旅行', '特种兵式', '休闲度假']

// AI 快捷问题
const quickQuestions = ['北京3天怎么玩？', '预算2000去哪好？', '海边城市推荐', '小众旅行地']

// // const hotCities = ref([
//   {
//     name: '大理',
//     desc: '风花雪月，苍山洱海',
//     image: 'https://picsum.photos/seed/dali/200/150',
//     tags: ['古镇', '洱海', '慢生活'],
//     price: 1500,
//     hot: true,
//   },
//   {
//     name: '重庆',
//     desc: '8D魔幻，火锅之都',
//     image: 'https://picsum.photos/seed/chongqing/200/150',
//     tags: ['美食', '夜景', '山城'],
//     price: 1200,
//     hot: true,
//   },
//   {
//     name: '西安',
//     desc: '千年古都，盛唐气象',
//     image: 'https://picsum.photos/seed/xian/200/150',
//     tags: ['历史', '兵马俑', '面食'],
//     price: 1000,
//     hot: false,
//   },
//   {
//     name: '厦门',
//     desc: '海上花园，文艺清新',
//     image: 'https://picsum.photos/seed/xiamen/200/150',
//     tags: ['海岛', '鼓浪屿', '小吃'],
//     price: 1800,
//     hot: false,
//   },
// ])

const hotCities = ref([])
onBeforeMount(() => {
  console.log(import.meta.env.VITE_API_BASE_URL)
  getCities()
})

const getCities = async () => {
  try {
    hotCities.value = await getCityList()
  } catch (error) {
    showToast(error.message || '获取城市列表失败')
  }
}

// 应用快捷标签
const applyTag = (tag) => {
  if (tag === '周边游') {
    planForm.days = '2'
    planForm.budget = '800'
  } else if (tag === '特种兵式') {
    planForm.days = '3'
    planForm.budget = '1500'
  } else if (tag === '休闲度假') {
    planForm.days = '5'
    planForm.budget = '5000'
  }
  showToast(`已应用「${tag}」预设`)
}

// 开始规划
const startPlanning = async () => {
  if (planForm.days < 1 || planForm.days > 30) {
    showToast('天数需在1~30天之间')
    return
  }
  try {
    await formRef.value.validate()
    showToast('规划成功')
    router.push({
      path: '/travelPlan',
      query: {
        destination: planForm.destination,
        budget: planForm.budget,
        days: planForm.days,
      },
    })
  } catch (error) {
    showToast(error.message || '请填写完整信息')
    return
  }
}

// 导航栏点击
const onClickLeft = () => showToast('返回')
const onClickRight = () => showToast('个人中心')

// 查看更多
const viewMore = () => showToast('查看更多目的地')
</script>

<template>
  <div class="page-container">
    <!-- 顶部导航 -->
    <van-nav-bar title="旅行助手" left-text="返回" left-arrow @click-left="onClickLeft">
      <template #right>
        <van-icon name="user-o" size="18" @click="onClickRight" />
      </template>
    </van-nav-bar>

    <!-- 主体内容 -->
    <div class="main-content">
      <!-- 第一部分：智能规划 -->
      <section class="plan-section">
        <div class="section-header">
          <van-icon name="guide-o" color="#1989fa" size="20" />
          <span class="section-title">智能行程规划</span>
        </div>
        <div class="plan-card">
          <van-form :model="planForm" ref="formRef">
            <van-cell-group inset>
              <van-field
                name="destination"
                type="text"
                :rules="[{ required: true, message: '请输入目的地' }]"
                v-model="planForm.destination"
                label="目的地"
                placeholder="你想去哪里？"
                left-icon="location-o"
                clearable
              />

              <van-field
                name="budget"
                v-model="planForm.budget"
                label="预算"
                placeholder="预计花费金额"
                type="number"
                :rules="[{ required: true, message: '请输入预算' }]"
                left-icon="balance-o"
              >
                <template #right-icon>
                  <span class="unit-text">元</span>
                </template>
              </van-field>

              <van-field
                name="days"
                v-model.number="planForm.days"
                type="number"
                :rules="[{ required: true, message: '请输入游玩天数' }]"
                label="天数"
                placeholder="游玩天数"
                left-icon="clock-o"
              >
                <template #right-icon>
                  <span class="unit-text">天</span>
                </template>
              </van-field>
            </van-cell-group>
          </van-form>

          <div class="plan-tags">
            <van-tag
              v-for="tag in quickTags"
              :key="tag"
              round
              size="medium"
              class="quick-tag"
              @click="applyTag(tag)"
            >
              {{ tag }}
            </van-tag>
          </div>

          <van-button
            type="primary"
            block
            round
            size="large"
            class="plan-btn"
            @click="startPlanning"
          >
            <van-icon name="search" class="btn-icon" />
            开始规划行程
          </van-button>
        </div>
      </section>

      <!-- 第二部分：AI 对话入口 -->
      <section class="ai-section">
        <div class="section-header">
          <van-icon name="chat-o" color="#07c160" size="20" />
          <span class="section-title">AI 旅行顾问</span>
        </div>

        <div class="ai-card" @click="enterAIChat">
          <div class="ai-content">
            <div class="ai-avatar">
              <van-icon name="smile-o" size="32" color="#fff" />
            </div>
            <div class="ai-info">
              <div class="ai-title">问问 AI 助手</div>
              <div class="ai-desc">景点推荐 · 路线优化 · 避坑指南</div>
            </div>
            <van-icon name="arrow" class="ai-arrow" />
          </div>

          <div class="ai-quick-questions">
            <div
              v-for="q in quickQuestions"
              :key="q"
              class="question-chip"
              @click.stop="askQuestion(q)"
            >
              {{ q }}
            </div>
          </div>
        </div>
      </section>

      <!-- 第三部分：热门城市推荐 -->
      <section class="recommend-section">
        <div class="section-header">
          <van-icon name="fire-o" color="#ff976a" size="20" />
          <span class="section-title">热门目的地</span>
          <span class="more-text" @click="viewMore">更多</span>
        </div>

        <div class="city-grid">
          <CityCard v-for="city in hotCities" :key="city.name" :city="city" />
          <!-- <div
            v-for="city in hotCities"
            :key="city.name"
            class="city-card"
            @click="selectCity(city)"
          >
            <div class="city-image-wrapper">
              <img :src="city.image" :alt="city.name" class="city-image" />
              <div class="city-badge" v-if="city.hot">
                <van-tag color="#ee0a24" text-color="#fff">热门</van-tag>
              </div>
            </div>
            <div class="city-info">
              <div class="city-name">{{ city.name }}</div>
              <div class="city-desc">{{ city.desc }}</div>
              <div class="city-tags">
                <van-tag v-for="tag in city.tags" :key="tag" plain type="primary" size="mini">
                  {{ tag }}
                </van-tag>
              </div>
              <div class="city-price">
                <span class="price-num">¥{{ city.price }}</span>
                <span class="price-unit">起</span>
              </div>
            </div>
          </div> -->
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
/* 区块标题 */
.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  padding: 0 4px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
  margin-left: 6px;
  flex: 1;
}

.more-text {
  font-size: 13px;
  color: #969799;
}

/* 规划区域 */
.plan-section {
  margin-bottom: 20px;
}

.plan-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.unit-text {
  color: #969799;
  font-size: 13px;
}

.plan-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 12px 8px;
}

.quick-tag {
  padding: 4px 10px;
  cursor: pointer;
}

.plan-btn {
  margin-top: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.btn-icon {
  margin-right: 6px;
}

/* AI 区域 */
.ai-section {
  margin-bottom: 20px;
}

.ai-card {
  background: linear-gradient(135deg, #07c160 0%, #05a050 100%);
  border-radius: 12px;
  padding: 16px;
  color: #fff;
  box-shadow: 0 4px 16px rgba(7, 193, 96, 0.2);
}

.ai-content {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.ai-avatar {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.ai-title {
  font-size: 17px;
  font-weight: 600;
  margin-bottom: 4px;
}

.ai-desc {
  font-size: 13px;
  opacity: 0.9;
}

.ai-arrow {
  margin-left: auto;
  opacity: 0.8;
}

.ai-quick-questions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.question-chip {
  background: rgba(255, 255, 255, 0.2);
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 13px;
  backdrop-filter: blur(4px);
}

/* 推荐区域 */
.recommend-section {
  margin-bottom: 20px;
}

.city-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

/* 灵感区域 */
.inspiration-section {
  margin-bottom: 20px;
  min-height: 80px;
}

/* 规划结果 */
.plan-result {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #f2f3f5;
}

.result-title {
  font-size: 16px;
  font-weight: 600;
}

.result-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.result-destination {
  font-size: 15px;
  color: #323233;
  margin-bottom: 16px;
  padding: 12px;
  background: #f7f8fa;
  border-radius: 8px;
}

.day-title {
  font-weight: 600;
  color: #323233;
  margin-bottom: 8px;
}

.day-spots {
  padding-left: 8px;
}

.spot-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #646566;
  font-size: 14px;
  margin-bottom: 6px;
}
</style>
