import request from '@/utils/request';

// 1. 任务列表（按课程 / 关键词 / 分页）
export function getTasks(params = {}) {
  return request.get('/api/tasks', params);
}

// 1.1 便捷方法：仅按课程 ID 获取全部任务（含坐标）
export function getTasksByCourse(courseId, extraParams = {}) {
  return getTasks({ course_id: courseId, pageSize: 200, ...extraParams });
}

// 2. 单个任务详情（含 myWork、materials）
export function getTaskDetail(storyId) {
  return request.get(`/api/tasks/${storyId}`);
}

// 3. 提交作业
export function submitTask(storyId, data) {
  // data: { file_url, content, course_id }
  return request.post(`/api/tasks/${storyId}/submit`, data);
}

// 3.1 兼容旧命名
export const submitTaskWork = submitTask;

// 4. 任务数据看板
export function getTaskBoard(storyId) {
  return request.get(`/api/tasks/${storyId}/board`);
}

// 4.1 兼容旧命名
export const getTaskAnalytics = getTaskBoard;

// 5. 任务讨论列表
export function getTaskDiscussions(storyId, params = {}) {
  return request.get(`/api/tasks/${storyId}/discussions`, params);
}

// 6. 发布讨论
export function createTaskDiscussion(storyId, data) {
  return request.post(`/api/tasks/${storyId}/discussions`, data);
}

// 7. 记录任务浏览量
export function recordTaskView(storyId) {
  return request.post(`/api/tasks/${storyId}/view`);
}