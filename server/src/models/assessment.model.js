const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  scores: {
    health: {
      type: Number,
      required: true,
      min: 1,
      max: 10
    },
    career: {
      type: Number,
      required: true,
      min: 1,
      max: 10
    },
    finance: {
      type: Number,
      required: true,
      min: 1,
      max: 10
    },
    family: {
      type: Number,
      required: true,
      min: 1,
      max: 10
    },
    relationships: {
      type: Number,
      required: true,
      min: 1,
      max: 10
    },
    growth: {
      type: Number,
      required: true,
      min: 1,
      max: 10
    },
    recreation: {
      type: Number,
      required: true,
      min: 1,
      max: 10
    },
    environment: {
      type: Number,
      required: true,
      min: 1,
      max: 10
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 添加虚拟字段计算平均分
assessmentSchema.virtual('averageScore').get(function() {
  const scores = Object.values(this.scores);
  return scores.reduce((acc, curr) => acc + curr, 0) / scores.length;
});

const Assessment = mongoose.model('Assessment', assessmentSchema);

module.exports = Assessment; 