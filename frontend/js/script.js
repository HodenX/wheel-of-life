// 全局状态
const state = {
  user: null,
  chart: null,
  scores: {
    health: 5,
    career: 5,
    finance: 5,
    family: 5,
    relationships: 5,
    growth: 5,
    recreation: 5,
    environment: 5
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
          stepSize: 1
        }
      }
    }
  });
}

// 更新图表数据
function updateChart() {
  state.chart.data.datasets[0].data = Object.values(state.scores);
  state.chart.update();
}

// 初始化滑块事件监听
function initSliders() {
  Object.keys(state.scores).forEach(area => {
    const slider = document.getElementById(area);
    const value = slider.nextElementSibling;
    
    slider.addEventListener('input', (e) => {
      const score = parseInt(e.target.value);
      state.scores[area] = score;
      value.textContent = score;
      updateChart();
    });
  });
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
      state.scores[area] = 5;
      const slider = document.getElementById(area);
      slider.value = 5;
      slider.nextElementSibling.textContent = 5;
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
      state.scores[area] = score;
      const slider = document.getElementById(area);
      slider.value = score;
      slider.nextElementSibling.textContent = score;
    }
  });

  if (hasParams) {
    updateChart();
    document.querySelector('.container').classList.add('read-only');
  }
}

// 事件监听设置
function setupEventListeners() {
  // 认证相关
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

  // 关闭按钮
  elements.closeButtons.forEach(button => {
    button.addEventListener('click', () => {
      const modal = button.closest('.modal');
      closeModal(modal);
    });
  });

  // 操作按钮
  elements.saveBtn.addEventListener('click', assessment.save);
  elements.shareBtn.addEventListener('click', assessment.share);
  elements.resetBtn.addEventListener('click', assessment.reset);

  // 复制分享链接
  document.getElementById('copyLink').addEventListener('click', () => {
    const shareLink = document.getElementById('shareLink');
    shareLink.select();
    document.execCommand('copy');
    alert('链接已复制到剪贴板');
  });

  // 帮助图标
  document.querySelectorAll('.help-icon').forEach(icon => {
    icon.addEventListener('click', () => {
      const area = icon.dataset.area;
      showHelp(area);
    });
  });
}

// 显示帮助信息
function showHelp(area) {
  const helpContent = {
    health: {
      title: '健康与活力',
      content: `
        <p>评估您的身体和精神健康状况：</p>
        <ul>
          <li>体能和精力水平</li>
          <li>睡眠质量</li>
          <li>饮食习惯</li>
          <li>运动频率</li>
          <li>压力管理</li>
        </ul>
      `
    },
    // ... 其他领域的帮助内容
  };

  const content = helpContent[area];
  if (content) {
    document.getElementById('modalTitle').textContent = content.title;
    document.getElementById('modalContent').innerHTML = content.content;
    openModal(document.getElementById('helpModal'));
  }
}

// 初始化应用
async function initApp() {
  initChart();
  initSliders();
  setupEventListeners();
  await auth.checkAuthStatus();
  loadSharedAssessment();
}

// 启动应用
document.addEventListener('DOMContentLoaded', initApp); 