// api/ai.js
import request from '@/utils/request';

// AI 问答
export function askAI(data) {
  return request.post('/api/ai/ask', data);
}

// AI 写作/润色
export function generateAIContent(data) {
  return request.post('/api/ai/generate', data);
}

// AI 自动总结
export function summarizeAIContent(data) {
  return request.post('/api/ai/summary', data);
}

// AI 作业点评
export function commentAIWork(data) {
  return request.post('/api/ai/comment', data);
}