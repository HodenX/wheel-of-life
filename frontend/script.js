// API 配置
const API_CONFIG = {
    development: {
        baseUrl: 'http://localhost:3000/api'
    },
    production: {
        baseUrl: 'https://your-backend-url.com/api' // 这里需要替换为实际的后端服务地址
    }
};

// 获取当前环境的 API 配置
const getApiConfig = () => {
    const isProduction = window.location.hostname !== 'localhost' && 
                        !window.location.hostname.includes('127.0.0.1');
    return isProduction ? API_CONFIG.production : API_CONFIG.development;
};

// API 请求函数
const api = {
    async request(endpoint, options = {}) {
        const config = getApiConfig();
        const token = localStorage.getItem('token');
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
        };

        try {
            const response = await fetch(`${config.baseUrl}${endpoint}`, {
                ...defaultOptions,
                ...options
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    },

    // 用户相关 API
    async register(username, password) {
        return this.request('/register', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
    },

    async login(username, password) {
        return this.request('/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
    },

    // 评估相关 API
    async saveAssessment(scores, note) {
        return this.request('/assessments', {
            method: 'POST',
            body: JSON.stringify({ scores, note })
        });
    },

    async getAssessments() {
        return this.request('/assessments');
    },

    // 管理员 API
    async getUsers() {
        return this.request('/admin/users');
    },

    async getAdminAssessments(filter = 'all') {
        return this.request(`/admin/assessments?filter=${filter}`);
    },

    async exportData() {
        const config = getApiConfig();
        const token = localStorage.getItem('token');
        
        const response = await fetch(`${config.baseUrl}/admin/export`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return response.blob();
    }
};

document.addEventListener('DOMContentLoaded', function() {
    // 获取所有输入元素和显示值的元素
    const inputs = document.querySelectorAll('input[type="range"]');
    const values = document.querySelectorAll('.value');
    const saveBtn = document.getElementById('saveBtn');
    const shareBtn = document.getElementById('shareBtn');
    const resetBtn = document.getElementById('resetBtn');
    const helpModal = document.getElementById('helpModal');
    const shareModal = document.getElementById('shareModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalContent = document.getElementById('modalContent');
    const shareLink = document.getElementById('shareLink');
    const copyLinkBtn = document.getElementById('copyLink');
    const closeBtns = document.querySelectorAll('.close');

    // 检查是否是分享链接
    const urlParams = new URLSearchParams(window.location.search);
    const sharedData = urlParams.get('data');
    
    if (sharedData) {
        try {
            // 如果是分享链接，设置为只读模式
            document.querySelector('.container').classList.add('read-only');
            
            // 解码和解析分享数据
            const scores = JSON.parse(atob(sharedData));
            
            // 设置分数
            inputs.forEach((input, index) => {
                input.value = scores[index];
                values[index].textContent = scores[index];
            });
            
            // 更新图表
            updateChart();
        } catch (e) {
            console.error('Invalid share link');
        }
    }

    // 生命领域数据
    const areas = [
        '健康与活力',
        '事业与工作',
        '财务状况',
        '家庭关系',
        '人际关系',
        '个人成长',
        '休闲娱乐',
        '生活环境'
    ];

    // 领域说明数据
    const areaDescriptions = {
        health: {
            title: '健康与活力',
            content: `
                <p>这个领域关注您的身心健康状况，包括：</p>
                <ul>
                    <li>身体健康：体能状况、睡眠质量、饮食习惯</li>
                    <li>心理健康：压力管理、情绪状态、心理平衡</li>
                    <li>生活习惯：运动频率、作息规律、健康检查</li>
                </ul>
                <p>评分参考：</p>
                <ul>
                    <li>9-10分：有规律的运动习惯，饮食健康，睡眠充足，很少生病，心情愉悦</li>
                    <li>7-8分：基本保持健康的生活方式，偶尔运动，睡眠质量尚可</li>
                    <li>4-6分：作息不太规律，较少运动，有时会感到疲惫</li>
                    <li>1-3分：经常熬夜，没有运动习惯，常感身心疲惫</li>
                </ul>`
        },
        career: {
            title: '事业与工作',
            content: `
                <p>这个领域评估您的职业发展状况，包括：</p>
                <ul>
                    <li>工作满意度：工作内容、工作环境、团队关系</li>
                    <li>职业发展：晋升机会、技能提升、职业规划</li>
                    <li>工作价值：成就感、社会贡献、个人实现</li>
                </ul>
                <p>评分参考：</p>
                <ul>
                    <li>9-10分：工作富有挑战性且有成就感，有明确的职业发展路径</li>
                    <li>7-8分：对当前工作基本满意，能够胜任并有所成长</li>
                    <li>4-6分：工作一般，缺乏挑战或发展机会</li>
                    <li>1-3分：对工作非常不满意，无法实现个人价值</li>
                </ul>`
        },
        finance: {
            title: '财务状况',
            content: `
                <p>这个领域评估您的经济状况，包括：</p>
                <ul>
                    <li>收入水平：工资收入、被动收入、收入增长</li>
                    <li>财务管理：预算规划、支出控制、储蓄投资</li>
                    <li>财务安全：应急基金、保险保障、债务管理</li>
                </ul>
                <p>评分参考：</p>
                <ul>
                    <li>9-10分：收入充足且稳定，有良好的理财计划，无债务困扰</li>
                    <li>7-8分：收支平衡，有一定储蓄，财务状况稳定</li>
                    <li>4-6分：勉强维持收支平衡，储蓄较少</li>
                    <li>1-3分：入不敷出，负债较多，财务压力大</li>
                </ul>`
        },
        family: {
            title: '家庭关系',
            content: `
                <p>这个领域关注您与家人的关系，包括：</p>
                <ul>
                    <li>亲子关系：与子女的互动、教育参与</li>
                    <li>夫妻关系：感情交流、相互支持、共同成长</li>
                    <li>亲情关系：与父母、兄弟姐妹的联系</li>
                </ul>
                <p>评分参考：</p>
                <ul>
                    <li>9-10分：家庭关系和睦，沟通顺畅，能经常陪伴家人</li>
                    <li>7-8分：家庭关系良好，偶尔有矛盾但能及时化解</li>
                    <li>4-6分：家庭关系一般，沟通不足，聚少离多</li>
                    <li>1-3分：家庭关系紧张，矛盾较多，缺乏交流</li>
                </ul>`
        },
        relationships: {
            title: '人际关系',
            content: `
                <p>这个领域评估您的社交状况，包括：</p>
                <ul>
                    <li>朋友关系：交友质量、互动频率、情感支持</li>
                    <li>社交网络：社交圈子、人脉资源</li>
                    <li>人际技能：沟通能力、同理心、社交表现</li>
                </ul>
                <p>评分参考：</p>
                <ul>
                    <li>9-10分：有稳定的朋友圈，社交活跃，人际关系和谐</li>
                    <li>7-8分：有几个知心好友，社交较为顺畅</li>
                    <li>4-6分：社交圈较小，互动频率不高</li>
                    <li>1-3分：较少社交活动，感到孤独或社交压力</li>
                </ul>`
        },
        growth: {
            title: '个人成长',
            content: `
                <p>这个领域关注您的自我提升，包括：</p>
                <ul>
                    <li>学习进步：知识积累、技能提升、视野拓展</li>
                    <li>自我认知：价值观、人生目标、自我实现</li>
                    <li>个人发展：兴趣培养、才能发掘、潜能开发</li>
                </ul>
                <p>评分参考：</p>
                <ul>
                    <li>9-10分：持续学习成长，有明确的发展目标，不断突破自我</li>
                    <li>7-8分：保持学习习惯，有一定的成长计划</li>
                    <li>4-6分：偶尔学习，缺乏系统的提升计划</li>
                    <li>1-3分：很少投入时间在个人成长上，进步缓慢</li>
                </ul>`
        },
        recreation: {
            title: '休闲娱乐',
            content: `
                <p>这个领域评估您的生活品质，包括：</p>
                <ul>
                    <li>休闲活动：兴趣爱好、娱乐方式、放松方法</li>
                    <li>时间管理：工作与生活的平衡、休闲时间的安排</li>
                    <li>生活乐趣：快乐指数、生活满足感</li>
                </ul>
                <p>评分参考：</p>
                <ul>
                    <li>9-10分：有丰富的兴趣爱好，会合理安排休闲时间，生活充满乐趣</li>
                    <li>7-8分：能保持一定的休闲活动，生活较为充实</li>
                    <li>4-6分：休闲时间较少，生活略显单调</li>
                    <li>1-3分：几乎没有休闲活动，生活压力大</li>
                </ul>`
        },
        environment: {
            title: '生活环境',
            content: `
                <p>这个领域关注您的居住和生活环境，包括：</p>
                <ul>
                    <li>居住条件：住房情况、社区环境、生活便利度</li>
                    <li>工作环境：办公条件、通勤时间、工作氛围</li>
                    <li>自然环境：空气质量、绿化程度、环境卫生</li>
                </ul>
                <p>评分参考：</p>
                <ul>
                    <li>9-10分：居住环境舒适，生活便利，周边配套完善</li>
                    <li>7-8分：生活环境较好，基本满足需求</li>
                    <li>4-6分：环境一般，有些不便但可以接受</li>
                    <li>1-3分：环境较差，影响生活质量</li>
                </ul>`
        }
    };

    // 初始化图表
    const ctx = document.getElementById('wheelChart').getContext('2d');
    const wheelChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: areas,
            datasets: [{
                label: '生命之轮评分',
                data: Array(8).fill(5),
                backgroundColor: 'rgba(46, 204, 113, 0.2)',
                borderColor: 'rgba(46, 204, 113, 1)',
                pointBackgroundColor: 'rgba(46, 204, 113, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(46, 204, 113, 1)'
            }]
        },
        options: {
            scales: {
                r: {
                    angleLines: {
                        display: true
                    },
                    suggestedMin: 0,
                    suggestedMax: 10
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });

    // 更新图表数据
    function updateChart() {
        const newData = Array.from(inputs).map(input => parseInt(input.value));
        wheelChart.data.datasets[0].data = newData;
        wheelChart.update();
    }

    // 生成分享链接
    function generateShareLink() {
        const scores = Array.from(inputs).map(input => parseInt(input.value));
        const encodedData = btoa(JSON.stringify(scores));
        
        // 如果是在 GitHub Pages 上
        if (window.location.hostname.includes('github.io')) {
            return `${window.location.origin}${window.location.pathname}?data=${encodedData}`;
        }
        // 如果是本地开发环境，使用 GitHub Pages URL（请替换为您的 GitHub 用户名）
        else {
            // TODO: 将 YOUR_USERNAME 替换为您的 GitHub 用户名
            return `https://HodenX.github.io/wheel-of-life/?data=${encodedData}`;
        }
    }

    // 复制文本到剪贴板
    async function copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            alert('链接已复制到剪贴板！');
        } catch (err) {
            console.error('Failed to copy text: ', err);
            alert('复制失败，请手动复制链接。');
        }
    }

    // 为每个滑块添加事件监听器
    inputs.forEach((input, index) => {
        input.addEventListener('input', function() {
            values[index].textContent = this.value;
            updateChart();
        });
    });

    // 显示帮助说明
    document.querySelectorAll('.help-icon').forEach(icon => {
        icon.addEventListener('click', function() {
            const area = this.dataset.area;
            const description = areaDescriptions[area];
            modalTitle.textContent = description.title;
            modalContent.innerHTML = description.content;
            helpModal.style.display = 'block';
        });
    });

    // 显示分享弹窗
    shareBtn.addEventListener('click', function() {
        shareLink.value = generateShareLink();
        shareModal.style.display = 'block';
    });

    // 复制分享链接
    copyLinkBtn.addEventListener('click', function() {
        copyToClipboard(shareLink.value);
    });

    // 关闭弹窗
    closeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            helpModal.style.display = 'none';
            shareModal.style.display = 'none';
        });
    });

    // 点击弹窗外部关闭
    window.addEventListener('click', function(event) {
        if (event.target == helpModal) {
            helpModal.style.display = 'none';
        }
        if (event.target == shareModal) {
            shareModal.style.display = 'none';
        }
    });

    // 更新保存按钮的处理函数
    saveBtn.addEventListener('click', async function() {
        try {
            const scores = Array.from(inputs).map(input => parseInt(input.value));
            await api.saveAssessment(scores);
            alert('评估结果已保存！');
        } catch (error) {
            if (error.message.includes('401')) {
                alert('请先登录后再保存');
                document.getElementById('loginModal').style.display = 'block';
            } else {
                alert('保存失败，请稍后重试');
            }
        }
    });

    // 添加登录处理
    document.getElementById('submitLogin').addEventListener('click', async function() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        try {
            const response = await api.login(username, password);
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            document.getElementById('loginModal').style.display = 'none';
            updateAuthUI();
        } catch (error) {
            alert('登录失败：' + error.message);
        }
    });

    // 添加注册处理
    document.getElementById('submitRegister').addEventListener('click', async function() {
        const username = document.getElementById('newUsername').value;
        const password = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (password !== confirmPassword) {
            alert('两次输入的密码不一致');
            return;
        }
        
        try {
            const response = await api.register(username, password);
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            document.getElementById('registerModal').style.display = 'none';
            updateAuthUI();
        } catch (error) {
            alert('注册失败：' + error.message);
        }
    });

    // 更新界面显示
    function updateAuthUI() {
        const user = JSON.parse(localStorage.getItem('user'));
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        
        if (user) {
            loginBtn.textContent = '退出';
            registerBtn.style.display = 'none';
            
            if (user.isAdmin) {
                document.getElementById('adminPanel').style.display = 'block';
                loadAdminData();
            }
        } else {
            loginBtn.textContent = '登录';
            registerBtn.style.display = 'block';
            document.getElementById('adminPanel').style.display = 'none';
        }
    }

    // 加载管理员数据
    async function loadAdminData() {
        try {
            const assessments = await api.getAdminAssessments();
            displayAdminData(assessments);
        } catch (error) {
            console.error('Failed to load admin data:', error);
        }
    }

    // 显示管理员数据
    function displayAdminData(assessments) {
        const userList = document.getElementById('userList');
        userList.innerHTML = '';
        
        const users = new Map();
        assessments.forEach(assessment => {
            if (!users.has(assessment.userId._id)) {
                users.set(assessment.userId._id, {
                    username: assessment.userId.username,
                    assessments: []
                });
            }
            users.get(assessment.userId._id).assessments.push(assessment);
        });
        
        users.forEach((userData, userId) => {
            const userItem = document.createElement('div');
            userItem.className = 'user-item';
            userItem.textContent = userData.username;
            userItem.onclick = () => showUserDetails(userData);
            userList.appendChild(userItem);
        });
    }

    // 显示用户详细信息
    function showUserDetails(userData) {
        const userDetails = document.getElementById('userDetails');
        userDetails.innerHTML = `
            <h3>${userData.username} 的评估历史</h3>
            <div class="assessment-history">
                ${userData.assessments.map(assessment => `
                    <div class="assessment-card">
                        <div class="assessment-date">
                            ${new Date(assessment.date).toLocaleString()}
                        </div>
                        <canvas id="chart_${assessment._id}"></canvas>
                    </div>
                `).join('')}
            </div>
        `;
        
        // 为每个评估创建图表
        userData.assessments.forEach(assessment => {
            const ctx = document.getElementById(`chart_${assessment._id}`).getContext('2d');
            new Chart(ctx, {
                type: 'radar',
                data: {
                    labels: areas,
                    datasets: [{
                        label: '评分',
                        data: assessment.scores,
                        backgroundColor: 'rgba(46, 204, 113, 0.2)',
                        borderColor: 'rgba(46, 204, 113, 1)',
                        pointBackgroundColor: 'rgba(46, 204, 113, 1)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgba(46, 204, 113, 1)'
                    }]
                },
                options: {
                    scales: {
                        r: {
                            angleLines: { display: true },
                            suggestedMin: 0,
                            suggestedMax: 10
                        }
                    },
                    plugins: {
                        legend: { display: false }
                    }
                }
            });
        });
    }

    // 初始化界面
    updateAuthUI();

    // 重置所有值
    resetBtn.addEventListener('click', function() {
        if (confirm('确定要重置所有评分吗？')) {
            inputs.forEach((input, index) => {
                input.value = 5;
                values[index].textContent = '5';
            });
            updateChart();
        }
    });
}); 