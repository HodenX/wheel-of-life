require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const userRoutes = require('./routes/user.routes');
const assessmentRoutes = require('./routes/assessment.routes');

const app = express();

// 中间件
app.use(express.json());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:8000', 'https://hodenx.github.io'],
  credentials: true
}));

// 同步数据库
sequelize.sync({ alter: true })
  .then(() => {
    console.log('数据库同步完成');
  })
  .catch(err => {
    console.error('数据库同步失败:', err);
  });

// 路由
app.use('/api/users', userRoutes);
app.use('/api/assessments', assessmentRoutes);

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: '服务器内部错误', error: err.message });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
}); 