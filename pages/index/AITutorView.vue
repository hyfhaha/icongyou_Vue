<template>
	<view class="ai-tutor-page">
		<view class="header-sticky">
			<view class="header-content">
				<view class="icon-button" @click="goBack">
					<uni-icons type="left" size="22" color="#555555"></uni-icons>
				</view>
				<text class="header-title">AI 互动讨论</text>
				<view class="icon-button">
					<uni-icons type="chatbubble-filled" size="22" color="#0EA5E9"></uni-icons>
				</view>
			</view>
		</view>

		<view class="hint-bar">
			<text>任务: T4-1 爱从游（学生移动端） · 输入疑问，AI 将结合任务要求生成解题思路</text>
		</view>

		<scroll-view scroll-y class="message-scroll" :scroll-into-view="lastMessageId">
			<view v-for="message in messages" :key="message.id" :id="message.id" class="message-row" :class="message.role">
				<view class="avatar" :class="message.role">{{ message.role === 'user' ? '我' : 'AI' }}</view>
				<view class="bubble">
					<text class="bubble-text">{{ message.content }}</text>
					<text class="timestamp">{{ message.time }}</text>
				</view>
			</view>
		</scroll-view>

		<view class="composer">
			<textarea v-model="draft" placeholder="请输入问题，例如：如何统计任务提交率？" auto-height class="composer-input" />
			<button class="send-button" :disabled="!draft.trim()" @click="sendMessage">
				发送
			</button>
		</view>
	</view>
</template>

<script setup>
import { computed, ref } from 'vue';

const now = () => {
  const date = new Date();
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

const messages = ref([
  { id: 'm1', role: 'ai', content: '你好，我是爱从游课程助教。可以就任务设计、AI 工具集成等问题咨询我。', time: now() },
  { id: 'm2', role: 'user', content: '想知道任务提交率要展示哪些指标？', time: now() },
  { id: 'm3', role: 'ai', content: '建议展示已提交/未提交人数与百分占比，并结合截止时间显示风险提示；可附带查看量、讨论量提升热度感知。', time: now() }
]);

const draft = ref('');
const lastMessageId = computed(() => messages.value.length ? messages.value[messages.value.length - 1].id : '');

const goBack = () => {
  uni.navigateBack();
};

const sendMessage = () => {
  const content = draft.value.trim();
  if (!content) return;
  const userMessage = { id: `m${Date.now()}`, role: 'user', content, time: now() };
  messages.value.push(userMessage);
  draft.value = '';

  // 模拟 AI 回复
  setTimeout(() => {
    messages.value.push({
      id: `m${Date.now()}`,
      role: 'ai',
      content: `可将“${content}”拆解为可执行的 3 步：1) 明确任务输入输出；2) 选择合适的统计或 UI 组件；3) 在提交区联动提醒。`,
      time: now()
    });
  }, 600);
};
</script>

<style lang="scss" scoped>
$bg-color: #F4F7FA;
$card-bg: #FFFFFF;
$text-color: #333333;
$text-light: #888888;
$shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

.ai-tutor-page {
	height: 100vh;
	display: flex;
	flex-direction: column;
	background: $bg-color;
}
.header-sticky {
	position: sticky;
	top: 0;
	z-index: 20;
	background: #FFFFFF;
	box-shadow: $shadow;
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
	color: $text-color;
}

.hint-bar {
	background: #DCF4FF;
	color: #0EA5E9;
	padding: 18rpx 30rpx;
	font-size: 24rpx;
}

.message-scroll {
	flex: 1;
	height: 0;
	padding: 30rpx;
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	gap: 24rpx;
}
.message-row {
	display: flex;
	align-items: flex-start;
	gap: 16rpx;
}
.message-row.user {
	flex-direction: row-reverse;
}
.avatar {
	width: 68rpx;
	height: 68rpx;
	border-radius: 50%;
	background: linear-gradient(135deg, #4C8AF2, #6C5BFF);
	color: white;
	display: flex;
	align-items: center;
	justify-content: center;
	font-weight: 600;
}
.avatar.ai {
	background: linear-gradient(135deg, #34D399, #10B981);
}
.bubble {
	max-width: 500rpx;
	padding: 24rpx;
	border-radius: 24rpx;
	background: $card-bg;
	box-shadow: $shadow;
}
.message-row.user .bubble {
	background: linear-gradient(135deg, #4C8AF2, #6C5BFF);
	color: white;
}
.bubble-text {
	font-size: 26rpx;
	line-height: 1.6;
}
.timestamp {
	font-size: 22rpx;
	color: $text-light;
	display: block;
	margin-top: 8rpx;
}
.message-row.user .timestamp {
	color: rgba(255,255,255,0.7);
}

.composer {
	padding: 20rpx 30rpx 30rpx;
	background: #FFFFFF;
	box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.05);
	display: flex;
	gap: 20rpx;
}
.composer-input {
	flex: 1;
	min-height: 120rpx;
	border-radius: 20rpx;
	background: #F3F4F6;
	padding: 20rpx;
	font-size: 28rpx;
	color: $text-color;
}
.send-button {
	width: 140rpx;
	border-radius: 20rpx;
	background: linear-gradient(135deg, #0EA5E9, #2563EB);
	color: white;
	font-size: 28rpx;
	font-weight: 600;
}
.send-button:disabled {
	opacity: 0.5;
}
</style>

