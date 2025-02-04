// API 配置
const API_CONFIG = {
  development: {
    baseURL: 'http://localhost:3000/api'
  },
  production: {
    baseURL: 'https://wheel-of-life.onrender.com/api' // 这里需要替换为你的 Render.com 服务 URL
  }
};

// 获取当前环境的 API 配置
const getApiConfig = () => {
  const isProduction = window.location.hostname !== 'localhost';
  return API_CONFIG[isProduction ? 'production' : 'development'];
};

// API 请求工具
const api = {
  // 用户认证相关
  auth: {
    // 用户注册
    register: async (username, password) => {
      const response = await fetch(`${getApiConfig().baseURL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
      return response.json();
    },

    // 用户登录
    login: async (username, password) => {
      const response = await fetch(`${getApiConfig().baseURL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
      return response.json();
    },

    // 获取用户信息
    getProfile: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiConfig().baseURL}/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.json();
    }
  },

  // 评估相关
  assessment: {
    // 保存评估结果
    save: async (scores) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiConfig().baseURL}/assessments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ scores })
      });
      return response.json();
    },

    // 获取评估历史
    getHistory: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiConfig().baseURL}/assessments/history`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.json();
    },

    // 获取特定评估结果
    getById: async (id) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiConfig().baseURL}/assessments/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.json();
    }
  },

  // 管理员相关
  admin: {
    // 获取所有用户
    getAllUsers: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiConfig().baseURL}/users/all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.json();
    },

    // 获取所有评估结果
    getAllAssessments: async (startDate, endDate) => {
      const token = localStorage.getItem('token');
      let url = `${getApiConfig().baseURL}/assessments/admin/all`;
      if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
      }
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.json();
    },

    // 导出评估数据
    exportData: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiConfig().baseURL}/assessments/admin/export`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.blob();
    }
  }
}; 