import request from '@/utils/request';

// 课程学生统计视图
export function getCourseStudentView(params = {}) {
  return request.get('/api/view/course-students', params);
}

// 任务提交统计视图
export function getTaskSubmissionView(params = {}) {
  return request.get('/api/view/task-submission', params);
}

