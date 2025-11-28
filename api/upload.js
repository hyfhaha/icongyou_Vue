// api/upload.js
import RequestConfig from '@/utils/request'; // 引入配置以获取 BASE_URL

export function uploadFile(tempFilePath) {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token');
    
    uni.uploadFile({
      url: RequestConfig.baseUrl + '/api/upload', // 拼接完整地址
      filePath: tempFilePath,
      name: 'file', // 后端 multer 要求的字段名
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (uploadRes) => {
        // uni.uploadFile 返回的 data 是字符串，需要 JSON.parse
        if (uploadRes.statusCode === 200 || uploadRes.statusCode === 201) {
          try {
            const data = JSON.parse(uploadRes.data);
            resolve(data); // 返回 { url: "..." }
          } catch (e) {
            reject(e);
          }
        } else {
          uni.showToast({ title: '上传失败', icon: 'none' });
          reject(uploadRes);
        }
      },
      fail: (err) => {
        uni.showToast({ title: '网络错误', icon: 'none' });
        reject(err);
      }
    });
  });
}

// 获取 OSS STS 临时凭证
export function getOssStsToken() {
  return RequestConfig.get('/api/oss/sts-token');
}