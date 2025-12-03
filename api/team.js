// api/team.js
import request from '@/utils/request';

// 当前用户加入的团队
export function getMyTeams() {
  return request.get('/api/teams/user');
}

// 课程下全部团队
export function getCourseTeams(courseId) {
  return request.get(`/api/teams/course/${courseId}`);
}

// 创建团队
export function createTeam(courseId, data) {
  return request.post(`/api/teams/course/${courseId}`, {
    group_name: data.groupName, // 前端传 groupName, 转为后端 group_name
    max_size: data.maxSize
  });
}

export function joinTeamByCode(code) {
  return request.post('/api/teams/join-by-code', { 
    inviteCode: code // 后端接收字段名为 inviteCode
  });
}

// 加入团队
export function joinTeam(teamId, data = {}) {
  return request.post(`/api/teams/${teamId}/join`, data);
}

// 退出团队
export function quitTeam(teamId) {
  return request.post(`/api/teams/${teamId}/quit`);
}

// 团队成员列表
export function getTeamMembers(teamId) {
  return request.get(`/api/teams/${teamId}/members`);
}

// 团队维度成绩（某任务）
export function getTeamScoresByTask(storyId) {
  return request.get(`/api/teams/${storyId}`);
}

// 团队成员成绩与贡献度
export function getTeamDetail(teamId) {
  return request.get(`/api/teams/detail/${teamId}`);
}