import request from '@/utils/request';

// 优秀作业列表
export function getExcellentWorks(storyId) {
  return request.get(`/api/excellent/${storyId}`);
}

// 点赞
export function likeExcellentWork(storyId, workId) {
  return request.post(`/api/excellent/${storyId}/${workId}/like`);
}

// 收藏
export function bookmarkExcellentWork(storyId, workId) {
  return request.post(`/api/excellent/${storyId}/${workId}/bookmark`);
}

// 设置优秀作业
export function setExcellentWork(workId, data) {
  return request.post(`/api/excellent/${workId}/set`, data);
}

// 取消优秀作业
export function unsetExcellentWork(workId) {
  return request.post(`/api/excellent/${workId}/unset`);
}

