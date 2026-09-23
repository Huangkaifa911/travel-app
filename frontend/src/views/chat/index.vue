<template>
  <div class="chat-page">
    <!-- 顶部导航 -->
    <van-nav-bar title="AI 旅行助手" left-text="返回" left-arrow @click-left="handleBack">
      <template #right>
        <van-icon name="bars" size="20" @click="showDrawer = true" />
      </template>
    </van-nav-bar>

    <ConversationDrawer
      ref="drawerRef"
      v-model:show="showDrawer"
      :currentId="conversationId"
      @select="handleSelectConversation"
      @create="handleNewConversation"
    />

    <!-- 消息列表 -->
    <div class="message-list" ref="messageListRef" @scroll="handleScroll">
      <ChatMessage
        v-for="(msg, index) in messages"
        :key="index"
        :role="msg.role"
        :content="msg.content"
        :time="msg.time"
      />
      <!-- <div
        v-for="(msg, index) in messages"
        :key="index"
        class="message-item"
        :class="{ 'user': msg.role === 'user', 'assistant': msg.role === 'assistant' }"
      >
        <div class="message-bubble">
          <div class="message-content" v-html="formatMessage(msg.content)"></div>
          <div class="message-time">{{ msg.time }}</div>
        </div>
      </div> -->
      <!-- 加载中的提示 -->
      <div v-if="isLoading" class="message-item assistant">
        <div class="message-bubble">
          <div class="message-content"><van-loading size="16px" type="spinner" /> 思考中...</div>
        </div>
      </div>
    </div>

    <!-- 底部输入框 -->
    <div class="input-area">
      <van-field
        v-model="inputText"
        placeholder="输入旅行问题..."
        type="text"
        rows="1"
        autosize
        clearable
        @keyup.enter="send"
      >
        <template #button>
          <!-- 加载中显示停止按钮 -->
          <van-button
            v-if="isLoading"
            size="small"
            type="danger"
            plain
            icon="close"
            @click="stopGeneration"
          >
            停止
          </van-button>
          <!-- 正常显示发送按钮 -->
          <van-button
            v-else
            size="small"
            type="primary"
            :disabled="!inputText.trim()"
            @click="send"
          >
            发送
          </van-button>
        </template>
      </van-field>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import { useStreamChat } from '/src/utils/streamService.js'
import ChatMessage from './components/ChatMessage.vue'
import ConversationDrawer from './components/ConversationDrawer.vue'
import { getConversationDetail } from '@/service/conversation.js'

// ========== 状态 ==========
// const messages = ref([
// {
//   role: 'assistant',
//   content: '你好！我是你的AI旅行助手，有任何旅行问题都可以问我 😊',
//   time: getCurrentTime()
// }
// ])
const inputText = ref('')
// 消息列表
const messageListRef = ref(null)

// 会话抽屉
const drawerRef = ref(null)
// 会话抽屉是否显示
const showDrawer = ref(false)

// 用户是否在滚动
const isScrolling = ref(false)

let scrollTimer = null

// 监听滚动事件
const handleScroll = (e) => {
  const { scrollTop, clientHeight, scrollHeight } = e.target
  // 判断用户是否向上滚动50滚轮
  if (scrollTop + clientHeight < scrollHeight - 50) {
    // 用户正在操作滚动
    isScrolling.value = true

    if (scrollTimer) clearTimeout(scrollTimer)
    // 用户操作滚动5秒后，设置为false
    scrollTimer = setTimeout(() => {
      isScrolling.value = false
    }, 5000)
  } else {
    isScrolling.value = false
  }
}

// ========== 方法 ==========

// 强制滚动到底部
function forceScrollToBottom() {
  nextTick(() => {
    if (messageListRef.value) {
      messageListRef.value.scrollTop = messageListRef.value.scrollHeight
    }
  })
}

// 根据用户是否在滚动来判断是否滚动到底部
const scrollToBottom = () => {
  if (isScrolling.value) return
  forceScrollToBottom()
}

const {
  messages,
  isLoading,
  conversationId,
  sendMessage,
  stopStream,
  clearMessages,
  loadMessages,
} = useStreamChat()
// 发送消息
async function send() {
  const text = inputText.value.trim()
  if (!text) return
  inputText.value = ''
  forceScrollToBottom()
  await sendMessage(text, scrollToBottom)
  if (drawerRef.value) drawerRef.value.loadList()
  await nextTick()
  // console.log('scrollHeight', messageListRef.value.scrollHeight)
  // console.log('scrollTop', messageListRef.value.scrollTop)
  // console.log('clientHeight', messageListRef.value.clientHeight)
  // 延迟 50ms 再滚一次，确保渲染完成
  setTimeout(() => {
    forceScrollToBottom()
  }, 50)
}

// 停止生成
function stopGeneration() {
  stopStream()
}

// 返回
function handleBack() {
  // 返回上一页
  history.back()
}

// 用户点击某个历史会话
async function handleSelectConversation(conv) {
  try {
    const detail = await getConversationDetail(conv._id)
    loadMessages(detail.messages, conv._id)
    await nextTick()
    forceScrollToBottom()
  } catch {
    // 拦截器已提示
  }
}

// ⭐ 用户点"+ 新建会话"
function handleNewConversation() {
  clearMessages()
}

// 页面加载后滚动到底部
onMounted(() => {
  forceScrollToBottom()
})

onUnmounted(() => {
  if (scrollTimer) clearTimeout(scrollTimer)
})
</script>

<style scoped>
.chat-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f6fa;
  overflow: hidden;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
}

.message-item {
  display: flex;
  margin-bottom: 12px;
  max-width: 80%;
}
.message-item.user {
  align-self: flex-end;
}
.message-item.assistant {
  align-self: flex-start;
}

.message-bubble {
  background: white;
  padding: 10px 14px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  position: relative;
  word-break: break-word;
}
.message-item.user .message-bubble {
  background: #1989fa;
  color: white;
}
.message-item.user .message-bubble .message-time {
  color: rgba(255, 255, 255, 0.7);
}

.message-content {
  font-size: 15px;
  line-height: 1.6;
}
.message-time {
  font-size: 11px;
  color: #969799;
  margin-top: 4px;
  text-align: right;
}
.message-item.user .message-time {
  color: rgba(255, 255, 255, 0.6);
}

/* 输入框区域 */
.input-area {
  flex-shrink: 0;
  padding: 8px 12px;
  background: white;
  border-top: 1px solid #ebedf0;
  display: flex;
  align-items: center;
  gap: 8px;
}
.input-area .van-field {
  flex: 1;
  padding: 4px 10px;
  border-radius: 20px;
  background: #f5f6fa;
}
.input-area .van-field :deep(.van-field__body) {
  background: transparent;
}
.input-area .van-button {
  border-radius: 20px;
  padding: 0 16px;
  height: 36px;
  flex-shrink: 0;
  min-width: 64px; /* 固定宽度 */
  transition: background-color 0.2s;
}

/* 加载状态 */
.message-item.assistant .van-loading {
  vertical-align: middle;
  margin-right: 4px;
}
</style>
