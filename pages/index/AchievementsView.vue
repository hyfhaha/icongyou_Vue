<template>
  <view class="achievements-page">
    <view class="header-area">
      <text class="page-title">我的成就</text>
      <text class="page-subtitle">记录你的每一次进步</text>
    </view>

    <scroll-view scroll-y class="list-container">
      <view 
        class="achievement-card" 
        v-for="(item, index) in achievementList" 
        :key="index"
        :class="{ 'is-unlocked': item.isUnlocked }"
      >
        <view class="icon-box">
          <uni-icons 
            :type="item.isUnlocked ? 'medal-filled' : 'medal'" 
            size="40" 
            :color="item.isUnlocked ? '#F39C12' : '#BDC3C7'"
          ></uni-icons>
        </view>

        <view class="content-box">
          <view class="title-row">
            <text class="item-title">{{ item.title }}</text>
            <text class="status-tag" v-if="item.isUnlocked">已达成</text>
          </view>
          <text class="item-desc">{{ item.desc }}</text>
          
          <view class="progress-wrapper">
            <view class="progress-bg">
              <view 
                class="progress-fill" 
                :style="{ width: item.percent + '%', background: item.isUnlocked ? '#F39C12' : '#BDC3C7' }"
              ></view>
            </view>
            <text class="progress-text">{{ item.current }} / {{ item.target }}</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '@/store/authStore';

const authStore = useAuthStore();

// 定义成就规则数据
const achievementList = computed(() => {
  const stats = authStore.userStats;
  
  const rules = [
    {
      title: '初入江湖',
      desc: '成功加入并开始学习 1 门课程',
      target: 1,
      current: stats.courseCount || 0
    },
    {
      title: '勤奋标兵',
      desc: '累计完成 10 个学习任务',
      target: 10,
      current: stats.completedTasks || 0
    },
    {
      title: '超凡大师',
      desc: '在 1 门课程中取得 80 分以上的成绩',
      target: 1,
      current: stats.highScoreCount || 0
    }
  ];

  return rules.map(rule => {
    // 限制进度不超过 100%
    let percent = (rule.current / rule.target) * 100;
    if (percent > 100) percent = 100;
    
    return {
      ...rule,
      percent: percent,
      isUnlocked: rule.current >= rule.target
    };
  });
});
</script>

<style lang="scss" scoped>
.achievements-page {
  min-height: 100vh;
  background-color: #F4F7FA;
  display: flex;
  flex-direction: column;
}

.header-area {
  background: linear-gradient(135deg, #F39C12, #F1C40F);
  padding: 60rpx 40rpx 80rpx 40rpx;
  color: #fff;
  
  .page-title {
    font-size: 40rpx;
    font-weight: bold;
    display: block;
    margin-bottom: 10rpx;
  }
  .page-subtitle {
    font-size: 26rpx;
    opacity: 0.9;
  }
}

.list-container {
  flex: 1;
  padding: 0 30rpx;
  margin-top: -40rpx; // 上移盖住 header
}

.achievement-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 24rpx;
  display: flex;
  align-items: flex-start;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
  transition: all 0.3s;
  
  // 未解锁状态变灰
  filter: grayscale(100%);
  opacity: 0.8;
  
  &.is-unlocked {
    filter: grayscale(0%);
    opacity: 1;
    transform: translateY(-2rpx);
    box-shadow: 0 8rpx 20rpx rgba(243, 156, 18, 0.2);
  }
}

.icon-box {
  width: 100rpx;
  display: flex;
  justify-content: center;
  padding-top: 10rpx;
}

.content-box {
  flex: 1;
  margin-left: 20rpx;
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
  
  .item-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
  }
  .status-tag {
    font-size: 20rpx;
    color: #F39C12;
    border: 1px solid #F39C12;
    padding: 2rpx 10rpx;
    border-radius: 10rpx;
  }
}

.item-desc {
  font-size: 24rpx;
  color: #888;
  margin-bottom: 20rpx;
  display: block;
}

.progress-wrapper {
  display: flex;
  align-items: center;
  gap: 20rpx;
  
  .progress-bg {
    flex: 1;
    height: 12rpx;
    background: #EAEAEA;
    border-radius: 6rpx;
    overflow: hidden;
    
    .progress-fill {
      height: 100%;
      border-radius: 6rpx;
      transition: width 0.5s ease;
    }
  }
  
  .progress-text {
    font-size: 22rpx;
    color: #999;
    width: 80rpx;
    text-align: right;
  }
}
</style>