import axios from 'axios'
import { showToast } from 'vant/es/toast'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 100000,
})

request.interceptors.request.use(
  (config) => {
    // 每次请求都添加token
    // 从localStorage中获取token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)
request.interceptors.response.use(
  (response) => {
    const res = response.data
    console.log('===== 拦截器收到:', res, 'success 值:', res.success) // ⭐ 加这行
    // 后端统一返回 { success, message, data }
    // HTTP 2xx 但业务失败（比如用户名已存在返回 400，其实已经不是 2xx 了）
    // 这里主要处理 success: true 的情况
    if (res.success) {
      return res.data
    }
    showToast(res.message || '请求失败')
    return Promise.reject(new Error(res.message || '请求失败'))
  },
  (error) => {
    const status = error.response?.status
    const message = error.response?.data?.message || '请求失败'

    // 处理401错误
    if (status === 401) {
      // 401 表示 token 过期，需要重新登录
      // 清除 localStorage 中的 token
      localStorage.removeItem('token')
      showToast('登录过期，请重新登录')
      // 跳转到登录页
    } else {
      showToast(message || '网络异常')
    }

    return Promise.reject(error)
  },
)

export default request
