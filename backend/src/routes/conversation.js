import express from 'express';
import conversationService from '../services/conversationService.js';
import { authMiddleware } from '../middlewares/auth.js';


const router = express.Router();

// 所有会话接口都需要认证
router.use(authMiddleware)

// 列出会话
router.get('/', async (req, res, next) => {
  try {
    const list = await conversationService.list(req.userId)
    res.json({ success: true, data: list })
  } catch (error) {
    next(error)
  }
})

// 创建新会话
router.post('/', async (req, res, next) => {
  try {
    const conversation = await conversationService.create(req.userId)
    res.json({ success: true, data: conversation })
  } catch (error) {
    next(error)
  }
})

// 获取会话详情
router.get('/:id', async (req, res, next) => {
  try {
    const detail = await conversationService.getDetail(req.userId, req.params.id)
    res.json({ success: true, data: detail })
  } catch (error) {
    next(error)
  }
})

// 删除会话
router.delete('/:id', async (req, res, next) => {
  try {
    await conversationService.remove(req.userId, req.params.id)
    res.json({ success: true, message: '会话删除成功' })
  } catch (error) {
    next(error)
  }
})

export default router
