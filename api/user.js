import request from '@/utils/request';

export function getCurrentUser() {
  return request.get('/api/user/me');
}

export function updateUserProfile(data) {
  return request.put('/api/user/me', data);
}