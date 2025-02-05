// 全局状态
const state = {
  user: null,
  chart: null,
  scores: {
    health: {
      score: 5,
      subItems: {
        physical: { score: 5, weight: 0.4, label: '身体健康' },
        mental: { score: 5, weight: 0.3, label: '心理健康' },
        habits: { score: 5, weight: 0.3, label: '生活习惯' }
      }
    },
    career: {
      score: 5,
      subItems: {
        satisfaction: { score: 5, weight: 0.4, label: '工作满意度' },
        growth: { score: 5, weight: 0.3, label: '职业发展' },
        worklife: { score: 5, weight: 0.3, label: '工作生活平衡' }
      }
    },
    finance: {
      score: 5,
      subItems: {
        income: { score: 5, weight: 0.4, label: '收入水平' },
        savings: { score: 5, weight: 0.3, label: '储蓄投资' },
        planning: { score: 5, weight: 0.3, label: '财务规划' }
      }
    },
    family: {
      score: 5,
      subItems: {
        relationship: { score: 5, weight: 0.4, label: '家庭关系' },
        communication: { score: 5, weight: 0.3, label: '沟通质量' },
        support: { score: 5, weight: 0.3, label: '家庭支持' }
      }
    },
    relationships: {
      score: 5,
      subItems: {
        friends: { score: 5, weight: 0.4, label: '朋友关系' },
        social: { score: 5, weight: 0.3, label: '社交活动' },
        intimacy: { score: 5, weight: 0.3, label: '亲密关系' }
      }
    },
    growth: {
      score: 5,
      subItems: {
        learning: { score: 5, weight: 0.4, label: '学习进步' },
        skills: { score: 5, weight: 0.3, label: '技能提升' },
        mindset: { score: 5, weight: 0.3, label: '思维成长' }
      }
    },
    recreation: {
      score: 5,
      subItems: {
        hobbies: { score: 5, weight: 0.4, label: '兴趣爱好' },
        relaxation: { score: 5, weight: 0.3, label: '休闲放松' },
        entertainment: { score: 5, weight: 0.3, label: '娱乐活动' }
      }
    },
    environment: {
      score: 5,
      subItems: {
        living: { score: 5, weight: 0.4, label: '居住环境' },
        community: { score: 5, weight: 0.3, label: '社区氛围' },
        facilities: { score: 5, weight: 0.3, label: '配套设施' }
      }
    }
  }
};

// DOM 元素
const elements = {
  loginBtn: document.getElementById('loginBtn'),
  registerBtn: document.getElementById('registerBtn'),
  loginModal: document.getElementById('loginModal'),
  registerModal: document.getElementById('registerModal'),
  submitLogin: document.getElementById('submitLogin'),
  submitRegister: document.getElementById('submitRegister'),
  adminPanel: document.getElementById('adminPanel'),
  userFilter: document.getElementById('userFilter'),
  exportData: document.getElementById('exportData'),
  saveBtn: document.getElementById('saveBtn'),
  shareBtn: document.getElementById('shareBtn'),
  resetBtn: document.getElementById('resetBtn'),
  closeButtons: document.querySelectorAll('.close'),
  wheelChart: document.getElementById('wheelChart')
};

// 初始化图表
function initChart() {
  const ctx = elements.wheelChart.getContext('2d');
  state.chart = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['健康与活力', '事业与工作', '财务状况', '家庭关系', 
               '人际关系', '个人成长', '休闲娱乐', '生活环境'],
      datasets: [{
        label: '生命之轮评分',
        data: Object.values(state.scores),
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(54, 162, 235, 1)'
      }]
    },
    options: {
      scale: {
        ticks: {
          beginAtZero: true,
          max: 10,
          min: 0,
          stepSize: 1,
          font: {
            size: 12
          }
        }
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            font: {
              size: 14
            }
          }
        },
        tooltip: {
          enabled: true,
          callbacks: {
            label: function(context) {
              return `分数: ${context.raw}`;
            }
          }
        }
      },
      maintainAspectRatio: true,
      responsive: true
    }
  });
}

// 计算主项得分
function calculateMainScore(area) {
  const subItems = state.scores[area].subItems;
  let totalScore = 0;
  for (const item in subItems) {
    totalScore += subItems[item].score * subItems[item].weight;
  }
  state.scores[area].score = Math.round(totalScore);
}

// 更新图表数据
function updateChart() {
  const mainScores = Object.keys(state.scores).map(area => state.scores[area].score);
  state.chart.data.datasets[0].data = mainScores;
  state.chart.update();
}

