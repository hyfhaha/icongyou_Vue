<template>
  <view class="achievements-page">
    <view class="header-area">
      <view class="nav-bar">
        <view class="icon-button" @click="goBack">
          <uni-icons type="left" size="24" color="#FFFFFF"></uni-icons>
        </view>
      </view>
      
      <view class="header-text-content">
        <text class="page-title">我的成就</text>
        <text class="page-subtitle">记录你的每一次进步</text>
      </view>
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
            <view class="status-tag" v-if="item.isUnlocked">
              <text>已达成</text>
            </view>
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
      
      <view style="height: 40rpx;"></view>
    </scroll-view>
  </view>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '@/store/authStore';

const authStore = useAuthStore();

// [新增] 返回上一页
const goBack = () => {
  uni.navigateBack();
};

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
  height: 100vh;
  background-color: #F4F7FA;
  display: flex;
  flex-direction: column;
}

.header-area {
  background: linear-gradient(135deg, #F39C12, #F1C40F);
  padding: 0 40rpx 80rpx 40rpx; /* 底部留白给卡片上浮 */
  color: #fff;
  /* 适配刘海屏顶部安全距离，或者简单的给一个 paddingTop */
  padding-top: var(--status-bar-height); 
}

/* [新增] 导航栏样式 */
.nav-bar {
  height: 88rpx;
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
  /* 负 margin 抵消父级 padding，让返回键靠左 */
  margin-left: -20rpx; 
}

.icon-button {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  &:active {
    background: rgba(255,255,255,0.2);
  }
}

.header-text-content {
  padding-bottom: 20rpx;
}

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

.list-container {
  flex: 1;
  height: 0; /* 配合 flex:1 实现滚动 */
  padding: 0 30rpx;
  margin-top: -40rpx; // 上移盖住 header
  box-sizing: border-box; /* 确保 padding 不会撑大宽度 */
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
  
  /* 防止父级宽度被撑开 */
  box-sizing: border-box;
  width: 100%;
  
  // 未解锁状态
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
  width: 90rpx; /* 固定宽度 */
  flex-shrink: 0; /* 禁止压缩 */
  display: flex;
  justify-content: center;
  padding-top: 6rpx;
}

/* [关键修改] 内容区域 */
.content-box {
  flex: 1;
  margin-left: 20rpx;
  
  /* 核心修复：允许 flex 子项缩小到 0，防止文字撑开导致溢出屏幕 */
  min-width: 0; 
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
  gap: 16rpx; /* 标题和标签之间的间距 */
  
  .item-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    
    /* 标题过长省略 */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .status-tag {
    flex-shrink: 0; /* 标签不许压缩 */
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
  
  /* 描述多行省略 */
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
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
    flex-shrink: 0;
  }
}
</style>