// api/task.js
import request from '@/utils/request';

// 1. 获取任务列表 (带坐标信息)
export function getTaskList(courseId) {
  // 必须传 course_id，为了获取全部数据，pageSize 设大一点
  return request.get('/api/tasks', { course_id: courseId, pageSize: 200 });
}

// 2. 获取单个任务详情 (包含 myWork 和 materials)
export function getTaskDetail(storyId) {
  return request.get(`/api/tasks/${storyId}`);
}

// 3. 提交作业
export function submitTask(storyId, data) {
  // data: { file_url, content, course_id }
  return request.post(`/api/tasks/${storyId}/submit`, data);
}

// 4. 获取任务数据看板 (统计数据)
export function getTaskAnalytics(storyId) {
  return request.get(`/api/tasks/${storyId}/board`);
}

// 5. 获取优秀作业列表
export function getExcellentWorks(storyId) {
  return request.get(`/api/excellent/${storyId}`);
}

// 6. 点赞优秀作业
export function likeWork(storyId, workId) {
  return request.post(`/api/excellent/${storyId}/${workId}/like`);
}

// 7. 收藏优秀作业
export function collectWork(storyId, workId) {
  return request.post(`/api/excellent/${storyId}/${workId}/bookmark`);
}