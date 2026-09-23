// cloud-functions/express/[[default]].js
import express from 'express'
import cors from 'cors'

// ⭐ 从 backend/src 里 import 你现有的代码
import authRouter from '../../backend/src/routes/auth.js'
import travelRouter from '../../backend/src/routes/travel.js'
import conversationRouter from '../../backend/src/routes/conversation.js'
import tripPlanRouter from '../../backend/src/routes/tripPlan.js'
import { responseMiddleware } from '../../backend/src/middlewares/response.js'
import { notFoundHandler, errorHandler } from '../../backend/src/middlewares/errorHandler.js'
import connectDB from '../../backend/src/utils/mongoDB.js'

const app = express()

app.use(cors({ origin: true, credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 每次冷启动时确保数据库连接（EdgeOne 环境变量里配 MONGO_URL）
connectDB().catch((err) => {
  console.error('MongoDB 连接失败:', err.message)
})

app.get('/', (req, res) => res.send('Hello from Express on EdgeOne!'))

// 挂载路由（注意：这里不带 /api 前缀，因为文件路径已经决定了路由）
// 实际访问路径 = https://你的域名.edgeone.app/express/api/auth/login
app.use('/api/auth', authRouter)
app.use('/api/travel', travelRouter)
app.use('/api/conversations', conversationRouter)
app.use('/api/tripPlans', tripPlanRouter)

app.use(notFoundHandler)
app.use(errorHandler)

// ⭐ 关键：导出 app，不要 app.listen()
export default app