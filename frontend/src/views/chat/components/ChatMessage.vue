<template>
  <div :class="['message-row', role === 'user' ? 'message-user' : 'message-assistant']">
    <!-- 头像区（可选） -->
    <!-- <div class="avatar">
      <span v-if="role === 'user'">🧑</span>
      <span v-else>🤖</span>
    </div> -->

    <!-- 消息主体 -->
    <div class="message-bubble">
      <div class="message-header">
        <span class="name">{{ role === 'user' ? '我' : 'AI导游' }}</span>
        <span class="time">{{ time }}</span>
      </div>
      <div class="message-body">
        <!-- 用户消息直接显示文本 -->
        <div v-if="role === 'user'" class="text-content">{{ content }}</div>

        <!-- AI消息：Markdown渲染后显示，带markdown-body类名方便定制 -->
        <div v-else class="markdown-body" v-html="renderedHtml"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps(['role', 'content', 'time'])
const renderedHtml = ref('')

async function renderMarkdownAsync(text) {
  try {
    const { renderMarkdown } = await import('@/utils/markdown.js')
    renderedHtml.value = renderMarkdown(text)
  } catch {
    renderedHtml.value = text // 降级
  }
}

watch(
  () => props.content,
  (newVal) => {
    if (props.role === 'assistant' && newVal) {
      renderMarkdownAsync(newVal)
    }
  },
  { immediate: true },
)
</script>

<style scoped>
/* ========== 消息行布局 ========== */
.message-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 18px;
  gap: 10px;
}
/* 用户消息靠右，AI消息靠左 */
.message-user {
  flex-direction: row-reverse;
}
.message-assistant {
  flex-direction: row;
}

/* ========== 头像 ========== */
.avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
  color: white;
}
.message-user .avatar {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

/* ========== 气泡 ========== */
.message-bubble {
  max-width: 78%;
  padding: 12px 16px;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: relative;
  word-break: break-word;
}
/* 用户气泡颜色区分 */
.message-user .message-bubble {
  background: #e8f5e9;
  border-bottom-right-radius: 4px;
}
.message-assistant .message-bubble {
  background: #ffffff;
  border-bottom-left-radius: 4px;
}

/* ========== 消息头部 ========== */
.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  font-size: 13px;
}
.name {
  font-weight: 600;
  color: #333;
}
.time {
  color: #999;
  margin-right: 10px;
}

/* ========== 消息正文通用 ========== */
.text-content {
  line-height: 1.6;
  color: #222;
  white-space: pre-wrap;
}

/* ========== Markdown 内容样式（基于 .markdown-body） ========== */
.markdown-body {
  line-height: 1.7;
  color: #2c3e50;
}
.markdown-body h1,
.markdown-body h2,
.markdown-body h3,
.markdown-body h4 {
  margin: 0.7em 0 0.3em;
  font-weight: 600;
  color: #1a1a1a;
}
:deep(.markdown-body h1) {
  font-size: 1.3em;
  border-bottom: none;
}
:deep(.markdown-body h2) {
  font-size: 1.15em;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.2em;
}
:deep(.markdown-body h3) {
  font-size: 1.05em;
}
:deep(.markdown-body h4) {
  font-size: 1em;
}

.markdown-body p {
  margin: 0.4em 0;
}

.markdown-body ul,
.markdown-body ol {
  padding-left: 1.6em;
  margin: 0.4em 0;
}
.markdown-body li {
  margin-bottom: 0.2em;
}

.markdown-body a {
  color: #1a73e8;
  text-decoration: none;
}
.markdown-body a:hover {
  text-decoration: underline;
}

.markdown-body blockquote {
  border-left: 3px solid #42b983;
  margin: 0.6em 0;
  padding: 0.4em 1em;
  background: #f9fafb;
  color: #555;
  border-radius: 0 6px 6px 0;
}

/* 代码块 */
.markdown-body pre {
  background: #f6f8fa;
  padding: 14px 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 0.8em 0;
  font-size: 0.9em;
  line-height: 1.5;
}
.markdown-body code {
  font-family: 'Fira Code', 'Cascadia Code', Consolas, monospace;
  font-size: 0.9em;
}
/* 行内代码 */
.markdown-body :not(pre) > code {
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 4px;
  color: #d63384;
}

/* 表格 */
.markdown-body table {
  border-collapse: collapse;
  width: 100%;
  margin: 0.8em 0;
}
.markdown-body th,
.markdown-body td {
  border: 1px solid #ddd;
  padding: 8px 12px;
  text-align: left;
}
.markdown-body th {
  background: #f2f2f2;
  font-weight: 600;
}

/* 分割线 */
.markdown-body hr {
  border: none;
  border-top: 1px solid #eee;
  margin: 1em 0;
}

/* 图片自适应 */
.markdown-body img {
  max-width: 100%;
  border-radius: 8px;
}
</style>
