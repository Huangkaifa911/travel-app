import Conversation from '../models/Conversation.js'
import Message from '../models/Message.js'
import { AppError } from '../utils/AppError.js'

class ConversationService {
  // 创建新会话
  async create(userId, title = '新对话') {
    return await Conversation.create({
      userId,
      title,
      lastMessage: '',
      messageCount: 0,
    })
  }

  // 列出所有的会话 （按最近活跃排序）
  async list(userId) {
    // lean() 让结果变成普通 JS 对象，比 Mongoose 文档轻量
    return await Conversation.find({ userId }).sort({ updatedAt: -1 }).lean()
  }

  // 获取会话详情(含消息列表)
  async getDetail(userId, conversationId) {
    const coversation = await Conversation.findOne(
      {_id: conversationId, userId: userId}
    )
    if (!coversation) {
      throw new AppError('会话不存在', 404)
    }
    // 查找会话下的所有消息
    const messages = await Message.find(
      { conversationId: conversationId }
    ).sort({ createdAt: 1 }).lean()
    return { coversation, messages}
  }

  // 删除会话及其所有消息
  async remove(userId, conversationId) {
    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId: userId,
    })
    if (!conversation) {
      throw new AppError('会话不存在', 404)
    }

    // 删除对应会话和所有消息
    await conversation.deleteOne()
    await Message.deleteMany({ conversationId })
  }

  //添加消息
  async appendMessage(conversationId, role, content) {
    const message = await Message.create({
      conversationId,
      role,
      content,
    })
    // 更新会话的预览和计数
    await Conversation.updateOne(
      { _id: conversationId },
      {
        $inc: { messageCount: 1 },     // 计数 +1
        $set: {
          lastMessage: content.slice(0, 50),   // 只存前 50 个字做预览
          updatedAt: new Date(),               // 触发"最近活跃"
        },
      }
    )
    return message
  }

}

export default new ConversationService()
