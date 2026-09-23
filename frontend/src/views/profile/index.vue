<template>
  <div class="profile-container">
    <van-nav-bar title="我的" />
    <div class="user-card" v-if="userStore.userInfo">
      <van-image round width="60" height="60" :src="userStore.userInfo.avatar || defaultAvatar" />
      <div class="user-info">
        <div class="nickname">{{ userStore.userInfo.nickname }}</div>
        <div class="username">@{{ userStore.userInfo.username }}</div>
      </div>
    </div>

    <van-cell-group inset style="margin-top: 16px">
      <van-cell title="我的行程" is-link to="/my-trips" />
      <!-- ⭐ 新增 -->
      <van-cell title="我的会话" is-link @click="goChat" />
      <van-cell title="设置" is-link />
    </van-cell-group>

    <div style="padding: 24px 16px">
      <van-button block round type="danger" plain @click="onLogout">退出登录</van-button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { showConfirmDialog } from 'vant/es/dialog'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const router = useRouter()
const defaultAvatar = 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'

function goChat() {
  router.push('/chat')
}

async function onLogout() {
  await showConfirmDialog({ title: '提示', message: '确定要退出登录吗？' })
  userStore.logoutFn()
  router.replace('/login')
}
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  background: #f5f6fa;
}
.user-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px 20px;
  background: #fff;
}
.nickname {
  font-size: 18px;
  font-weight: 600;
}
.username {
  font-size: 13px;
  color: #969799;
  margin-top: 4px;
}
</style>
