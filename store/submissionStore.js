// store/submissionStore.js
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useSubmissionStore = defineStore('submission', () => {
  // 任务基本信息
  const taskInfo = ref({
    deadlineStr: '372:30:46:194',
    maxFileSize: 100,
    allowedTypes: ['rar', 'mp4']
  });

  const uploadedFiles = ref([]);
  const isSubmitting = ref(false);

  const addFile = (file) => {
    uploadedFiles.value.push(file);
  };

  const removeFile = (index) => {
    uploadedFiles.value.splice(index, 1);
  };

  const submitWork = () => {
    return new Promise((resolve, reject) => {
      if (uploadedFiles.value.length === 0) return reject('请先上传文件');
      isSubmitting.value = true;
      setTimeout(() => {
        isSubmitting.value = false;
        resolve();
      }, 1500);
    });
  };

  return { taskInfo, uploadedFiles, isSubmitting, addFile, removeFile, submitWork };
});