# 生命之轮评估工具

一个帮助用户评估和平衡生活各个方面的在线工具。用户可以对健康、事业、财务等八个维度进行评分，生成可视化的生命之轮图表，并可以保存、分享评估结果。

## 功能特点

- 八个维度的生活评估
- 雷达图可视化展示
- 用户注册和登录
- 评估结果保存
- 历史记录查看
- 结果分享功能
- 管理员数据统计

## 技术栈

### 前端
- HTML5
- CSS3
- JavaScript
- Chart.js（图表可视化）

### 后端
- Node.js
- Express
- MongoDB
- JWT（用户认证）

## 本地开发

1. 克隆项目
```bash
git clone https://github.com/HodenX/wheel-of-life.git
cd wheel-of-life
```

2. 安装依赖
```bash
# 安装后端依赖
cd server
npm install

# 安装前端依赖（如果需要）
cd ../frontend
# 如果使用 npm
npm install
```

3. 配置环境变量
```bash
# 在 server 目录下创建 .env 文件
cp .env.example .env
# 编辑 .env 文件，填入必要的配置信息
```

4. 启动服务
```bash
# 启动后端服务（在 server 目录下）
npm start

# 启动前端服务（在 frontend 目录下）
# 可以使用任何静态文件服务器，例如：
python -m http.server 8000
```

5. 访问应用
打开浏览器访问 `http://localhost:8000`

## 部署

### 前端部署
前端代码部署在 GitHub Pages 上：
1. 将代码推送到 GitHub 仓库
2. 在仓库设置中启用 GitHub Pages
3. 选择部署分支和目录

### 后端部署
后端服务部署在 Render.com 上：
1. 在 Render.com 创建新的 Web Service
2. 连接 GitHub 仓库
3. 设置环境变量
4. 部署服务

## 环境变量

后端服务需要以下环境变量：

- `PORT`: 服务器端口
- `NODE_ENV`: 运行环境（development/production）
- `MONGODB_URI`: MongoDB 连接字符串
- `JWT_SECRET`: JWT 密钥
- `JWT_EXPIRES_IN`: Token 过期时间
- `ALLOWED_ORIGINS`: 允许的跨域来源

## 使用说明

1. 注册/登录：点击右上角的注册/登录按钮
2. 评估：使用滑块为每个维度打分（1-10分）
3. 保存：登录后可以保存评估结果
4. 分享：点击分享按钮生成分享链接
5. 查看历史：在个人中心查看历史评估记录

## 管理员功能

管理员用户可以：
- 查看所有用户的评估数据
- 按时间筛选评估结果
- 导出数据为 CSV 格式

## 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交改动
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License 