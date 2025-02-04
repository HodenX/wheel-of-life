const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { authenticateToken, isAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

// 用户注册
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // 检查用户是否已存在
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: '用户名已存在' });
    }

    // 创建新用户
    const user = new User({ username, password });
    await user.save();

    res.status(201).json({ message: '注册成功' });
  } catch (error) {
    res.status(500).json({ message: '注册失败', error: error.message });
  }
});

// 用户登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // 查找用户
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    // 验证密码
    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    // 生成 JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: '登录失败', error: error.message });
  }
});

// 获取用户信息
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: '获取用户信息失败', error: error.message });
  }
});

// 管理员获取所有用户列表
router.get('/all', authenticateToken, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: '获取用户列表失败', error: error.message });
  }
});

module.exports = router; 