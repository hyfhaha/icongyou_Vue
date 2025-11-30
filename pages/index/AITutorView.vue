<template>
	<view class="ai-tutor-page">
		<view class="header-sticky">
			<view class="header-content">
				<view class="icon-button" @click="goBack">
					<uni-icons type="left" size="22" color="#555555"></uni-icons>
				</view>
				<text class="header-title">AI 互动讨论</text>
				<view class="icon-button">
					<uni-icons type="trash" size="22" color="#E74C3C" @click="handleClear"></uni-icons>
				</view>
			</view>
		</view>

		<view class="hint-bar" v-if="currentTask.id">
			<uni-icons type="info" size="14" color="#0EA5E9" style="margin-right: 8rpx;"></uni-icons>
			<text>当前任务: {{ currentTask.storyName }}</text>
		</view>

		<scroll-view 
			scroll-y 
			class="message-scroll" 
			:scroll-into-view="scrollTarget"
			:scroll-with-animation="true"
		>
			<view 
				v-for="message in messages" 
				:key="message.id" 
				:id="'msg-' + message.id"
				class="message-row" 
				:class="message.role"
			>
				<view class="avatar" :class="message.role">
					{{ message.role === 'user' ? '我' : (message.role === 'ai' ? 'AI' : (message.userName ? message.userName.charAt(0) : '?')) }}
				</view>
				<view class="bubble">
					<view v-if="message.role === 'reply'" class="reply-header">
						<text class="reply-name">{{ message.userName }}</text>
					</view>
					<text class="bubble-text">{{ message.content }}</text>
					<text class="timestamp">{{ message.time }}</text>
				</view>
			</view>
			
			<view v-if="isTyping" class="message-row ai" id="typing-indicator">
				<view class="avatar ai">AI</view>
				<view class="bubble typing">
					<text class="dot">.</text><text class="dot">.</text><text class="dot">.</text>
				</view>
			</view>
			
			<view style="height: 20rpx;" id="bottom-anchor"></view>
		</scroll-view>

		<view class="composer">
			<textarea 
				v-model="draft" 
				placeholder="请输入问题，例如：如何统计任务提交率？" 
				auto-height 
				class="composer-input"
				:maxlength="200"
			/>
			<button 
				class="send-button" 
				:disabled="!draft.trim() || isTyping" 
				@click="handleSend"
			>
				发送
			</button>
		</view>
	</view>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { onLoad } from '@dcloudio/uni-app';
// 引入 Store
import { useChatStore } from '@/store/chatStore';
import { useCourseContextStore } from '@/store/courseContextStore';

const chatStore = useChatStore();
const contextStore = useCourseContextStore();

// 1. 获取聊天数据
const { messages, isTyping } = storeToRefs(chatStore);
// 2. 获取当前任务上下文 (从 TaskDetailView 进来时会带有 currentTask)
const { currentTask } = storeToRefs(contextStore);

const draft = ref('');
const scrollTarget = ref('');
const storyId = ref(null);

// 页面加载时获取任务ID并加载历史记录
onLoad((options) => {
	// 尝试从URL参数获取taskId
	if (options.taskId) {
		storyId.value = options.taskId;
	} else if (currentTask.value?.id) {
		storyId.value = currentTask.value.id;
	}
	
	// 加载历史记录
	if (storyId.value) {
		chatStore.loadHistory(storyId.value);
	} else {
		// 如果没有任务ID，显示欢迎消息
		chatStore.loadHistory(null);
	}
});

// 页面挂载后确保任务信息已加载
onMounted(async () => {
	// 如果URL参数中有taskId，尝试加载任务详情
	if (storyId.value && !currentTask.value?.id) {
		await contextStore.selectTask(storyId.value);
	}
	
	// 如果还没有storyId，尝试从currentTask获取
	if (!storyId.value && currentTask.value?.id) {
		storyId.value = currentTask.value.id;
		chatStore.loadHistory(storyId.value);
	}
});

const goBack = () => {
	uni.navigateBack();
};

