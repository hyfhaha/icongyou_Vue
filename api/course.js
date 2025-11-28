// api/course.js
import request from '@/utils/request';

// 1. 多课程检索（含公共课程、关键词搜索）
export function searchCourses(params = {}) {
  return request.get('/api/courses', params);
}

// 2. 获取我的课程总览
export function getCourseList(params = {}) {
  return request.get('/api/courses/overview', params);
}

// 3. 单课程基础信息 + 任务列表
export function getCourseDetail(id) {
  return request.get(`/api/courses/${id}`);
}

// 4. 课程内个人统计
export function getCoursePersonalStats(id) {
  return request.get(`/api/courses/${id}/personal`);
}

// 5. 课程任务完成度
export function getCourseTaskStatus(id, scope = 'me') {
  return request.get(`/api/courses/${id}/tasks/status`, { scope });
}

// 6. 课程内排行榜
export function getCourseLeaderboard(id) {
  return request.get(`/api/courses/${id}/students`);
}

// 7. 能力维度
export function getCourseAbilities(id) {
  return request.get(`/api/courses/${id}/abilities/me`);
}

// 8. 课程地图元数据
export function getCourseMapMetadata(id) {
  return request.get(`/api/courses/${id}/map-metadata`);
}