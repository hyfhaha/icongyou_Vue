import request from '@/utils/request';

// 发送消息
export function sendMessage(data) {
  return request.post('/api/messages', data);
}

// 会话列表
export function getConversations() {
  return request.get('/api/messages/conversations');
}

// 指定用户的消息列表
export function getMessagesWithUser(userId, params = {}) {
  return request.get(`/api/messages/with/${userId}`, params);
}

