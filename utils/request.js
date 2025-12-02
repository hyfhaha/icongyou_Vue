// utils/request.js

// [配置] 接口基准地址 (对应后端文档 Base URL)
// 真机调试时请将 localhost 换成电脑的局域网 IP (例如 http://192.168.1.x:3000)

// 获取基础 URL：根据运行平台自动选择
function getBaseUrl() {
  // #ifdef H5
  // H5 环境（浏览器）使用 localhost
  return 'http://localhost:3000';
  // #endif
  
  // #ifdef APP-PLUS
  // APP 环境（真机）需要使用电脑的局域网 IP
  // 优先从本地存储读取配置的 IP 地址
  const savedIp = uni.getStorageSync('devServerIp');
  if (savedIp) {
    return `http://${savedIp}:3000`;
  }
  // 如果没有配置，使用默认的服务器 IP
  // 用户可以在设置页面中修改此配置
  const defaultIp = '10.21.254.173'; // 开发服务器 IP
  console.log('[网络配置] 使用默认服务器 IP:', defaultIp);
  return `http://${defaultIp}:3000`;
  // #endif
  
  // #ifdef MP
  // 小程序环境（如果需要）
  return 'http://localhost:3000';
  // #endif
  
  // 默认值
  return 'http://localhost:3000';
}

const BASE_URL = getBaseUrl();

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
        // #ifdef APP-PLUS
        // 在 APP 环境下，如果是连接 localhost 失败，提示用户配置服务器 IP
        if (BASE_URL.includes('localhost') || BASE_URL.includes('127.0.0.1')) {
          console.error('Request Error:', err);
          uni.showModal({
            title: '连接失败',
            content: '无法连接到服务器。真机调试时需要在"设置"中配置电脑的局域网 IP 地址。\n\n如何获取 IP：\n1. Windows: 打开命令提示符，输入 ipconfig，查找"IPv4 地址"\n2. Mac: 系统偏好设置 > 网络 > 查看 IP 地址',
            showCancel: false,
            confirmText: '知道了'
          });
        } else {
          uni.showToast({ title: '网络连接失败', icon: 'none' });
          console.error('Request Error:', err);
        }
        // #endif
        // #ifndef APP-PLUS
        uni.showToast({ title: '网络连接失败', icon: 'none' });
        console.error('Request Error:', err);
        // #endif
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