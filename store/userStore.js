// store/userStore.js
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUserStore = defineStore('user', () => {
  // --- 1. 个人数据 (用于数据看板-个人Tab) ---
  const personalData = ref({
    totalScore: 312,
    avgScore: 286,
    rank: 4,
    rankPercent: 15
  });

  const abilityDimensions = ref([
    { id: 1, label: '团队协作', value: 82, color: '#4C8AF2' },
    { id: 2, label: '方案设计', value: 75, color: '#9B59B6' },
    { id: 3, label: '软件构建', value: 68, color: '#2ECC71' }
  ]);

  // --- 2. 团队数据 (用于数据看板-团队Tab & 提交页) ---
  // 这是一个共享状态：提交页修改它，数据看板会同步更新
  const teamMembers = ref([
    { id: 1, name: '张三', studentId: '2021001', contribution: 25, isLeader: true },
    { id: 2, name: '李四', studentId: '2021002', contribution: 25, isLeader: false },
    { id: 3, name: '王五', studentId: '2021003', contribution: 25, isLeader: false },
    { id: 4, name: '赵六', studentId: '2021004', contribution: 25, isLeader: false }
  ]);

  // 修改贡献度的方法
  const updateContribution = (memberId, delta) => {
    const member = teamMembers.value.find(m => m.id === memberId);
    if (member) {
      const newValue = member.contribution + delta;
      if (newValue >= 0 && newValue <= 100) {
        member.contribution = newValue;
      }
    }
  };

  return {
    personalData,
    abilityDimensions,
    teamMembers,
    updateContribution
  };
});