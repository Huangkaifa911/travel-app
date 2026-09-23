export class AppError extends Error {
  constructor(message, statusCode = 500, code = statusCode) {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.isOperational = true    // ⭐ 标记为"可预期的业务错误"
  }
}