// 初始化滑块事件监听
function initSliders() {
  Object.keys(state.scores).forEach(area => {
    const areaDiv = document.createElement('div');
    areaDiv.className = 'area-container';
    areaDiv.innerHTML = `
      <h3>${getAreaLabel(area)}</h3>
      <div class="sub-items">
        ${Object.entries(state.scores[area].subItems).map(([key, item]) => `
          <div class="sub-item">
            <label>${item.label}</label>
            <input type="range" min="1" max="10" value="${item.score}" 
                   id="${area}-${key}" class="slider">
            <span class="score-value">${item.score}</span>
          </div>
        `).join('')}
      </div>
      <div class="main-score">
        <strong>总评分：</strong>
        <span id="${area}-main-score">${state.scores[area].score}</span>
      </div>
    `;
    
    document.getElementById('sliders-container').appendChild(areaDiv);
    
    // 为子项滑块添加事件监听
    Object.keys(state.scores[area].subItems).forEach(subItem => {
      const slider = document.getElementById(`${area}-${subItem}`);
      const value = slider.nextElementSibling;
      
      slider.addEventListener('input', (e) => {
        const score = parseInt(e.target.value);
        state.scores[area].subItems[subItem].score = score;
        value.textContent = score;
        calculateMainScore(area);
        document.getElementById(`${area}-main-score`).textContent = state.scores[area].score;
        updateChart();
      });
    });
  });
}

// 获取领域标签
function getAreaLabel(area) {
  const labels = {
    health: '健康与活力',
    career: '事业与工作',
    finance: '财务状况',
    family: '家庭关系',
    relationships: '人际关系',
    growth: '个人成长',
    recreation: '休闲娱乐',
    environment: '生活环境'
  };
  return labels[area];
}

// 用户认证相关函数
const auth = {
  // 检查登录状态
  checkAuthStatus: async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const userData = await api.auth.getProfile();
        state.user = userData;
        updateUIForLoggedInUser();
      } catch (error) {
        console.error('认证失败:', error);
        localStorage.removeItem('token');
      }
    }
  },

  // 登录处理
  handleLogin: async (username, password) => {
    try {
      const response = await api.auth.login(username, password);
      if (response.token) {
        localStorage.setItem('token', response.token);
        state.user = response.user;
        updateUIForLoggedInUser();
        closeModal(elements.loginModal);
      }
    } catch (error) {
      alert('登录失败: ' + error.message);
    }
  },

  // 注册处理
  handleRegister: async (username, password) => {
    try {
      await api.auth.register(username, password);
      alert('注册成功，请登录');
      closeModal(elements.registerModal);
      openModal(elements.loginModal);
    } catch (error) {
      alert('注册失败: ' + error.message);
    }
  },

  // 登出处理
  handleLogout: () => {
    localStorage.removeItem('token');
    state.user = null;
    updateUIForLoggedOutUser();
  }
};

// 评估相关函数
const assessment = {
  // 保存评估结果
  save: async () => {
    if (!state.user) {
      alert('请先登录');
      openModal(elements.loginModal);
      return;
    }

    try {
      await api.assessment.save(state.scores);
      alert('评估结果保存成功');
    } catch (error) {
      alert('保存失败: ' + error.message);
    }
  },

  // 分享评估结果
  share: () => {
    const shareLink = generateShareLink();
    const shareLinkInput = document.getElementById('shareLink');
    shareLinkInput.value = shareLink;
    openModal(document.getElementById('shareModal'));
  },

  // 重置评估
  reset: () => {
    Object.keys(state.scores).forEach(area => {
      state.scores[area].score = 5;
      state.scores[area].subItems = {
        physical: { score: 5, weight: 0.4, label: '身体健康' },
        mental: { score: 5, weight: 0.3, label: '心理健康' },
        habits: { score: 5, weight: 0.3, label: '生活习惯' }
      };
      const areaDiv = document.querySelector(`.area-container[data-area="${area}"]`);
      if (areaDiv) {
        const subItems = areaDiv.querySelectorAll('.sub-item');
        subItems.forEach(item => {
          const slider = item.querySelector('.slider');
          slider.value = 5;
          const value = item.querySelector('.score-value');
          value.textContent = 5;
        });
        const mainScore = areaDiv.querySelector('.main-score');
        mainScore.querySelector('span').textContent = 5;
      }
    });
    updateChart();
  }
};

// 管理员相关函数
const admin = {
  // 初始化管理员面板
  init: async () => {
    if (state.user?.role !== 'admin') return;
    
    elements.adminPanel.style.display = 'block';
    await admin.loadUsers();
    admin.setupEventListeners();
  },

  // 加载用户列表
  loadUsers: async () => {
    try {
      const users = await api.admin.getAllUsers();
      const userList = document.getElementById('userList');
      userList.innerHTML = users.map(user => `
        <div class="user-item" data-id="${user._id}">
          <span>${user.username}</span>
          <span>${new Date(user.createdAt).toLocaleDateString()}</span>
        </div>
      `).join('');
    } catch (error) {
      console.error('加载用户列表失败:', error);
    }
  },

  // 导出数据
  exportData: async () => {
    try {
      const blob = await api.admin.exportData();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'assessments.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      alert('导出失败: ' + error.message);
    }
  },

  // 设置事件监听
  setupEventListeners: () => {
    elements.userFilter.addEventListener('change', admin.filterAssessments);
    elements.exportData.addEventListener('click', admin.exportData);
  },

  // 筛选评估结果
  filterAssessments: async (event) => {
    const filter = event.target.value;
    let startDate, endDate;

    switch (filter) {
      case 'today':
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'week':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        endDate = new Date();
        break;
      case 'month':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        endDate = new Date();
        break;
    }

    try {
      const assessments = await api.admin.getAllAssessments(startDate, endDate);
      admin.displayAssessments(assessments);
    } catch (error) {
      console.error('筛选评估结果失败:', error);
    }
  },

  // 显示评估结果
  displayAssessments: (assessments) => {
    const userDetails = document.getElementById('userDetails');
    userDetails.innerHTML = assessments.map(assessment => `
      <div class="assessment-card">
        <div class="assessment-date">
          ${new Date(assessment.createdAt).toLocaleString()}
        </div>
        <div class="assessment-scores">
          <div>健康与活力: ${assessment.scores.health}</div>
          <div>事业与工作: ${assessment.scores.career}</div>
          <div>财务状况: ${assessment.scores.finance}</div>
          <div>家庭关系: ${assessment.scores.family}</div>
          <div>人际关系: ${assessment.scores.relationships}</div>
          <div>个人成长: ${assessment.scores.growth}</div>
          <div>休闲娱乐: ${assessment.scores.recreation}</div>
          <div>生活环境: ${assessment.scores.environment}</div>
        </div>
      </div>
    `).join('');
  }
};

