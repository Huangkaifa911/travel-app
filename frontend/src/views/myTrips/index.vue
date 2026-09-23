<template>
  <div class="my-trips">
    <van-nav-bar title="我的行程" left-text="返回" left-arrow @click-left="handleBack" />

    <div v-if="loading" class="loading">
      <van-loading size="24px" vertical>加载中...</van-loading>
    </div>

    <div v-else-if="!list.length" class="empty">
      <van-empty description="还没有保存的行程" />
      <van-button type="primary" round @click="goHome">去规划一个</van-button>
    </div>

    <div v-else class="trip-list">
      <div v-for="item in list" :key="item._id" class="trip-card" @click="handleView(item)">
        <div class="trip-header">
          <span class="destination">{{ item.destination }}</span>
          <van-tag color="#1989fa" size="medium">{{ item.days }}天</van-tag>
          <van-tag color="#07c160" size="medium" plain>预算 {{ item.budget }}</van-tag>
        </div>
        <div class="trip-meta">
          <span>{{ formatDate(item.createdAt) }} 保存</span>
          <van-icon name="delete-o" class="delete-icon" @click.stop="handleDelete(item)" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showConfirmDialog } from 'vant/es/dialog'
import { listTripPlan, deleteTripPlan } from '@/service/tripPlan'
import { showToast } from 'vant/es/toast'

const router = useRouter()
const loading = ref(true)
const list = ref([])

onMounted(loadList)

async function loadList() {
  try {
    list.value = await listTripPlan()
  } catch {
    // 拦截器已提示
  } finally {
    loading.value = false
  }
}

function formatDate(iso) {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function handleView(item) {
  router.push({
    path: '/travelPlan',
    query: { planId: item._id }, // ⭐ 用 planId 传过去，让行程页去加载
  })
}

async function handleDelete(item) {
  try {
    await showConfirmDialog({ title: '提示', message: '确定删除这个行程吗？' })
    await deleteTripPlan(item._id)
    showToast('删除成功')
    list.value = list.value.filter((x) => x._id !== item._id)
  } catch {
    // 用户取消或请求失败
  }
}

function handleBack() {
  router.back()
}

function goHome() {
  router.replace('/')
}
</script>

<style scoped>
.my-trips {
  min-height: 100vh;
  background: #f5f6fa;
}
.loading,
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 20px;
}
.trip-list {
  padding: 12px 16px;
}
.trip-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  cursor: pointer;
}
.trip-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
.destination {
  font-size: 17px;
  font-weight: 600;
  color: #323233;
  margin-right: auto;
}
.trip-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #969799;
}
.delete-icon {
  font-size: 18px;
  padding: 4px;
  color: #c8c9cc;
}
.delete-icon:hover {
  color: #ee0a24;
}
</style>
