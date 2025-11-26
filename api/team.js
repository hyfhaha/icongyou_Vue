// api/team.js
import request from '@/utils/request';

// 1. 获取我加入的所有团队 (用于在课程页筛选我的团队)
export function getMyTeams() {
  return request.get('/api/teams/user');
}

// 2. 获取指定团队的成员列表 (含贡献度)
export function getTeamDetail(teamId) {
  return request.get(`/api/teams/detail/${teamId}`);
}