import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getTaskDiscussions, createTaskDiscussion } from '@/api/task';
import { useAuthStore } from './authStore';

export const useChatStore = defineStore('chat', () => {
  const messages = ref([]);
  const isTyping = ref(false);

  // 格式化时间显示
  const formatTime = (timeStr) => {
    if (!timeStr) return '刚刚';
    const date = new Date(timeStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hour}:${minute}`;
  };

  // 从数据库加载历史记录
  const loadHistory = async (storyId) => {
    if (!storyId) {
      // 如果没有storyId，显示欢迎消息
      messages.value = [{ 
        id: 'welcome', 
        role: 'ai', 
        content: '你好，我是爱从游课程助教。你可以询问关于当前任务的任何问题。', 
        time: '刚刚' 
      }];
      return;
    }

    try {
      const authStore = useAuthStore();
      const currentUserId = authStore.userInfo?.id;
      
      const data = await getTaskDiscussions(storyId, { pageSize: 100 });
      const items = data?.items || [];
      
      // 将数据库记录转换为消息格式
      messages.value = items.map(item => {
        // 判断是否是当前用户发送的消息
        const isCurrentUser = item.user_id && String(item.user_id) === String(currentUserId);
        
        return {
          id: `msg_${item.id}`,
          role: isCurrentUser ? 'user' : (item.user_id ? 'reply' : 'ai'), // user=当前用户, reply=其他用户回复, ai=AI回复
          content: item.content || '',
          time: formatTime(item.create_time),
          dbId: item.id, // 保存数据库ID，用于回复关联
          replyTo: item.reply_to,
          userName: item.user_name || 'AI助教', // 保存用户名，用于显示回复人
          userId: item.user_id // 保存用户ID
        };
      });

      // 如果没有历史记录，显示欢迎消息
      if (messages.value.length === 0) {
        messages.value = [{ 
          id: 'welcome', 
          role: 'ai', 
          content: '你好，我是爱从游课程助教。你可以询问关于当前任务的任何问题。', 
          time: '刚刚' 
        }];
      }
    } catch (error) {
      console.error('加载历史记录失败:', error);
      // 加载失败时显示欢迎消息
      messages.value = [{ 
        id: 'welcome', 
        role: 'ai', 
        content: '你好，我是爱从游课程助教。你可以询问关于当前任务的任何问题。', 
        time: '刚刚' 
      }];
    }
  };

  // 发送消息
  const sendMessage = async (content, storyId) => {
    if (!content.trim()) return;
    if (!storyId) {
      uni.showToast({ title: '任务ID不存在', icon: 'none' });
      return;
    }

    const authStore = useAuthStore();
    const currentUserId = authStore.userInfo?.id;
    
    // 1. 添加用户消息到界面（临时）
    const userMsg = {
      id: `u_${Date.now()}`,
      role: 'user', // 当前用户发送的消息，role为user
      content: content,
      time: '刚刚',
      userId: currentUserId,
      userName: authStore.userInfo?.nickname || authStore.userInfo?.username || '我'
    };
    messages.value.push(userMsg);
    isTyping.value = true;

    try {
      // 2. 将用户消息存入数据库（后端会自动调用AI并保存AI回复）
      const userDiscussion = await createTaskDiscussion(storyId, {
        content: content,
        reply_to: null
      });

      // 更新用户消息的ID为数据库ID
      userMsg.id = `msg_${userDiscussion.id}`;
      userMsg.dbId = userDiscussion.id;

      // 3. 轮询获取AI回复（后端异步处理，需要等待）
      let attempts = 0;
      const maxAttempts = 20; // 最多尝试20次，每次1秒，共20秒
      const pollInterval = 1000; // 1秒轮询一次

      const pollForAIResponse = setInterval(async () => {
        attempts++;
        
        try {
          // 重新加载讨论列表，查找AI回复
          const data = await getTaskDiscussions(storyId, { pageSize: 100 });
          const items = data?.items || [];
          
          // 查找是否有回复用户消息的AI回复
          const aiReply = items.find(item => 
            !item.user_id && 
            item.reply_to === userDiscussion.id
          );

          if (aiReply) {
            // 找到AI回复，添加到界面
            clearInterval(pollForAIResponse);
            isTyping.value = false;

            // 检查是否已经添加过这条AI回复
            const existingMsg = messages.value.find(m => m.dbId === aiReply.id);
            if (!existingMsg) {
              const aiMsg = {
                id: `msg_${aiReply.id}`,
                role: 'ai',
                content: aiReply.content || '',
                time: formatTime(aiReply.create_time),
                dbId: aiReply.id,
                replyTo: aiReply.reply_to,
                userName: aiReply.user_name || 'AI助教',
                userId: aiReply.user_id
              };
              messages.value.push(aiMsg);
            }
          } else if (attempts >= maxAttempts) {
            // 超时，停止轮询
            clearInterval(pollForAIResponse);
            isTyping.value = false;
            uni.showToast({ title: 'AI回复超时，请稍后刷新查看', icon: 'none' });
          }
        } catch (pollError) {
          console.error('轮询AI回复失败:', pollError);
          if (attempts >= maxAttempts) {
            clearInterval(pollForAIResponse);
            isTyping.value = false;
          }
        }
      }, pollInterval);

    } catch (error) {
      console.error('发送消息失败:', error);
      isTyping.value = false;
      uni.showToast({ title: error.message || '发送失败', icon: 'none' });
      // 移除失败的用户消息
      const index = messages.value.findIndex(m => m.id === userMsg.id);
      if (index > -1) {
        messages.value.splice(index, 1);
      }
    }
  };

  // 清空记录（仅清空前端，不清空数据库）
  const clearChat = () => {
    messages.value = [{ 
      id: 'welcome', 
      role: 'ai', 
      content: '对话已重置。有什么可以帮你的吗？', 
      time: '刚刚' 
    }];
  };

  return { messages, isTyping, sendMessage, clearChat, loadHistory };
});
//flag