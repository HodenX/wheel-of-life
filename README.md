# Wheel of Life (生命之轮)

这是一个完整的生命之轮评估工具，包含前端界面和后端服务。

## 项目结构

```
wheel-of-life/
├── frontend/           # 前端代码
│   ├── index.html
│   ├── styles.css
│   └── script.js
└── server/            # 后端服务
    ├── src/
    │   └── index.js
    ├── package.json
    └── .env
```

## 功能特点

- 评估8个关键生活领域
- 交互式评分界面
- 可视化雷达图展示
- 用户认证系统
- 数据持久化存储
- 管理员数据统计
- 评估结果导出

## 本地开发

1. 安装依赖：

```bash
# 安装后端依赖
cd server
npm install

# 安装 MongoDB
# MacOS (使用 Homebrew)
brew tap mongodb/brew
brew install mongodb-community

# 启动 MongoDB
brew services start mongodb-community
```

2. 配置环境变量：
   - 复制 `server/.env.example` 到 `server/.env`
   - 根据需要修改配置

3. 启动服务：

```bash
# 启动后端服务
cd server
npm run dev

# 前端开发
cd frontend
# 使用任意 HTTP 服务器，例如：
python -m http.server 8000
```

## 部署

### 前端部署（GitHub Pages）

1. 前端代码位于 `frontend` 目录
2. GitHub Pages 将从此目录提供服务

### 后端部署

后端可以部署到任何支持 Node.js 的平台，例如：

1. Render.com（推荐，有免费计划）：
   - 创建新的 Web Service
   - 连接 GitHub 仓库
   - 设置构建命令：`cd server && npm install`
   - 设置启动命令：`cd server && npm start`

2. Heroku：
   - 创建新应用
   - 连接 GitHub 仓库
   - 设置构建命令和环境变量

3. Railway.app：
   - 导入 GitHub 仓库
   - 设置环境变量
   - 自动部署

## 环境变量

后端服务需要以下环境变量：

- `MONGODB_URI`: MongoDB 连接字符串
- `JWT_SECRET`: JWT 签名密钥
- `PORT`: 服务端口（可选，默认 3000）

## 管理员账户

1. 注册普通用户账户
2. 使用 MongoDB 命令行或图形界面工具
3. 更新用户记录：
```javascript
db.users.updateOne(
    { username: "您的用户名" },
    { $set: { isAdmin: true } }
)
```

## 使用方法

1. 访问网站
2. 注册/登录账户
3. 为每个生活领域评分（1-10分）
4. 查看生成的生命之轮图表
5. 保存或分享结果

## 生活领域说明

1. 健康与活力 (Health & Vitality)
2. 事业与工作 (Career & Work)
3. 财务状况 (Finance)
4. 家庭关系 (Family)
5. 人际关系 (Relationships)
6. 个人成长 (Personal Growth)
7. 休闲娱乐 (Recreation)
8. 生活环境 (Physical Environment) 