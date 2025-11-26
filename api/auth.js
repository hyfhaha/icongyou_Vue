// utils/request.js

// [配置] 接口基准地址 (对应后端文档 Base URL)
// 真机调试时请将 localhost 换成电脑的局域网 IP (例如 http://192.168.1.x:3000)
const BASE_URL = 'http://localhost:3000';

const request = (options) => {
  return new Promise((resolve, reject) => {
    // 1. 获取本地存储的 Token
    const token = uni.getStorageSync('token');
    
    // 2. 组装 Header
    const header = {
      'Content-Type': 'application/json',
      ...options.header // 允许单个请求覆盖 header
    };
    
    // 如果有 Token，按照文档约定注入 Header
    if (token) {
      header['Authorization'] = `Bearer ${token}`;
    }

    // 3. 发起请求
    uni.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: header,
      timeout: 10000, // 10秒超时
      success: (res) => {
        // 4. 统一处理 HTTP 状态码
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // 请求成功，返回后端数据
          resolve(res.data);
        } else if (res.statusCode === 401) {
          // 401 未授权：Token 过期或无效
          uni.removeStorageSync('token');
          uni.removeStorageSync('userInfo');
          uni.showToast({ title: '登录已过期，请重新登录', icon: 'none' });
          
          // 延迟跳转回登录页
          setTimeout(() => {
            uni.reLaunch({ url: '/pages/index/LoginView' });
          }, 1500);
          
          reject(res);
        } else {
          // 其他业务错误 (400, 403, 404, 500 等)
          const errorMsg = res.data.message || '请求服务失败';
          uni.showToast({ title: errorMsg, icon: 'none' });
          reject(res);
        }
      },
      fail: (err) => {
        // 网络级错误 (断网、超时)
        uni.showToast({ title: '网络连接失败', icon: 'none' });
        console.error('Request Error:', err);
        reject(err);
      }
    });
  });
};

// 导出快捷方法
export default {
  baseUrl: BASE_URL, // 导出给 upload 使用
  get(url, data, header) {
    return request({ url, method: 'GET', data, header });
  },
  post(url, data, header) {
    return request({ url, method: 'POST', data, header });
  },
  put(url, data, header) {
    return request({ url, method: 'PUT', data, header });
  },
  delete(url, data, header) {
    return request({ url, method: 'DELETE', data, header });
  }
};