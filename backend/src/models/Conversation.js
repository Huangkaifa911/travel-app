import mongoose from 'mongoose'

const conversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,           // ⭐ 常用查询条件，加索引
    },
    title: {
      type: String,
      default: '新对话',
      trim: true,
      maxlength: 50,
    },
    lastMessage: {
      type: String,
      default: '',
    },
    messageCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
)

// 复合索引：按用户查会话，按更新时间倒序
conversationSchema.index({ userId: 1, updatedAt: -1 })

export default mongoose.model('Conversation', conversationSchema)