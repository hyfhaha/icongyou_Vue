import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useSettingsStore = defineStore('settings', () => {
  // 默认配置
  const preferences = ref({
    showTags: true,      // 显示学期标签
    privacyMode: false,  // [新功能] 隐私模式：隐藏分数
  });

  // 加载本地缓存的配置
  const loadSettings = () => {
    try {
      const saved = uni.getStorageSync('app_settings');
      if (saved) {
        // 合并配置，防止新加字段丢失
        preferences.value = { ...preferences.value, ...saved };
      }
    } catch (e) {
      console.error('加载配置失败', e);
    }
  };

  // 切换配置并保存
  const toggleSetting = (key) => {
    if (key in preferences.value) {
      preferences.value[key] = !preferences.value[key];
      uni.setStorageSync('app_settings', preferences.value);
    }
  };

  return {
    preferences,
    loadSettings,
    toggleSetting
  };
});