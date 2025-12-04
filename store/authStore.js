import { defineStore } from 'pinia';
import { ref } from 'vue';
import { login as loginApi } from '@/api/auth';

// [新增] 引入课程接口用于计算统计数据
import { getCourseList } from '@/api/course';
import { getCurrentUser, updateUserProfile } from '@/api/user';
import RequestConfig from '@/utils/request'; // [新增] 用于获取 baseURL

const createEmptyUser = () => ({
  id: null,
  username: '',
  nickname: '未登录',
  jobNumber: '',
  avatarUrl: '',
  deptId: null,
  deptName: '', // [新增] 班级/专业名称
  userRole: 0,
  phoneNumber: '',
  email: ''
});

const mapUserPayload = (payload = {}) => ({
  id: payload.id ?? null,
  username: payload.username ?? '',
  nickname: payload.nickname ?? payload.username ?? '未登录',
  jobNumber: payload.jobNumber || payload.job_number || '',
  avatarUrl: payload.avatarUrl || payload.avatar_url || '',
  deptId: payload.deptId || payload.dept_id || null,
  // [新增] 映射 dept_name
  deptName: payload.deptName || payload.dept_name || '暂无班级信息', 
  userRole: payload.userRole || payload.user_role || 0,
  phoneNumber: payload.phoneNumber || payload.phone_number || payload.mobile || '',
  email: payload.email || payload.mail || ''
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

  const refreshProfile = async (options = {}) => {
    if (!token.value) {
      console.warn('refreshProfile: token 缺失，无法获取用户信息');
      return null;
    }
    const profile = await getCurrentUser();
    applyUserSession(profile, token.value, options);
    return profile;
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
      try {
        await refreshProfile();
      } catch (profileErr) {
        console.warn('登录后刷新用户信息失败', profileErr);
      }
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
      await refreshProfile({ skipPersist: false });
      // 恢复会话时也刷新统计
      fetchGlobalStats();
    } catch (error) {
      console.warn('刷新登录状态失败', error);
      if (!storedUser) {
        logout();
      }
      throw error;
    }
  };
  
  // [新增] 上传并更新头像 Action
    const updateAvatar = async (filePath) => {
      if (!token.value) throw new Error('未登录');
  
      return new Promise((resolve, reject) => {
        // 1. 使用 uni.uploadFile 上传图片
        // 注意：uni.uploadFile 不走 request 拦截器，需要手动加 Header
        // 假设 RequestConfig.baseUrl 是你的 API 根地址 (如 http://localhost:3000)
        const uploadUrl = (RequestConfig.baseUrl || '').replace(/\/$/, '') + '/api/upload/avatar';
        
        uni.uploadFile({
          url: uploadUrl, 
          filePath: filePath,
          name: 'file', // 后端 multer 配置接收的字段名
          header: {
            'Authorization': 'Bearer ' + token.value // 必须携带 Token
          },
          success: async (uploadRes) => {
            try {
              // uni.uploadFile 返回的 data 是字符串，需要解析
              const result = JSON.parse(uploadRes.data);
              
              if (uploadRes.statusCode !== 200 && uploadRes.statusCode !== 201) {
                throw new Error(result.message || '上传失败');
              }
  
              // 2. 拿到后端返回的图片地址 (result.url)
              const newAvatarUrl = result.url;
              console.log('图片上传成功:', newAvatarUrl);
  
              // 3. 调用 API 更新用户数据库资料
              await updateUserProfile({ avatar_url: newAvatarUrl });
  
              // 4. 更新本地状态和缓存
              userInfo.value.avatarUrl = newAvatarUrl;
              // 这是一个小技巧：给 URL 加时间戳防止前端缓存旧图
              // 注意：存库时存纯净 URL，显示时前端组件负责加时间戳，或者在这里存也行
              // 这里我们存纯净 URL
              
              uni.setStorageSync('userInfo', userInfo.value);
              
              resolve(newAvatarUrl);
            } catch (e) {
              reject(e);
            }
          },
          fail: (err) => {
            reject(new Error('网络请求失败: ' + err.errMsg));
          }
        });
      });
    };

  return {
    userInfo,
    userStats,
    token,
    login,
    loginAsMock,
    logout,
    checkLoginStatus,
    fetchGlobalStats, // 导出
    refreshProfile,
	updateAvatar
  };
});