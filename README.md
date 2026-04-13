# AI Chat - DeepSeek 对话助手

基于 Next.js + FastAPI + DeepSeek API 构建的全功能对话问答系统，支持对话模式和推理模式双服务。

## 技术栈

- **前端**: Next.js 16 (App Router) + Tailwind CSS v4 + TypeScript + Zustand
- **后端**: FastAPI + SQLAlchemy (async) + SQLite
- **LLM**: DeepSeek API（兼容 OpenAI SDK）
- **流式传输**: SSE (Server-Sent Events)
- **认证**: JWT (JSON Web Token) + bcrypt 密码哈希
- **渲染**: react-markdown + remark-gfm + rehype-highlight + KaTeX

## 快速开始

### 1. 配置 DeepSeek API Key

```bash
# backend/.env
DEEPSEEK_API_KEY=your_actual_api_key_here
DATABASE_URL=sqlite+aiosqlite:///./chat.db
JWT_SECRET_KEY=your_jwt_secret_here
```

### 2. 启动后端

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

后端服务地址: http://localhost:8000
API 文档: http://localhost:8000/docs

### 3. 启动前端

```bash
cd frontend
npm install
npm run dev
```

前端地址: http://localhost:3000

## 功能特性

### Phase 1: 基础对话
- **双模式切换**: 对话模式 (deepseek-chat) / 推理模式 (deepseek-reasoner)
- **流式输出**: SSE 实时逐字回复，打字机效果
- **思考过程展示**: 推理模式下可折叠的思考过程面板，显示思考耗时
- **消息持久化**: SQLite 存储所有对话记录
- **健康检查**: `GET /api/health` 检测服务和 API 连通性

### Phase 2: 用户认证
- **用户注册/登录**: JWT Token 认证
- **密码安全**: bcrypt 加密存储
- **路由守卫**: 前端 AuthGuard 组件，未登录自动跳转
- **Token 管理**: 自动携带 Token、401 自动登出

### Phase 3: 多会话管理
- **会话 CRUD**: 创建、查看、重命名、删除会话
- **侧边栏**: 会话列表，支持内联重命名和删除
- **动态路由**: `/chat` (新对话) 和 `/chat/[id]` (已有会话)
- **自动标题**: 第一条消息自动作为会话标题
- **Zustand 状态管理**: 全局会话和消息状态

### Phase 4: UI 打磨
- **Markdown 渲染**: react-markdown + GFM 表格/删除线 + 数学公式 (KaTeX)
- **代码高亮**: highlight.js 语法高亮 + 语言标签 + 一键复制
- **暖色科技感主题**: 深色背景 + 橙金渐变 + 发光效果 + 毛玻璃
- **响应式布局**: 桌面端/移动端自适应，侧边栏可收起
- **Toast 提示**: 操作反馈（复制、重命名、删除等）
- **确认弹窗**: 删除会话前确认，防误操作
- **智能滚动**: 手动上翻暂停自动滚动，回底部后恢复

## API 接口

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/health` | 健康检查 | 否 |
| POST | `/api/auth/register` | 用户注册 | 否 |
| POST | `/api/auth/login` | 用户登录 | 否 |
| GET | `/api/auth/me` | 获取当前用户 | 是 |
| GET | `/api/conversations` | 会话列表 | 是 |
| POST | `/api/conversations` | 创建会话 | 是 |
| GET | `/api/conversations/{id}` | 会话详情（含消息） | 是 |
| PUT | `/api/conversations/{id}` | 重命名会话 | 是 |
| DELETE | `/api/conversations/{id}` | 删除会话 | 是 |
| POST | `/api/chat/{conversation_id}` | 发送消息 (SSE 流式) | 是 |

## 项目结构

```
chatgpt-app/
├── frontend/                 # Next.js 前端
│   └── src/
│       ├── app/              # 页面路由
│       │   ├── chat/         # 对话页 (layout + page + [id])
│       │   ├── login/        # 登录页
│       │   └── register/     # 注册页
│       ├── components/       # 组件
│       │   ├── auth/         # AuthForm, AuthGuard
│       │   ├── chat/         # MessageBubble, ChatInput, ThinkingBlock, ModeSelector, MarkdownRenderer, CodeBlock
│       │   ├── layout/       # Header, Sidebar
│       │   └── ui/           # Toast, ConfirmDialog
│       ├── lib/              # 工具 (api, auth, store, utils)
│       └── types/            # TypeScript 类型
├── backend/                  # FastAPI 后端
│   └── app/
│       ├── models/           # 数据库模型 (User, Conversation, Message)
│       ├── routers/          # API 路由 (auth, chat, conversation, health)
│       ├── schemas/          # Pydantic 模型
│       ├── services/         # 业务逻辑 (auth_service, deepseek_service)
│       └── middleware/       # 认证中间件
└── README.md
```
