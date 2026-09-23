// composables/useStreamChat.js
import { ref } from 'vue'

export function useStreamChat() {
  // 消息列表
  const messages = ref([])
  // 加载状态
  const isLoading = ref(false)
  // 会话 ID
  const conversationId = ref(null)

  // 中断控制器
  let abortController = null

  //处理时间
  const getCurrentTime = () => {
    const now = new Date()
    return now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }

  // 清空消息(切换会话时调用)
  const clearMessages = () => {
    messages.value = []
    conversationId.value = null
  }

  const loadMessages = (list, convId) => {
    messages.value = list.map((item) => ({
      role: item.role,
      content: item.content,
      time: new Date(item.time).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    }))
    conversationId.value = convId
  }

  // 发送消息
  const sendMessage = async (userInput, onChunk) => {
    if (!userInput.trim() || isLoading.value) return

    // 1. 添加用户消息
    messages.value.push({ role: 'user', content: userInput, time: getCurrentTime() })
    // 2. 创建 AI 占位消息
    const assistantIndex = messages.value.length
    messages.value.push({ role: 'assistant', content: '', time: getCurrentTime() })

    isLoading.value = true
    abortController = new AbortController()

    // ---------- 在 sendMessage 函数内部开头处，新增节流变量 ----------
    let pendingText = '' // 缓存池
    let updateTimer = null // 定时器

    // 真正的渲染函数：把缓存池的内容倒进 Vue
    const flushPending = () => {
      if (updateTimer) {
        clearTimeout(updateTimer)
        updateTimer = null
      }
      // 如果有积压的文字，一次性追加
      if (pendingText) {
        messages.value[assistantIndex].content += pendingText
        pendingText = '' // 清空池子
        if (onChunk) onChunk() // 触发外部滚动
      }
    }

    // 调度函数：每次来新字，重置 30ms 倒计时
    const scheduleFlush = () => {
      if (updateTimer) clearTimeout(updateTimer)
      // 30ms 后执行渲染，期间如果有新字进来，会重置这个定时器
      updateTimer = setTimeout(flushPending, 30)
    }

    try {
      // 3. 发起流式请求
      const token = localStorage.getItem('token')
      const response = await fetch('api/travel/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: userInput, conversationId: conversationId.value }),
        signal: abortController.signal,
      })

      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      // 4. 读取流
      const reader = response.body.getReader()
      const decoder = new TextDecoder('utf-8')

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        // 5. 追加到 AI 消息
        const lines = chunk.split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.substring(6)
            if (jsonStr === '[DONE]') continue

            try {
              const obj = JSON.parse(jsonStr)
              if (obj.type === 'meta') {
                // 后端的会话 ID，存起来
                conversationId.value = obj.conversationId
              } else if (obj.type === 'chunk' && obj.content) {
                // ----- 关键修改：不再直接给 messages 赋值 -----
                pendingText += obj.content
                scheduleFlush() // 开一个 30ms 定时器
              } else if (obj.type === 'end') {
                // 流结束
              } else if (obj.content) {
                // 其他类型，直接追加
                pendingText += obj.content
                scheduleFlush() // 开一个 30ms 定时器
              }
            } catch (error) {
              console.error('解析 JSON 失败:', error)
            }
          }
        }
        // ----- 流结束了，立刻把池子里最后一点水倒出来 -----
        flushPending()
      }
    } catch (error) {
      // 出错也要把已有的文字显示出来
      flushPending()
      if (error.name === 'AbortError') {
        // 用户主动停止
        messages.value[assistantIndex].content += '\n\n⏸️ 已停止生成'
        return
      }
      console.error('请求失败:', error)
      // 错误提示
      if (!messages.value[assistantIndex].content) {
        messages.value[assistantIndex].content = '⚠️ 请求失败，请重试'
      }
    } finally {
      isLoading.value = false
      abortController = null
      // 清理定时器
      if (updateTimer) clearTimeout(updateTimer)
      messages.value[assistantIndex].time = getCurrentTime()
    }
  }

  // 停止生成
  const stopStream = () => {
    if (abortController) {
      abortController.abort()
      isLoading.value = false
    }
  }

  return {
    messages,
    isLoading,
    conversationId,
    sendMessage,
    stopStream,
    clearMessages,
    loadMessages,
  }
}
