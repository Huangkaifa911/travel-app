# AI 旅行规划平台

基于 AI 的智能旅行规划应用，支持行程生成、AI 对话、行程收藏。

## 技术栈

- **前端**：Vue 3 + Vite + Vant + Pinia + Vue Router
- **后端**：Express + MongoDB + Mongoose + JWT
- **AI**：LangChain + 硅基流动（Qwen2.5）

## 功能

- 用户注册登录（JWT 鉴权 + 路由守卫）
- AI 生成详细行程（多时段、多活动、带预算）
- AI 旅行问答（SSE 流式输出 + Markdown 渲染）
- 多会话持久化（会话列表 + 历史消息）
- 行程收藏（我的行程）

## 项目结构

travel-app/
├── frontend/    # Vue 前端
└── backend/     # Express 后端

## 本地运行

### 后端

cd backend
npm install
cp .env.example .env    # 填入真实的 MONGO_URL、API Key 等
npm run dev

### 前端

cd frontend
npm install
npm run dev