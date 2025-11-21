import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useSettingsStore = defineStore('settings', () => {
  // 默认偏好
  const preferences = ref({
    showTags: true,    // 显示学期标签
    reminder: true,    // 学习提醒
    darkMode: false    // 夜间模式
  });

  // 初始化：从本地缓存读取配置
  const loadSettings = () => {
    const saved = uni.getStorageSync('app_settings');
    if (saved) {
      preferences.value = { ...preferences.value, ...saved };
    }
  };

  // 切换开关
  const toggleSetting = (key) => {
    if (preferences.value.hasOwnProperty(key)) {
      preferences.value[key] = !preferences.value[key];
      // 保存到本地
      uni.setStorageSync('app_settings', preferences.value);
      
      // 如果是夜间模式，可能需要触发全局样式变更 (此处仅做状态记录)
      if (key === 'darkMode') {
        console.log('切换夜间模式:', preferences.value.darkMode);
      }
    }
  };

  return { preferences, loadSettings, toggleSetting };
});