// UI 更新函数
function updateUIForLoggedInUser() {
  elements.loginBtn.style.display = 'none';
  elements.registerBtn.style.display = 'none';
  const authButtons = document.querySelector('.auth-buttons');
  
  // 添加用户名显示和登出按钮
  if (!document.getElementById('userInfo')) {
    const userInfo = document.createElement('div');
    userInfo.id = 'userInfo';
    userInfo.innerHTML = `
      <span>欢迎, ${state.user.username}</span>
      <button id="logoutBtn" class="auth-btn">登出</button>
    `;
    authButtons.appendChild(userInfo);
    
    document.getElementById('logoutBtn').addEventListener('click', auth.handleLogout);
  }

  // 如果是管理员，显示管理员面板
  if (state.user.role === 'admin') {
    admin.init();
  }
}

function updateUIForLoggedOutUser() {
  elements.loginBtn.style.display = 'inline-block';
  elements.registerBtn.style.display = 'inline-block';
  const userInfo = document.getElementById('userInfo');
  if (userInfo) {
    userInfo.remove();
  }
  elements.adminPanel.style.display = 'none';
}

// 模态框相关函数
function openModal(modal) {
  modal.style.display = 'block';
}

function closeModal(modal) {
  modal.style.display = 'none';
}

// 生成分享链接
function generateShareLink() {
  const baseUrl = window.location.origin + window.location.pathname;
  const params = new URLSearchParams();
  Object.entries(state.scores).forEach(([key, value]) => {
    params.append(key, value);
  });
  return `${baseUrl}?${params.toString()}`;
}

// 从 URL 加载分享的评估结果
function loadSharedAssessment() {
  const params = new URLSearchParams(window.location.search);
  let hasParams = false;

  Object.keys(state.scores).forEach(area => {
    const value = params.get(area);
    if (value) {
      hasParams = true;
      const score = parseInt(value);
      state.scores[area].score = score;
      state.scores[area].subItems = {
        physical: { score: 5, weight: 0.4, label: '身体健康' },
        mental: { score: 5, weight: 0.3, label: '心理健康' },
        habits: { score: 5, weight: 0.3, label: '生活习惯' }
      };
      const areaDiv = document.querySelector(`.area-container[data-area="${area}"]`);
      if (areaDiv) {
        const subItems = areaDiv.querySelectorAll('.sub-item');
        subItems.forEach(item => {
          const slider = item.querySelector('.slider');
          slider.value = score;
          const value = item.querySelector('.score-value');
          value.textContent = score;
        });
        const mainScore = areaDiv.querySelector('.main-score');
        mainScore.querySelector('span').textContent = score;
      }
    }
  });

  if (hasParams) {
    updateChart();
    document.querySelector('.container').classList.add('read-only');
  }
}

// 初始化应用
function initApp() {
  initChart();
  initSliders();
  auth.checkAuthStatus();
  loadSharedAssessment();

  // 绑定按钮事件
  elements.saveBtn.addEventListener('click', assessment.save);
  elements.shareBtn.addEventListener('click', assessment.share);
  elements.resetBtn.addEventListener('click', assessment.reset);
  elements.loginBtn.addEventListener('click', () => openModal(elements.loginModal));
  elements.registerBtn.addEventListener('click', () => openModal(elements.registerModal));
  elements.submitLogin.addEventListener('click', () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    auth.handleLogin(username, password);
  });
  elements.submitRegister.addEventListener('click', () => {
    const username = document.getElementById('newUsername').value;
    const password = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    if (password !== confirmPassword) {
      alert('两次输入的密码不一致');
      return;
    }
    auth.handleRegister(username, password);
  });

  // 绑定关闭按钮事件
  elements.closeButtons.forEach(button => {
    button.addEventListener('click', () => {
      const modal = button.closest('.modal');
      closeModal(modal);
    });
  });
}

// 在DOM加载完成后初始化应用
document.addEventListener('DOMContentLoaded', initApp); 