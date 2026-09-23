import 'dotenv/config'

export const config = {
  port: process.env.PORT || 3000,
  mongoUrl: process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/hkfData',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me-later',
  jwtExpiresIn: '7d',
  nodeEnv: process.env.NODE_ENV || 'development',
}