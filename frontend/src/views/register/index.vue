<template>
  <div class="register-page">
    <van-nav-bar title="注册" left-text="返回" left-arrow @click-left="goBack" />

    <div class="header">
      <h1>创建账号</h1>
      <p>注册后即可保存你的专属行程</p>
    </div>

    <van-form @submit="onSubmit">
      <van-cell-group inset>
        <van-field
          v-model="form.username"
          name="username"
          label="用户名"
          placeholder="3-20 位，字母数字下划线"
          :rules="[
            { required: true, message: '请输入用户名' },
            { pattern: /^[a-zA-Z0-9_]{3,20}$/, message: '3-20 位字母数字下划线' },
          ]"
        />
        <van-field
          v-model="form.password"
          type="password"
          name="password"
          label="密码"
          placeholder="至少 6 位"
          :rules="[
            { required: true, message: '请输入密码' },
            { validator: (v) => v.length >= 6, message: '密码至少 6 位' },
          ]"
        />
        <van-field
          v-model="form.confirmPassword"
          type="password"
          name="confirmPassword"
          label="确认密码"
          placeholder="再次输入密码"
          :rules="[
            { required: true, message: '请再次输入密码' },
            { validator: (v) => v === form.password, message: '两次密码不一致' },
          ]"
        />
        <van-field
          v-model="form.nickname"
          name="nickname"
          label="昵称"
          placeholder="选填，默认使用用户名"
        />
      </van-cell-group>

      <div class="btn-wrap">
        <van-button round block type="primary" native-type="submit" :loading="loading">
          注册
        </van-button>
        <van-button round block plain type="primary" style="margin-top: 12px" @click="goLogin">
          已有账号？去登录
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { showToast } from 'vant/es/toast'

const form = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  nickname: '',
})
const loading = ref(false)
const userStore = useUserStore()
const router = useRouter()

async function onSubmit() {
  loading.value = true
  try {
    await userStore.registerFn({
      username: form.username,
      password: form.password,
      nickname: form.nickname,
    })
    showToast('注册成功')
    router.replace('/') // 注册成功后回首页
  } catch (err) {
    showToast(err.message || '注册失败')
    // 统一拦截器已处理
  } finally {
    loading.value = false
  }
}

function goBack() {
  router.back()
}

function goLogin() {
  router.push('/login')
}
</script>

<style scoped>
.register-page {
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
