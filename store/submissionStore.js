import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useCourseContextStore } from './courseContextStore';
import { uploadFile } from '@/api/upload';
import { submitTask } from '@/api/task';

export const useSubmissionStore = defineStore('submission', () => {
  const courseContextStore = useCourseContextStore();

  // 任务信息现在从 courseContextStore 动态获取
  const taskInfo = computed(() => {
    const task = courseContextStore.currentTask;
    if (!task) {
      return {
        deadlineStr: '',
        maxFileSize: 0,
        allowedTypes: []
      };
    }
    return {
      deadlineStr: task.deadline || '',
      maxFileSize: task.max_file_size || 100,
      allowedTypes: task.allowed_file_types || ['rar', 'mp4']
    };
  });

  // uploadedFiles 现在存储的是 uni.chooseFile 返回的临时文件对象
  // e.g., [{ name: 'a.rar', size: 1234, tempFilePath: '...' }]
  const uploadedFiles = ref([]);
  const isSubmitting = ref(false);

  // 添加文件 (通常在页面中调用 uni.chooseFile 后调用此 action)
  const addFile = (file) => {
    // file 结构应为 { name, size, tempFilePath }
    uploadedFiles.value.push(file);
  };

  const removeFile = (index) => {
    uploadedFiles.value.splice(index, 1);
  };

  // 清空已选文件
  const clearFiles = () => {
    uploadedFiles.value = [];
  }

  // 提交作业，包含真实上传和提交逻辑
  const submitWork = async (submissionData = {}) => {
    if (uploadedFiles.value.length === 0) {
      throw new Error('请先选择要上传的文件');
    }

    const currentTask = courseContextStore.currentTask;
    if (!currentTask || !currentTask.id) {
      throw new Error('未找到当前任务信息，无法提交');
    }

    isSubmitting.value = true;

    try {
      // 步骤1: 上传所有文件到服务器，获取 URL
      // 注意: uni.uploadFile 是一次一个，所以需要 Promise.all
      const uploadPromises = uploadedFiles.value.map(file => uploadFile(file.tempFilePath));
      const uploadResults = await Promise.all(uploadPromises);
      
      // 假设 uploadFile 返回 { url: '...' }
      const fileUrl = uploadResults.map(res => res.url).join(','); // 如果后端支持多个文件，用逗号分隔

      // 步骤2: 调用提交作业接口
      const payload = {
        course_id: currentTask.course_id || courseContextStore.currentCourseId,
        file_url: fileUrl,
        content: submissionData.content || '', // 作业说明等
        team_contributions: submissionData.contributions || [] // 团队贡献度
      };

      const result = await submitTask(currentTask.id, payload);
      
      // 成功后清空文件列表
      clearFiles();
      return result;

    } catch (error) {
      console.error('提交作业失败:', error);
      const message = error?.data?.message || error?.errMsg || '提交失败，请稍后重试';
      // 抛出错误，让页面可以捕获并提示用户
      throw new Error(message);
    } finally {
      isSubmitting.value = false;
    }
  };

  return {
    taskInfo,
    uploadedFiles,
    isSubmitting,
    addFile,
    removeFile,
    clearFiles,
    submitWork
  };
});