<template>
  <div class="login-page">
    <van-nav-bar title="登录" />

    <div class="header">
      <h1>AI 旅行助手</h1>
      <p>登录后开启你的专属行程</p>
    </div>

    <van-form @submit="onSubmit">
      <van-cell-group inset>
        <van-field
          v-model="form.username"
          name="username"
          label="用户名"
          placeholder="请输入用户名"
          :rules="[{ required: true, message: '请输入用户名' }]"
        />
        <van-field
          v-model="form.password"
          type="password"
          name="password"
          label="密码"
          placeholder="请输入密码"
          :rules="[{ required: true, message: '请输入密码' }]"
        />
      </van-cell-group>

      <div class="btn-wrap">
        <van-button round block type="primary" native-type="submit" :loading="loading">
          登录
        </van-button>
        <van-button round block plain type="primary" style="margin-top: 12px" @click="goRegister">
          没有账号？去注册
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { showToast } from 'vant/es/toast'

const form = reactive({ username: '', password: '' })
const loading = ref(false)
const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

async function onSubmit() {
  loading.value = true
  try {
    await userStore.loginFn(form)
    showToast('登录成功')
    // ⭐ 关键：登录后跳回"来源页"
    const redirect = route.query.redirect || '/'
    router.replace(redirect)
  } catch {
    // 错误提示已经在 request.js 拦截器里统一做了，这里不用再处理
  } finally {
    loading.value = false
  }
}

function goRegister() {
  router.push('/register')
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: #f5f6fa;
}
.header {
  padding: 40px 20px 24px;
  text-align: center;
}
.header h1 {
  font-size: 24px;
  margin-bottom: 8px;
  color: #323233;
}
.header p {
  color: #969799;
  font-size: 14px;
}
.btn-wrap {
  padding: 24px 16px;
}
</style>
