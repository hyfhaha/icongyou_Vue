<template>
  <view class="chat-page">
    <view class="header-sticky">
      <view class="header-content">
        <view class="icon-button" @click="goBack">
          <uni-icons type="left" size="22" color="#555555"></uni-icons>
        </view>
        <text class="header-title">{{ partnerName }}</text>
        <view class="icon-button" @click="loadMessages">
           <uni-icons type="refresh" size="22" color="#555555"></uni-icons>
        </view>
      </view>
    </view>

    <scroll-view 
      scroll-y 
      class="chat-scroll" 
      :scroll-top="scrollTop"
      :scroll-with-animation="true"
    >
      <view class="scroll-inner">
        <view 
          v-for="msg in messages" 
          :key="msg.id" 
          class="msg-row" 
          :class="{ 'msg-mine': msg.fromMe }"
        >
          <view v-if="!msg.fromMe" class="avatar other">
            {{ partnerName.charAt(0) }}
          </view>
          
          <view class="bubble">
            <text class="msg-text">{{ msg.content }}</text>
          </view>
          
          <view v-if="msg.fromMe" class="avatar mine">
            我
          </view>
        </view>
      </view>
      <view class="placeholder-footer"></view>
    </scroll-view>

    <view class="footer-bar">
      <input 
        class="input-box" 
        v-model="inputContent" 
        placeholder="发送消息..." 
        confirm-type="send"
        @confirm="handleSend"
      />
      <view class="send-btn" @click="handleSend">
        <uni-icons type="paperplane-filled" size="24" color="#fff"></uni-icons>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, nextTick } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { getMessagesWithUser, sendMessage } from '@/api/message';

const partnerId = ref(null);
const partnerName = ref('聊天');
const messages = ref([]);
const inputContent = ref('');
const scrollTop = ref(0);

// [新增] 返回上一页
const goBack = () => {
  uni.navigateBack();
};

const loadMessages = async () => {
  if (!partnerId.value) return;
  try {
    const res = await getMessagesWithUser(partnerId.value, { page: 1, pageSize: 50 });
    messages.value = res.list || [];
    scrollToBottom();
  } catch (err) {
    console.error(err);
  }
};

const scrollToBottom = () => {
  nextTick(() => {
    scrollTop.value = 9999999; 
  });
};

const handleSend = async () => {
  const content = inputContent.value.trim();
  if (!content) return;
  
  // 乐观更新
  const tempMsg = {
    id: 'temp_' + Date.now(),
    fromMe: true,
    content: content,
    createTime: new Date().toISOString()
  };
  messages.value.push(tempMsg);
  inputContent.value = ''; 
  scrollToBottom();

  try {
    await sendMessage({
      receiverId: partnerId.value,
      content: content
    });
  } catch (err) {
    uni.showToast({ title: '发送失败', icon: 'none' });
  }
};

onLoad((options) => {
  if (options.partnerId) {
    partnerId.value = Number(options.partnerId);
    partnerName.value = options.partnerName || '用户';
    loadMessages();
  }
});
</script>

<style lang="scss" scoped>
/* 头部样式统一 */
.header-sticky {
  position: sticky;
  top: 0;
  z-index: 20;
  background: #FFFFFF;
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
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
}

.chat-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #F4F7FA;
}

.chat-scroll {
  flex: 1;
  height: 0; 
}

.scroll-inner {
  padding: 30rpx;
}

.msg-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 30rpx;
  
  &.msg-mine {
    flex-direction: row-reverse;
  }
}

.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  color: white;
  flex-shrink: 0;
  
  &.other {
    background: #6C5BFF;
    margin-right: 20rpx;
  }
  &.mine {
    background: #4C8AF2;
    margin-left: 20rpx;
  }
}

.bubble {
  max-width: 60%;
  padding: 20rpx 24rpx;
  border-radius: 16rpx;
  background: #FFFFFF;
  box-shadow: 0 2rpx 6rpx rgba(0,0,0,0.05);
  word-break: break-all;
  
  .msg-text {
    font-size: 30rpx;
    color: #333;
    line-height: 1.5;
  }
}

.msg-mine .bubble {
  background: #D1E8FF; 
}

.placeholder-footer {
  height: 20rpx;
}

.footer-bar {
  background: #FFFFFF;
  padding: 20rpx 30rpx;
  padding-bottom: calc(20rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  display: flex;
  align-items: center;
  border-top: 1rpx solid #EAEAEA;
}

.input-box {
  flex: 1;
  height: 80rpx;
  background: #F5F7FA;
  border-radius: 40rpx;
  padding: 0 30rpx;
  font-size: 28rpx;
  margin-right: 20rpx;
}

.send-btn {
  width: 80rpx;
  height: 80rpx;
  background: #4C8AF2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s;
  &:active {
    opacity: 0.8;
  }
}
</style>