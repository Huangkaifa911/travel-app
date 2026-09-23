import express from 'express';
import travelService from '../services/travelService.js';
import conversationService from '../services/conversationService.js';
import streamResponse from '../utils/streamResponse.js';
import Conversation from '../models/Conversation.js';
import City from '../models/cityModels.js';
import { authMiddleware } from '../middlewares/auth.js';


const router = express.Router();

router.post('/recommend', async (req, res) => {
  console.log(req.body);
  // 结构出请求体中的目的地、预算和天数，并且进行校验
  const { destination, budget, days } = req.body;
  if (!destination || !budget || !days) {
    return res.status(400).json({ success: false, error: '请提供目的地、预算和天数' });
  }
  try {
      // 调用推荐服务
  const result = await travelService.recommend(destination, days, budget)
  // console.log(result);
  res.json({success: true, data: result});
  } catch (error) {
    res.status(500).json({ success: false, error: error.message, code: 500 });
  }
});

// router.post('/chat', async (req, res) => {
//   const { message } = req.body;
//   console.log('收到用户消息:', message);

//   try {
//     const stream = streamResponse(res);
//     const result = await travelService.chat(message, (chunk) => {
//       stream.send({ type: 'chunk', content: chunk });
//     });
//     stream.send({ type: 'end', content: result.response });
//     stream.end();
//   } catch (error) {
//     console.error('❌ Chat 路由异常:', error.message);
//     // 如果还没发送响应头，返回 JSON 错误
//     if (!res.headersSent) {
//       res.status(500).json({
//         success: false,
//         error: 'AI 服务暂时不可用，请检查控制台错误详情',
//         detail: error.message
//       });
//     } else {
//       // 如果已经开始流式，直接结束
//       res.end();
//     }
//   }
// });

  // 获取城市列表
  router.get('/cities', async (req, res) => {
    try {
          const cities = await City.find()
          res.json(
            {
              code: 200,
              success: true,
              data: cities
            }
          )
        } catch (error) {
          res.status(500).json({ success: false, error: error.message, code: 500 });
        }
  })

  router.post('/chat', authMiddleware, async (req, res) => {
    const { message, conversationId } = req.body
    if(!message) {
      return res.status(400).json({ success: false, error: '消息不能为空' })
    }

    try {
      let conversation = null
      if(conversationId) {
        // 有会话ID，查询会话是否存在
        conversation = await Conversation.findOne(
          { _id: conversationId, userId: req.userId }
        )
        if(!conversation) {
        return res.status(404).json({ success: false, error: '会话不存在' })
      }
      }else {
        // 首次对话，用第一条消息做标题
        const title = message.slice(0, 20)
        conversation = await conversationService.create(req.userId, title)
      }
      // 用户消息先落库
      await conversationService.appendMessage(conversation._id, 'user', message)

      // 简历see流
      const stream = streamResponse(res)
      // 先把conversationId 发给前端
      stream.send({ type: 'meta', conversationId: conversation._id.toString() })
      // 调用大模型,流式返回
      const result = await travelService.chat(message, (chunk) => {
        stream.send({ type: 'chunk', content: chunk })
      })
      // ai 完整回复也落库
      await conversationService.appendMessage(
        conversation._id,
        'assistant',
        result.response
      )

      // 流式结束
      stream.send({ type: 'end', })
      stream.end()
    } catch (error) {
      console.error('❌ Chat 路由异常:', error.message);
      // 如果还没发送响应头，返回 JSON 错误
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: 'AI 服务暂时不可用，请检查控制台错误详情',
          detail: error.message
        });
      } else {
        // 如果已经开始流式，直接结束
        res.end();
      }
    }
  })


export default router;

