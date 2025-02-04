const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user.model');

const Assessment = sequelize.define('Assessment', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  scores: {
    type: DataTypes.JSON,
    allowNull: false,
    validate: {
      isValidScores(value) {
        const requiredFields = ['health', 'career', 'finance', 'family', 
                              'relationships', 'growth', 'recreation', 'environment'];
        const isValid = requiredFields.every(field => {
          const score = value[field];
          return typeof score === 'number' && score >= 1 && score <= 10;
        });
        if (!isValid) {
          throw new Error('Invalid scores format');
        }
      }
    }
  }
});

// 建立关联关系
Assessment.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Assessment, { foreignKey: 'userId' });

module.exports = Assessment; 