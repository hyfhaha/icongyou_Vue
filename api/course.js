// api/course.js
import request from '@/utils/request';

// 1. 获取我的课程列表 (总览)
export function getCourseList(params = {}) {
  // params: { page, pageSize }
  return request.get('/api/courses/overview', params);
}

// 2. 获取单课程基础信息
export function getCourseDetail(id) {
  return request.get(`/api/courses/${id}`);
}

// 3. 获取课程地图元数据 (Goals, Epics, Releases) - 核心接口
export function getCourseMapMetadata(id) {
  return request.get(`/api/courses/${id}/map-metadata`);
}

// 4. 获取课程内个人数据总览 (排名/得分)
export function getCoursePersonalStats(id) {
  return request.get(`/api/courses/${id}/personal`);
}

// 5. 获取能力维度达成情况 (雷达图数据)
export function getCourseAbilities(id) {
  return request.get(`/api/courses/${id}/abilities/me`);
}

// 6. 获取课程排行榜
export function getCourseLeaderboard(id) {
  return request.get(`/api/courses/${id}/students`);
}