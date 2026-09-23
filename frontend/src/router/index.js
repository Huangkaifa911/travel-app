import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/home/index.vue'),
  },
  {
    path: '/chat',
    name: 'chat',
    component: () => import('@/views/chat/index.vue'),
    meta: { hideTabbar: true },
  },
  {
    path: '/travelPlan',
    name: 'travelPlan',
    component: () => import('@/views/travelPlan/index.vue'),
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/profile/index.vue'),
    meta: { requiresAuth: true }, //需要登录才能访问
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login/index.vue'),
    meta: { hideTabbar: true },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/register/index.vue'),
    meta: { hideTabbar: true },
  },
  {
    path: '/my-trips',
    name: 'myTrips',
    component: () => import('@/views/myTrips/index.vue'),
    meta: { requiresAuth: true, hideTabbar: true }, //需要登录才能访问
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach(async (to, from) => {
  const userStore = useUserStore()
  // 1. 需要登录但未登录 → 跳登录页，并记住来源
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
  // 2. 已登录但 userInfo 为空（比如刷新后 Pinia 恢复了 token 但 userInfo 丢过）→ 拉一次
  if (userStore.isLoggedIn && !userStore.userInfo) {
    try {
      await userStore.getMeFn()
    } catch (err) {
      // getMe 失败会内部清 token，这里直接跳登录
      return { path: '/login', query: { redirect: to.fullPath } }
    }
  }

  return true
})

export default router
