<script setup>
import { ref } from 'vue'
const activeTab = ref('home')
</script>

<template>
  <div class="app-container">
    <router-view></router-view>
    <!-- 底部导航 -->
    <van-tabbar route v-model="activeTab" v-show="!$route.meta.hideTabbar">
      <van-tabbar-item icon="home-o" name="home" to="/">首页</van-tabbar-item>
      <van-tabbar-item icon="guide-o" name="plan">行程</van-tabbar-item>
      <van-tabbar-item icon="chat-o" name="ai" to="/chat">AI助手</van-tabbar-item>
      <van-tabbar-item icon="user-o" name="me" to="/profile">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<style scoped>
/* 在 App.vue 或全局样式里 */
.markdown-body {
  line-height: 1.6;
  word-break: break-word;
}
.markdown-body h1,
.markdown-body h2,
.markdown-body h3 {
  margin: 0.5em 0 0.3em;
}
.markdown-body p {
  margin: 0.3em 0;
}
.markdown-body ul,
.markdown-body ol {
  padding-left: 1.5em;
  margin: 0.3em 0;
}
.markdown-body pre {
  background: #f5f5f5;
  padding: 0.8em;
  border-radius: 6px;
  overflow-x: auto;
}
.markdown-body code {
  font-family: 'Fira Code', monospace;
  font-size: 0.9em;
}
.markdown-body blockquote {
  border-left: 3px solid #ccc;
  margin: 0.5em 0;
  padding-left: 1em;
  color: #666;
}
/* 行内代码 */
.markdown-body :not(pre) > code {
  background: #f0f0f0;
  padding: 0.2em 0.4em;
  border-radius: 3px;
}
</style>

<style>
/* 固定底部导航图标尺寸，防止字体加载偏移 */
.van-tabbar-item .van-icon {
  width: 24px !important;
  height: 24px !important;
  min-width: 24px !important;
  min-height: 24px !important;
  display: inline-flex !important;
  align-items: center;
  justify-content: center;
  font-size: 22px !important; /* 原尺寸，保持视觉一致 */
}

/* 同时固定顶部导航图标（如果也存在） */
.van-nav-bar .van-icon {
  width: 22px !important;
  height: 22px !important;
  font-size: 20px !important;
}
</style>
