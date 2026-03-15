# AI法拍智投

> 基于AI智能分析的司法拍卖房产投资平台

[![GitHub stars](https://img.shields.io/github/stars/xie861861-rgb/ai-fapaizhitou)](https://github.com/xie861861-rgb/ai-fapaizhitou)
[![License](https://img.shields.io/github/license/xie861861-rgb/ai-fapaizhitou)](LICENSE)

## ✨ 特性

- 🤖 **AI智能分析** - 深度评估法拍房风险和投资价值
- 💬 **智能对话** - AI助手实时解答法拍房问题
- 📊 **数据分析** - 市场趋势、地区热度实时监控
- 👤 **用户系统** - 注册登录、积分充值、会员中心
- ⚙️ **管理后台** - 用户管理、房产管理、数据统计

## 🏗️ 技术栈

### 前端
- React 19
- TypeScript
- Vite
- Tailwind CSS
- Motion (动画)

### 后端
- Node.js
- Express
- SQLite (sql.js)
- MiniMax AI API

## 📁 项目结构

```
ai-fapaizhitou/
├── src/                      # 前端源码
│   ├── components/           # React组件
│   │   ├── AdminDashboard.tsx    # 管理后台
│   │   ├── AnalysisWorkflow.tsx   # AI分析流程
│   │   ├── Layout.tsx            # 布局组件
│   │   ├── MarketAnalysis.tsx    # 市场分析
│   │   ├── MemberCenter.tsx      # 会员中心
│   │   ├── PropertyDetail.tsx     # 房产详情
│   │   └── Workbench.tsx         # 工作台
│   ├── lib/                 # 工具函数
│   │   ├── api.ts           # API封装
│   │   └── utils.ts        # 工具函数
│   ├── types/               # 类型定义
│   ├── App.tsx              # 主应用
│   └── main.tsx             # 入口文件
│
├── server/                  # 后端源码
│   ├── routes/              # API路由
│   │   ├── admin.ts         # 管理后台API
│   │   ├── analyses.ts      # AI分析API
│   │   ├── chat.ts          # AI对话API
│   │   ├── properties.ts    # 房产API
│   │   └── users.ts         # 用户API
│   ├── services/            # 业务服务
│   │   └── ai.ts           # AI分析服务
│   ├── db/                  # 数据库
│   │   └── index.ts         # 数据库初始化
│   └── index.ts             # 服务入口
│
├── dist/                    # 构建产物
├── data/                    # 数据文件
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
# 启动后端 (端口 3001)
npm run dev:server

# 启动前端 (端口 3000)
npm run dev
```

### 生产构建

```bash
# 构建前端
npm run build

# 启动生产服务
npm run start
```

## 🔧 配置

### 环境变量

在项目根目录创建 `.env` 文件：

```env
# MiniMax AI API (可选，不配置使用默认分析)
MINIMAX_API_KEY=your-api-key
MINIMAX_MODEL=MiniMax-M2.5

# 服务器端口
PORT=3001
```

## 📱 功能说明

### 用户系统
- ✅ 用户注册/登录
- ✅ Token 认证
- ✅ 密码找回
- ✅ 积分充值

### AI 功能
- ✅ 房产深度分析
- ✅ 风险评估
- ✅ 价格预测
- ✅ AI 智能对话

### 管理后台
- ✅ 数据统计
- ✅ 用户管理
- ✅ 房产管理
- ✅ 分析记录

## 📄 API 文档

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/users/register` | POST | 用户注册 |
| `/api/users/login` | POST | 用户登录 |
| `/api/users/me` | GET | 获取当前用户 |
| `/api/properties` | GET | 获取房产列表 |
| `/api/analyses` | POST | 创建AI分析 |
| `/api/chat/chat` | POST | AI对话 |

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## �许可证

MIT License - 查看 [LICENSE](LICENSE) 文件

---

Made with ❤️ by AI法拍智投团队
