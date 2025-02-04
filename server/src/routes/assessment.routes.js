const express = require('express');
const Assessment = require('../models/assessment.model');
const { authenticateToken, isAdmin } = require('../middleware/auth.middleware');
const router = express.Router();

// 保存评估结果
router.post('/', authenticateToken, async (req, res) => {
  try {
    const assessment = new Assessment({
      userId: req.user._id,
      scores: req.body.scores
    });
    await assessment.save();
    res.status(201).json(assessment);
  } catch (error) {
    res.status(500).json({ message: '保存评估失败', error: error.message });
  }
});

// 获取用户的评估历史
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const assessments = await Assessment.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    res.json(assessments);
  } catch (error) {
    res.status(500).json({ message: '获取评估历史失败', error: error.message });
  }
});

// 获取特定评估结果
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) {
      return res.status(404).json({ message: '评估结果不存在' });
    }
    
    // 检查权限
    if (assessment.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: '无权访问此评估结果' });
    }
    
    res.json(assessment);
  } catch (error) {
    res.status(500).json({ message: '获取评估结果失败', error: error.message });
  }
});

// 管理员获取所有评估结果
router.get('/admin/all', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = {};
    
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const assessments = await Assessment.find(query)
      .populate('userId', 'username')
      .sort({ createdAt: -1 });
      
    res.json(assessments);
  } catch (error) {
    res.status(500).json({ message: '获取评估结果失败', error: error.message });
  }
});

// 导出评估数据（CSV格式）
router.get('/admin/export', authenticateToken, isAdmin, async (req, res) => {
  try {
    const assessments = await Assessment.find()
      .populate('userId', 'username')
      .sort({ createdAt: -1 });

    // 生成 CSV 头
    const csvHeader = 'Username,Date,Health,Career,Finance,Family,Relationships,Growth,Recreation,Environment,Average\n';
    
    // 生成 CSV 数据
    const csvData = assessments.map(assessment => {
      const scores = assessment.scores;
      const average = Object.values(scores).reduce((a, b) => a + b) / 8;
      
      return `${assessment.userId.username},${assessment.createdAt.toISOString()},` +
        `${scores.health},${scores.career},${scores.finance},${scores.family},` +
        `${scores.relationships},${scores.growth},${scores.recreation},` +
        `${scores.environment},${average.toFixed(2)}`;
    }).join('\n');

    // 设置响应头
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=assessments.csv');

    // 发送 CSV 数据
    res.send(csvHeader + csvData);
  } catch (error) {
    res.status(500).json({ message: '导出数据失败', error: error.message });
  }
});

module.exports = router; 