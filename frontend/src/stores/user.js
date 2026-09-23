import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login, register, getMe } from '@/service/auth'

export const useUserStore = defineStore(
  'user',
  () => {
    const userInfo = ref(null)
    const token = ref('')

    const isLoggedIn = computed(() => !!token.value)

    async function loginFn(payload) {
      const res = await login(payload)
      token.value = res.token
      userInfo.value = res.user
      localStorage.setItem('token', res.token) //给axios 拦截器使用
      return res
    }

    async function registerFn(payload) {
      const res = await register(payload)
      token.value = res.token
      userInfo.value = res.user
      localStorage.setItem('token', res.token) //给axios 拦截器使用
      return res
    }

    async function getMeFn() {
      if (!token.value) return null
      try {
        userInfo.value = await getMe()
        return userInfo.value
      } catch (error) {
        logoutFn({ silent: true })
        throw error
      }
    }

    async function logoutFn({ silent = false } = {}) {
      token.value = ''
      userInfo.value = null
      localStorage.removeItem('token')
    }

    return {
      token,
      userInfo,
      isLoggedIn,
      loginFn,
      registerFn,
      getMeFn,
      logoutFn,
    }
  },
  {
    persist: true,
  },
)
