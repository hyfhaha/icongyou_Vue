import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  // 1. State: 用户信息
  // 字段严格对应数据库 `user` 表结构
  const userInfo = ref({
    id: null,             // 对应 user.id
    username: '',         // 对应 user.username (账号)
    nickname: '未登录',    // 对应 user.nickname (显示名称)
    jobNumber: '',        // 对应 user.job_number (学号/工号)
    avatarUrl: '',        // 对应 user.avatar_url
    deptId: null,         // 对应 user.dept_id (班级/组织ID)
    userRole: 0           // 对应 user.user_role (0:学生, 1:教师...)
  });

  const userStats = ref({
    courseCount: 0,    // 课程数
    completedTasks: 0, // 已完成任务
    avgScore: 0        // 平均分
  });

  // 登录凭证 (前端鉴权核心)
  const token = ref('');

  // 2. Action: 登录
  // 参数 userData: 未来后端 API 返回的完整 JSON 对象
  const login = (userData) => {
    // 如果没传参，给予默认模拟值 (用于测试)
    if (!userData) {
      userData = {
        id: 1,
        username: 'student2025',
        nickname: '张三',
        jobNumber: '2021001',
        avatarUrl: '',
        deptId: 101,
        userRole: 0
      };
    }

    // 数据映射：将后端下划线字段映射为前端驼峰
    userInfo.value = {
      id: userData.id,
      username: userData.username,
      nickname: userData.nickname,
      // 兼容处理：后端可能返回 job_number 也可能处理成了 jobNumber
      jobNumber: userData.jobNumber || userData.job_number, 
      avatarUrl: userData.avatarUrl || userData.avatar_url || '',
      deptId: userData.deptId || userData.dept_id,
      userRole: userData.userRole || userData.user_role || 0
    };
	
	userStats.value = {
      courseCount: 6,
      completedTasks: 45,
      avgScore: 88
    };

    // 模拟生成 Token
    token.value = 'mock-token-abc-123'; 
    
    // 持久化存储 (可选，防止刷新丢失)
    uni.setStorageSync('token', token.value);
    uni.setStorageSync('userInfo', userInfo.value);
  };

  // 3. Action: 登出
  // 3. Action: 登出
    const logout = () => {
      // [修正] 完整重置 userInfo (保持与初始状态结构一致，防止模板报错)
      userInfo.value = {
        id: null,
        username: '',
        nickname: '未登录',
        jobNumber: '',
        avatarUrl: '',
        deptId: null,
        userRole: 0
      };
  
      // [新增] 同时重置统计数据
      userStats.value = { 
        courseCount: 0, 
        completedTasks: 0, 
        avgScore: 0 
      };
  
      // 清除 Token
      token.value = '';
      
      // 清除本地缓存
      uni.removeStorageSync('token');
      uni.removeStorageSync('userInfo');
    };

  // 4. Action: 初始化检查 (App启动时调用)
  const checkLoginStatus = () => {
    const storedToken = uni.getStorageSync('token');
    const storedUser = uni.getStorageSync('userInfo');
    if (storedToken && storedUser) {
      token.value = storedToken;
      userInfo.value = storedUser;
	  
	  userStats.value = { courseCount: 6, completedTasks: 45, avgScore: 88 };
    }
  };

  return { 
    userInfo, 
	userStats,
    token, 
    login, 
    logout,
    checkLoginStatus 
  };
});