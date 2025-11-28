import { defineStore } from 'pinia';
import { ref } from 'vue';
import { login as loginApi } from '@/api/auth';
import { getCurrentUser } from '@/api/user';

const createEmptyUser = () => ({
  id: null,
  username: '',
  nickname: '未登录',
  jobNumber: '',
  avatarUrl: '',
  deptId: null,
  userRole: 0
});

const mapUserPayload = (payload = {}) => ({
  id: payload.id ?? null,
  username: payload.username ?? '',
  nickname: payload.nickname ?? payload.username ?? '未登录',
  jobNumber: payload.jobNumber || payload.job_number || payload.username || '',
  avatarUrl: payload.avatarUrl || payload.avatar_url || '',
  deptId: payload.deptId || payload.dept_id || null,
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
    if (!options.skipStats) {
      userStats.value = {
        courseCount: payload.courseCount ?? userStats.value.courseCount ?? 0,
        completedTasks: payload.completedTasks ?? userStats.value.completedTasks ?? 0,
        avgScore: payload.avgScore ?? userStats.value.avgScore ?? 0
      };
    }
    if (!options.skipPersist) {
      persistSession();
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
    checkLoginStatus
  };
});