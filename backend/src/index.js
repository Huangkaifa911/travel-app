import express from 'express';
import travelRouter from './routes/travel.js';
import authRouter from './routes/auth.js';
import tripPlanRouter from './routes/tripPlan.js';
import conversationRouter from './routes/conversation.js';
import { notFoundHandler, errorHandler } from './middlewares/errorHandler.js';

import 'dotenv/config';
// import cors from 'cors';
import connectDB from './utils/mongoDB.js';

// 创建Express应用
const app = express()
// 设置端口号
const port = process.env.PORT || 3000

// 允许跨域请求
// app.use(cors())

// 解析JSON请求体
app.use(express.json())
// 解析URL编码的请求体
app.use(express.urlencoded({ extended: true }))

// 静态文件服务
// 配置Express从public目录提供静态文件
app.use(express.static('public')); 

app.get('/', (req, res) => {
  res.send('Hello World');
});

// 挂载路由
app.use('/api/auth', authRouter)
app.use('/api/travel', travelRouter);
app.use('/api/conversations', conversationRouter);
app.use('/api/tripPlans', tripPlanRouter)

// 404 处理（放在所有路由之后）
app.use(notFoundHandler)

// 全局错误处理（必须放在最后）
app.use(errorHandler)



// app.listen(port, () => {
//   console.log(`Example app listening at http://localhost:${port}`);
// });

// 核心：使用 try-catch 包裹 await
try {
  // 1. 等待数据库连接成功
  await connectDB();
  // 2. 只有连接成功，才会执行到这里，启动服务器
  app.listen(port, () => {
    console.log(`🚀 服务器运行在 http://localhost:${port}`);
  });
} catch (error) {
  // 3. 如果连接失败，捕获错误，不启动服务器
  console.error('❌ 数据库连接失败，服务器未启动:', error);
  process.exit(1);
}