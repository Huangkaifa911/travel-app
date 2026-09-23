import { config } from '../config/index.js'
import { AppError } from '../utils/AppError.js'

// 404 处理（放在所有路由之后）
export function notFoundHandler(req, res, next) {
  next(new AppError(`路由 ${req.originalUrl} 不存在`, 404))
}

// 全局错误处理（必须放在最后）
export function errorHandler(err, req, res, next) {
  const status = err.statusCode || 500

  // ⭐ 只有"可预期错误"才暴露 message，其他一律隐藏
  const message = err.isOperational ? err.message : '服务器内部错误'

  // 5xx 错误打日志（开发时方便排查）
  if (status >= 500) {
    console.error('[ERROR]', err)
  }

  res.status(status).json({
    code: status,
    success: false,
    data: null,
    message,
    // ⭐ 只在开发环境暴露堆栈，生产环境隐藏
    ...(config.nodeEnv === 'development' && !err.isOperational
      ? { stack: err.stack }
      : {}),
  })
}