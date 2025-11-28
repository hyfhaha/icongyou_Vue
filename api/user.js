import request from '@/utils/request';

export function getCurrentUser() {
  return request.get('/api/user/me');
}

