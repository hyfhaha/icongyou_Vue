import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useChatStore = defineStore('chat', () => {
  const messages = ref([
    { 
      id: 'm1', 
      role: 'ai', 
      content: '你好，我是爱从游课程助教。你可以询问关于当前任务的任何问题。', 
      time: '刚刚' 
    }
  ]);

  const isTyping = ref(false);

  // 发送消息
  const sendMessage = async (content) => {
    if (!content.trim()) return;

    // 1. 添加用户消息
    const userMsg = {
      id: `u_${Date.now()}`,
      role: 'user',
      content: content,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    messages.value.push(userMsg);
    isTyping.value = true;

    // 2. 模拟 AI 回复 (延迟)
    return new Promise((resolve) => {
      setTimeout(() => {
        const aiMsg = {
          id: `a_${Date.now()}`,
          role: 'ai',
          content: generateMockResponse(content),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        messages.value.push(aiMsg);
        isTyping.value = false;
        resolve();
      }, 1000);
    });
  };

  // 简单的关键词回复逻辑
  const generateMockResponse = (input) => {
    if (input.includes('提交')) return '关于任务提交：请确保文件格式为 PDF 或 RAR，并在截止日期前上传。团队任务仅需队长提交。';
    if (input.includes('分数') || input.includes('评分')) return '评分标准主要依据：1. 提交物的完整性；2. 团队协作贡献度；3. 创新点与代码规范。';
    if (input.includes('难')) return '如果遇到困难，建议先查看“优秀作业”中的示例，或者在团队群里发起讨论。';
    return `收到关于“${input}”的问题。建议您可以先拆解任务步骤，参考任务详情页的资料文档。如有具体技术报错，请贴出错误码。`;
  };

  // 清空记录
  const clearChat = () => {
    messages.value = [{ 
      id: 'm1', 
      role: 'ai', 
      content: '对话已重置。有什么可以帮你的吗？', 
      time: '刚刚' 
    }];
  };

  return { messages, isTyping, sendMessage, clearChat };
});
//flag