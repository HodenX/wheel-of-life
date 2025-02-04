require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRoutes = require('./routes/user.routes');
const assessmentRoutes = require('./routes/assessment.routes');

const app = express();

// 中间件
app.use(express.json());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS.split(','),
  credentials: true
}));

// 数据库连接
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB 连接成功'))
  .catch(err => console.error('MongoDB 连接失败:', err));

// 用户模型
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false }
});

// 评估结果模型
const assessmentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: { type: Date, default: Date.now },
    scores: [Number],
    note: String
});

const User = mongoose.model('User', userSchema);
const Assessment = mongoose.model('Assessment', assessmentSchema);

// 身份验证中间件
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User.findById(decoded.id);
        
        if (!user) {
            throw new Error();
        }

        req.user = user;
        next();
    } catch (e) {
        res.status(401).send({ error: '请先登录' });
    }
};

// 管理员验证中间件
const adminAuth = async (req, res, next) => {
    try {
        if (!req.user.isAdmin) {
            throw new Error();
        }
        next();
    } catch (e) {
        res.status(403).send({ error: '需要管理员权限' });
    }
};

// 注册
app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 8);
        const user = new User({ username, password: hashedPassword });
        await user.save();
        
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'your-secret-key');
        res.status(201).send({ user, token });
    } catch (e) {
        res.status(400).send(e);
    }
});

// 登录
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        
        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new Error('用户名或密码错误');
        }
        
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'your-secret-key');
        res.send({ user, token });
    } catch (e) {
        res.status(400).send({ error: e.message });
    }
});

// 保存评估结果
app.post('/api/assessments', auth, async (req, res) => {
    try {
        const assessment = new Assessment({
            userId: req.user._id,
            scores: req.body.scores,
            note: req.body.note
        });
        await assessment.save();
        res.status(201).send(assessment);
    } catch (e) {
        res.status(400).send(e);
    }
});

// 获取用户的评估历史
app.get('/api/assessments', auth, async (req, res) => {
    try {
        const assessments = await Assessment.find({ userId: req.user._id }).sort({ date: -1 });
        res.send(assessments);
    } catch (e) {
        res.status(500).send(e);
    }
});

// 管理员：获取所有用户列表
app.get('/api/admin/users', auth, adminAuth, async (req, res) => {
    try {
        const users = await User.find({}, { password: 0 });
        res.send(users);
    } catch (e) {
        res.status(500).send(e);
    }
});

// 管理员：获取所有评估结果
app.get('/api/admin/assessments', auth, adminAuth, async (req, res) => {
    try {
        const { filter } = req.query;
        let query = {};
        
        if (filter === 'today') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            query.date = { $gte: today };
        } else if (filter === 'week') {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            query.date = { $gte: weekAgo };
        } else if (filter === 'month') {
            const monthAgo = new Date();
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            query.date = { $gte: monthAgo };
        }
        
        const assessments = await Assessment.find(query)
            .populate('userId', 'username')
            .sort({ date: -1 });
        res.send(assessments);
    } catch (e) {
        res.status(500).send(e);
    }
});

// 管理员：导出数据
app.get('/api/admin/export', auth, adminAuth, async (req, res) => {
    try {
        const assessments = await Assessment.find({})
            .populate('userId', 'username')
            .sort({ date: -1 });
            
        const csvData = [
            ['用户名', '日期', '健康与活力', '事业与工作', '财务状况', '家庭关系', 
             '人际关系', '个人成长', '休闲娱乐', '生活环境', '备注'].join(',')
        ];
        
        assessments.forEach(assessment => {
            const row = [
                assessment.userId.username,
                new Date(assessment.date).toLocaleDateString(),
                ...assessment.scores,
                assessment.note || ''
            ];
            csvData.push(row.join(','));
        });
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=assessments.csv');
        res.send(csvData.join('\n'));
    } catch (e) {
        res.status(500).send(e);
    }
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