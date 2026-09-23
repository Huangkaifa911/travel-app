import express from 'express';
import authService from '../services/authService.js';
import { authMiddleware } from '../middlewares/auth.js';
import User from '../models/User.js';

const router = express.Router();

// 注册
router.post('/register', async (req, res) => {
  try {
    const data = await authService.register(req.body);
    res.json({
      code: 200,
      success: true,
      data,
      message: '注册成功',
    });
  } catch (error) {
    res.status(400).json({
      code: 400,
      success: false,
      data: null,
      message: error.message,
    });
  }
})

// 登录
router.post('/login', async (req, res) => {
  try {
    const data = await authService.login(req.body);
    res.json({
      code: 200,
      success: true,
      data,
      message: '登录成功',
    });
  } catch (error) {
    res.status(400).json({
      code: 400,
      success: false,
      data: null,
      message: error.message,
    });
  }
})

// 获取用户信息
router.get('/me', authMiddleware, async (req, res) => {

try {
  const user = await User.findById(req.userId)
  if(!user) {
    return res.status(404).json({
      code: 404,
      success: false,
      data: null,
      message: '用户不存在',
    })
  }

  res.json({
    code: 200,
    success: true,
    data: {
      id: user._id,
      username: user.username,
      nickname: user.nickname,
    },
    message: '获取用户信息成功',
  })
} catch (error) {
  res.status(500).json({
    code: 500,
    success: false,
    data: null,
    message: error.message,
  })
}
})

export default router