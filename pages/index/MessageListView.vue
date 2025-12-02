<template>
  <view class="message-list-page">
    <view class="header-sticky">
      <view class="header-content">
        <view class="icon-button" @click="goBack">
          <uni-icons type="left" size="22" color="#555555"></uni-icons>
        </view>
        <text class="header-title">消息通知</text>
        <view class="icon-button"></view>
      </view>
    </view>

    <view v-if="!loading && list.length === 0" class="empty-state">
      <uni-icons type="chatbubble" size="60" color="#E0E0E0"></uni-icons>
      <text class="empty-text">暂无消息通知</text>
    </view>

    <scroll-view scroll-y class="list-container" v-else>
      <view 
        v-for="item in list" 
        :key="item.conversationId" 
        class="message-item"
        @click="goToChat(item)"
      >
        <view class="avatar-box">
          <text class="avatar-text">{{ item.partnerName ? item.partnerName.charAt(0) : '?' }}</text>
          <view v-if="item.unreadCount > 0" class="badge">
            <text>{{ item.unreadCount > 99 ? '99+' : item.unreadCount }}</text>
          </view>
        </view>

        <view class="content-box">
          <view class="row-top">
            <text class="name">{{ item.partnerName }}</text>
            <text class="time">{{ formatTime(item.lastTime) }}</text>
          </view>
          <view class="row-bottom">
            <text class="last-msg">{{ item.lastMessage }}</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app';
// 确保 api 路径正确
import { getConversations } from '@/api/message';

const list = ref([]);
const loading = ref(true);

// [新增] 返回上一页
const goBack = () => {
  uni.navigateBack();
};

const loadData = async () => {
  loading.value = true;
  try {
    const res = await getConversations();
    list.value = res.list || [];
  } catch (err) {
    console.error(err);
    uni.showToast({ title: '加载失败', icon: 'none' });
  } finally {
    loading.value = false;
    uni.stopPullDownRefresh();
  }
};

const goToChat = (item) => {
  // 路径已更新为 pages/index/ChatDetailView
  uni.navigateTo({
    url: `/pages/index/ChatDetailView?partnerId=${item.partnerId}&partnerName=${item.partnerName}`
  });
};

const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const date = new Date(timeStr);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toTimeString().slice(0, 5);
  }
  return `${date.getMonth() + 1}-${date.getDate()}`;
};

onShow(() => {
  loadData();
});

onPullDownRefresh(() => {
  loadData();
});
</script>

<style lang="scss" scoped>
/* 头部样式参考 SettingsView */
.header-sticky {
  position: sticky;
  top: 0;
  z-index: 20;
  background: #FFFFFF;
  padding-top: var(--status-bar-height);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}
.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24rpx;
  height: 100rpx;
}
.icon-button {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.header-title {
  font-size: 34rpx;
  font-weight: bold;
  color: #333333;
}

.message-list-page {
  height: 100vh;
  background-color: #FFFFFF;
  display: flex;
  flex-direction: column;
}

.list-container {
  flex: 1;
  height: 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;
  .empty-text {
    margin-top: 20rpx;
    color: #999;
    font-size: 28rpx;
  }
}

.message-item {
  display: flex;
  padding: 30rpx;
  border-bottom: 1rpx solid #F5F5F5;
  &:active {
    background-color: #FAFAFA;
  }
}

.avatar-box {
  position: relative;
  width: 100rpx;
  height: 100rpx;
  border-radius: 20rpx;
  background: linear-gradient(135deg, #4C8AF2, #6C5BFF);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
  
  .avatar-text {
    color: white;
    font-size: 40rpx;
    font-weight: bold;
  }
  
  .badge {
    position: absolute;
    top: -10rpx;
    right: -10rpx;
    background-color: #E74C3C;
    color: white;
    font-size: 20rpx;
    padding: 4rpx 10rpx;
    border-radius: 20rpx;
    border: 2rpx solid #fff;
  }
}

.content-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  overflow: hidden;
}

.row-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .name {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
  }
  .time {
    font-size: 24rpx;
    color: #999;
  }
}

.row-bottom {
  .last-msg {
    font-size: 28rpx;
    color: #666;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: block;
  }
}
</style>