import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['user', 'assistant'],   // ⭐ 枚举，防止脏数据
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
)

// 复合索引：按会话查消息，按时间正序
messageSchema.index({ conversationId: 1, createdAt: 1 })

export default mongoose.model('Message', messageSchema)