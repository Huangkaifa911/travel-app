<template>
  <van-popup
    v-model:show="visible"
    position="left"
    :style="{ width: '80%', height: '100%' }"
    @click-overlay="close"
  >
    <div class="drawer">
      <div class="drawer-header">
        <span>历史会话</span>
        <van-icon name="plus" size="20" @click="handleCreate" />
      </div>

      <div class="conversation-list">
        <div
          v-for="conv in conversations"
          :key="conv._id"
          class="conversation-item"
          :class="{ active: conv._id === currentId }"
          @click="handleSelect(conv)"
        >
          <div class="conv-main">
            <div class="conv-title">{{ conv.title }}</div>
            <div class="conv-preview">{{ conv.lastMessage || '暂无消息' }}</div>
          </div>
          <van-icon name="delete-o" class="conv-delete" @click.stop="handleDelete(conv)" />
        </div>

        <div v-if="!conversations.length" class="empty">还没有会话，点击右上角 + 新建</div>
      </div>
    </div>
  </van-popup>
</template>

<script setup>
import { ref, watch } from 'vue'
import { showConfirmDialog } from 'vant/es/dialog'
import { listConversations, deleteConversation } from '@/service/conversation'
import { showToast } from 'vant/es/toast'

const props = defineProps({
  show: Boolean,
  currentId: String,
})
const emit = defineEmits(['update:show', 'select', 'create'])

const visible = ref(props.show)
const conversations = ref([])

watch(
  () => props.show,
  (val) => {
    visible.value = val
    if (val) loadList()
  },
)

watch(visible, (val) => {
  emit('update:show', val)
})

async function loadList() {
  try {
    conversations.value = await listConversations()
  } catch {
    // 拦截器已提示
  }
}

function close() {
  visible.value = false
}

function handleCreate() {
  emit('create')
  close()
}

function handleSelect(conv) {
  emit('select', conv)
  close()
}

async function handleDelete(conv) {
  try {
    await showConfirmDialog({
      title: '提示',
      message: '确定删除这个会话吗？',
    })
    await deleteConversation(conv._id)
    showToast('删除成功')
    loadList()
  } catch {
    // 用户取消或者请求失败
  }
}

// 让父组件能主动刷新列表
defineExpose({ loadList })
</script>

<style scoped>
.drawer {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f7f8fa;
}
.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: white;
  font-size: 16px;
  font-weight: 600;
  border-bottom: 1px solid #ebedf0;
}
.conversation-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}
.conversation-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: white;
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: background 0.2s;
}
.conversation-item.active {
  background: #e8f4ff;
}
.conv-main {
  flex: 1;
  min-width: 0;
}
.conv-title {
  font-size: 14px;
  font-weight: 500;
  color: #323233;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.conv-preview {
  font-size: 12px;
  color: #969799;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.conv-delete {
  margin-left: 8px;
  color: #c8c9cc;
  padding: 4px;
}
.conv-delete:hover {
  color: #ee0a24;
}
.empty {
  text-align: center;
  color: #969799;
  font-size: 13px;
  padding: 40px 20px;
}
</style>
