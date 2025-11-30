import { defineStore } from 'pinia';
import { ref } from 'vue';
import { login as loginApi } from '@/api/auth';
import { getCurrentUser } from '@/api/user';
// [新增] 引入课程接口用于计算统计数据
import { getCourseList } from '@/api/course';

const createEmptyUser = () => ({
  id: null,
  username: '',
  nickname: '未登录',
  jobNumber: '',
  avatarUrl: '',
  deptId: null,
  deptName: '', // [新增] 班级/专业名称
  userRole: 0
});

const mapUserPayload = (payload = {}) => ({
  id: payload.id ?? null,
  username: payload.username ?? '',
  nickname: payload.nickname ?? payload.username ?? '未登录',
  jobNumber: payload.jobNumber || payload.job_number || payload.username || '',
  avatarUrl: payload.avatarUrl || payload.avatar_url || '',
  deptId: payload.deptId || payload.dept_id || null,
  // [新增] 映射 dept_name
  deptName: payload.deptName || payload.dept_name || '暂无班级信息', 
  userRole: payload.userRole || payload.user_role || 0
});

export const useAuthStore = defineStore('auth', () => {
  const userInfo = ref(createEmptyUser());
  const userStats = ref({
    courseCount: 0,
    completedTasks: 0,
    avgScore: 0
  });
  const token = ref('');

  const persistSession = () => {
    uni.setStorageSync('token', token.value);
    uni.setStorageSync('userInfo', userInfo.value);
  };

  const applyUserSession = (payload = {}, tokenValue = token.value, options = {}) => {
    userInfo.value = mapUserPayload(payload);
    if (typeof tokenValue === 'string') {
      token.value = tokenValue;
    }
    if (!options.skipPersist) {
      persistSession();
    }
  };

const fetchGlobalStats = async () => {
    if (!token.value) return;
    try {
      const res = await getCourseList({ page: 1, pageSize: 100 });
      // 兼容处理：后端返回的是纯数组
      const list = Array.isArray(res) ? res : (res.list || []);

      let totalTasksDone = 0;
      let totalScoreSum = 0;
      let highScoreCount = 0; // [新增] 高分课程计数
      
      list.forEach(course => {
        const done = Number(course.tasks_done || 0);
        const score = Number(course.total_score || 0);
        
        totalTasksDone += done;
        totalScoreSum += score;
        
        // [新增] 假设 80 分以上算优秀
        if (score >= 80) {
            highScoreCount++;
        }
      });

      userStats.value = {
        courseCount: list.length,
        completedTasks: totalTasksDone,
        avgScore: list.length > 0 ? Math.round(totalScoreSum / list.length) : 0,
        highScoreCount: highScoreCount // [新增] 保存到状态中
      };
    } catch (error) {
      console.warn('获取统计数据失败', error);
    }
};

  const login = async (credentials = {}) => {
    const username = credentials.username || credentials.studentId;
    const password = credentials.password;
    if (!username || !password) {
      throw new Error('请输入账号和密码');
    }
    try {
      const result = await loginApi({ username, password });
      applyUserSession(result.user, result.token);
      // 登录成功后顺便拉取一次统计
      fetchGlobalStats();
      return result;
    } catch (error) {
      const message = error?.message || '登录失败';
      uni.showToast({ title: message, icon: 'none' });
      throw error;
    }
  };

  const loginAsMock = (mockUser) => {
    applyUserSession(mockUser || {}, '');
  };

  const logout = () => {
    userInfo.value = createEmptyUser();
    userStats.value = { courseCount: 0, completedTasks: 0, avgScore: 0 };
    token.value = '';
    uni.removeStorageSync('token');
    uni.removeStorageSync('userInfo');
  };

  const checkLoginStatus = async () => {
    const storedToken = uni.getStorageSync('token');
    const storedUser = uni.getStorageSync('userInfo');
    if (!storedToken) return;
    token.value = storedToken;
    if (storedUser) {
      userInfo.value = storedUser;
    }
    try {
      const profile = await getCurrentUser();
      applyUserSession(profile, storedToken);
      // 恢复会话时也刷新统计
      fetchGlobalStats();
    } catch (error) {
      console.warn('刷新登录状态失败', error);
      if (!storedUser) {
        logout();
      }
    }
  };

  return {
    userInfo,
    userStats,
    token,
    login,
    loginAsMock,
    logout,
    checkLoginStatus,
    fetchGlobalStats // 导出
  };
});