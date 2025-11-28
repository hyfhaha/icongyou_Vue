import request from '@/utils/request';

// Auth 模块
export function login(data) {
  return request.post('/api/auth/login', data);
}

export function register(data) {
  return request.post('/api/auth/register', data);
}