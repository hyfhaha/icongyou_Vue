import request from '@/utils/request';

// 作业详情
export function getHomeworkDetail(id) {
  return request.get(`/api/homework/${id}`);
}

// 学生修改作业
export function updateHomework(id, data) {
  return request.put(`/api/homework/${id}`, data);
}

// 获取作业评语
export function getHomeworkComment(id) {
  return request.get(`/api/homework/${id}/comment`);
}

// 更新作业评语
export function updateHomeworkComment(id, data) {
  return request.put(`/api/homework/${id}/comment`, data);
}

