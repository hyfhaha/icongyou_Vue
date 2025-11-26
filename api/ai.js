// api/ai.js
import request from '@/utils/request';

// AI 问答
export function askAI(data) {
  // data: { question, storyId }
  return request.post('/api/ai/ask', data);
}