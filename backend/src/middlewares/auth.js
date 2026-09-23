import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

export function authMiddleware(req, res, next) {
  // 1.检查请求头是否有token
  const head = req.headers.authorization || ''
  const token = head.startsWith('Bearer ') ? head.slice(7) : null
  if (!token) {
    return res.status(401).json({
      code: 401,
      success: false,
      data: null,
      message: '未登录',
    })
  }

  // 2.有token，验证token
  try {
    const payload = jwt.verify(token, config.jwtSecret)
    req.userId = payload.userId
    next()
  } catch (error) {
        // jwt.verify 抛错的原因有两种：
    // - TokenExpiredError：token 过期
    // - JsonWebTokenError：签名不对/格式错
    return res.status(401).json({
      code: 401,
      success: false,
      data: null,
      message: '登录过期',
    })
  }
  
}