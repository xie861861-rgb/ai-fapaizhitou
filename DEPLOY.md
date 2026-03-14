# AI法拍智投 - 部署指南

## 项目状态：✅ 开发完成

### 服务地址
- **前端**: http://localhost:3000
- **后端 API**: http://localhost:3001
- **数据库**: ./data/ai-fapaizhitou.db (SQLite)

### 快速启动

```bash
# 1. 进入项目目录
cd ai-fapaizhitou

# 2. 安装依赖
npm install

# 3. 启动后端 (新终端)
npm run dev:server

# 4. 启动前端 (新终端)
npm run dev
```

### 环境变量 (.env.local)
```
PORT=3001
GEMINI_API_KEY=your-gemini-api-key  # 可选，用于 AI 分析
```

### 功能列表
- ✅ 房产列表展示 (从数据库加载)
- ✅ 房产详情查看
- ✅ AI 风险评估 (fallback 规则)
- ✅ 用户收藏功能
- ✅ 浏览历史记录
- ✅ 管理后台 (基础)

### API 接口
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/properties | 房产列表 |
| GET | /api/properties/:id | 房产详情 |
| GET | /api/properties/search?q= | 搜索房产 |
| POST | /api/analyses | 创建 AI 分析 |
| POST | /api/users/register | 用户注册 |
| POST | /api/users/login | 用户登录 |
| GET | /api/users/favorites | 获取收藏 |
| POST | /api/users/favorites | 添加收藏 |

### 技术栈
- 前端: React 19 + TypeScript + Vite + Tailwind CSS 4
- 后端: Express + TypeScript
- 数据库: SQLite (sql.js)
- AI: Gemini API (可选)

### 注意事项
1. 首次启动会自动创建数据库和示例数据
2. GEMINI_API_KEY 可选，不配置时使用规则引擎进行风险评估
3. 前端默认连接 localhost:3001 API
