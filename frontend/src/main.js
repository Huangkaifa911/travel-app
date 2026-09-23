import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import App from './App.vue'
import './style/global.css'
import router from './router'

import 'vant/es/toast/style'
import 'vant/es/dialog/style'
import 'highlight.js/styles/github.css'
// import { Lazyload } from 'vant'
// ✅ 把这里改成按需路径
import { Lazyload } from 'vant/es/lazyload'

const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)
app.use(Lazyload, {
  lazyComponent: true, // 支持组件懒加载（可选）
  loading: '#f7f8fa', // 占位图
})

app.mount('#app')
