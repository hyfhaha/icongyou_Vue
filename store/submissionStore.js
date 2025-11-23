import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useSubmissionStore = defineStore('submission', () => {
  // 任务的基本要求 (模拟数据)
  const taskInfo = ref({
    deadlineStr: '372:30:46:194',
    maxFileSize: 100, // MB
    allowedTypes: ['rar', 'mp4']
  });

  const uploadedFiles = ref([]);
  const isSubmitting = ref(false);

  // 添加文件
  const addFile = (file) => {
    uploadedFiles.value.push(file);
  };

  // 移除文件
  const removeFile = (index) => {
    uploadedFiles.value.splice(index, 1);
  };

  // 提交作业 (仅处理网络动作，不处理业务状态)
  const submitWork = () => {
    return new Promise((resolve, reject) => {
      if (uploadedFiles.value.length === 0) {
        return reject('请先上传文件');
      }
      
      isSubmitting.value = true;
      
      // 模拟网络请求延迟
      setTimeout(() => {
        isSubmitting.value = false;
        console.log('[Store] 提交文件成功', uploadedFiles.value);
        // 清空文件，准备下一次提交
        uploadedFiles.value = [];
        resolve();
      }, 1500);
    });
  };

  return {
    taskInfo,
    uploadedFiles,
    isSubmitting,
    addFile,
    removeFile,
    submitWork
  };
});