const handleSend = async () => {
	const content = draft.value.trim();
	if (!content) return;

	// 确保有storyId
	if (!storyId.value && currentTask.value?.id) {
		storyId.value = currentTask.value.id;
	}
	
	if (!storyId.value) {
		uni.showToast({ title: '任务ID不存在', icon: 'none' });
		return;
	}

	// 清空输入框
	draft.value = '';
	
	// 发送并滚动到底部
	scrollToBottom();
	await chatStore.sendMessage(content, storyId.value);
	scrollToBottom();
};

const handleClear = () => {
	uni.showModal({
		title: '提示',
		content: '确定清空聊天记录吗？',
		success: (res) => {
			if (res.confirm) {
				chatStore.clearChat();
			}
		}
	});
};

const scrollToBottom = () => {
	nextTick(() => {
		// 简单处理：滚动到最新一条消息或底部锚点
		if (messages.value.length > 0) {
			const lastId = messages.value[messages.value.length - 1].id;
			scrollTarget.value = 'msg-' + lastId;
		}
	});
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
	display: flex;
	align-items: center;
}

.message-scroll {
	flex: 1;
	height: 0;
	padding: 30rpx;
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
}
.message-row {
	display: flex;
	align-items: flex-start;
	gap: 16rpx;
	margin-bottom: 30rpx;
}
.message-row.user {
	flex-direction: row-reverse;
}
.message-row.reply {
	flex-direction: row;
}
.avatar {
	width: 68rpx;
	height: 68rpx;
	border-radius: 50%;
	color: white;
	display: flex;
	align-items: center;
	justify-content: center;
	font-weight: 600;
	font-size: 24rpx;
	flex-shrink: 0;
}
.avatar.user {
	background: linear-gradient(135deg, #4C8AF2, #6C5BFF);
}
.avatar.ai {
	background: linear-gradient(135deg, #34D399, #10B981);
}
.avatar.reply {
	background: linear-gradient(135deg, #F59E0B, #EF4444);
}
.bubble {
	max-width: 70%;
	padding: 20rpx 24rpx;
	border-radius: 24rpx;
	background: $card-bg;
	box-shadow: $shadow;
	position: relative;
}
.message-row.user .bubble {
	background: linear-gradient(135deg, #4C8AF2, #6C5BFF);
	color: white;
	border-top-right-radius: 4rpx;
}
.message-row.ai .bubble {
	border-top-left-radius: 4rpx;
}
.message-row.reply .bubble {
	border-top-left-radius: 4rpx;
	background: #FFFFFF;
	border: 2rpx solid #E5E7EB;
}
.reply-header {
	margin-bottom: 8rpx;
}
.reply-name {
	font-size: 24rpx;
	color: #6B7280;
	font-weight: 600;
}
.bubble-text {
	font-size: 28rpx;
	line-height: 1.5;
	word-break: break-all;
}
.timestamp {
	font-size: 20rpx;
	color: $text-light;
	display: block;
	margin-top: 8rpx;
	text-align: right;
}
.message-row.user .timestamp {
	color: rgba(255,255,255,0.7);
}
.message-row.reply .timestamp {
	color: $text-light;
}

/* 输入中动画 */
.bubble.typing {
	display: flex;
	gap: 6rpx;
	padding: 20rpx 30rpx;
}
.dot {
	animation: blink 1.4s infinite both;
}
.dot:nth-child(1) { animation-delay: 0s; }
.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }
@keyframes blink {
	0% { opacity: 0.2; } 20% { opacity: 1; } 100% { opacity: 0.2; }
}

.composer {
	padding: 20rpx 30rpx 40rpx; /* 底部留白适配全面屏 */
	background: #FFFFFF;
	box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.05);
	display: flex;
	align-items: flex-end;
	gap: 20rpx;
}
.composer-input {
	flex: 1;
	min-height: 80rpx;
	max-height: 200rpx;
	border-radius: 20rpx;
	background: #F3F4F6;
	padding: 20rpx;
	font-size: 28rpx;
	color: $text-color;
}
.send-button {
	width: 140rpx;
	height: 80rpx;
	line-height: 80rpx;
	border-radius: 20rpx;
	background: linear-gradient(135deg, #0EA5E9, #2563EB);
	color: white;
	font-size: 28rpx;
	font-weight: 600;
}
.send-button:disabled {
	opacity: 0.5;
	background: #CCCCCC;
}
</style>