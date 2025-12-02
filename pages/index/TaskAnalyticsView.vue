<template>
	<view class="task-analytics-page">
		<view class="header-sticky">
			<view class="header-content">
				<view class="icon-button" @click="goBack">
					<uni-icons type="left" size="22" color="#555555"></uni-icons>
				</view>
				<text class="header-title">任务数据看板</text>
				<view class="icon-button">
					<uni-icons type="more-filled" size="22" color="#555555"></uni-icons>
				</view>
			</view>
		</view>

		<scroll-view scroll-y class="page-scroll">
			<view class="task-header-card">
				<view class="task-header-top">
					<view>
						<text class="task-name">{{ currentTask.storyName }}</text>
						<text class="task-meta">截止 {{ currentTask.deadline }}</text>
					</view>
					<view class="status-chip" :class="currentTask.status">
						<text>{{ getStatusText(currentTask.status) }}</text>
					</view>
				</view>

				<view class="task-info-grid">
					<view class="info-item">
						<text class="info-label">任务类型</text>
						<text class="info-value">团队任务</text>
					</view>
					<view class="info-item">
						<text class="info-label">满分</text>
						<text class="info-value">{{ currentTask.totalScore }}</text>
					</view>
					<view class="info-item">
						<text class="info-label">提交限制</text>
						<text class="info-value">不限次数</text>
					</view>
					<view class="info-item">
						<text class="info-label">讨论活跃</text>
						<text class="info-value">高</text>
					</view>
				</view>
			</view>

			<view class="metric-grid">
				<view class="metric-card">
					<text class="metric-label">提交率</text>
					<text class="metric-value">{{ currentTaskAnalytics.submissionRate }}%</text>
					<view class="mini-progress">
						<view class="mini-progress-fill" :style="{ width: currentTaskAnalytics.submissionRate + '%' }"></view>
					</view>
					<text class="metric-footnote">{{ currentTaskAnalytics.submittedCount }}/{{ currentTaskAnalytics.totalStudents }} 人已提交</text>
				</view>
				<view class="metric-card">
					<text class="metric-label">未提交</text>
					<text class="metric-value" style="color:#F97316;">{{ currentTaskAnalytics.pendingCount }} 人</text>
					<text class="metric-footnote">需督促跟进</text>
				</view>
				<view class="metric-card">
					<text class="metric-label">查看频次</text>
					<text class="metric-value">{{ currentTaskAnalytics.viewCount }}</text>
					<text class="metric-footnote">近 7 天访问</text>
				</view>
				<view class="metric-card">
					<text class="metric-label">讨论次数</text>
					<text class="metric-value">{{ currentTaskAnalytics.discussionCount }}</text>
					<text class="metric-footnote">AI + 同伴互动</text>
				</view>
			</view>

			<view class="action-card">
				<view class="action-item" @click="goTaskDetail">
					<view class="action-icon detail">
						<uni-icons type="compose" size="20" color="#FFFFFF"></uni-icons>
					</view>
					<view class="action-info">
						<text class="action-title">查看任务详情</text>
						<text class="action-desc">查看任务说明与最新提交</text>
					</view>
					<uni-icons type="right" size="18" color="#AAAAAA"></uni-icons>
				</view>
				<view class="action-item" @click="goExcellent">
					<view class="action-icon excellent">
						<uni-icons type="heart" size="20" color="#FFFFFF"></uni-icons>
					</view>
					<view class="action-info">
						<text class="action-title">优秀作业区</text>
						<text class="action-desc">教师推荐作品可参考</text>
					</view>
					<uni-icons type="right" size="18" color="#AAAAAA"></uni-icons>
				</view>
				<view class="action-item" @click="goAIChat">
					<view class="action-icon ai">
						<uni-icons type="chatbubble-filled" size="20" color="#FFFFFF"></uni-icons>
					</view>
					<view class="action-info">
						<text class="action-title">AI 互动讨论</text>
						<text class="action-desc">实时生成解题思路，记录讨论</text>
					</view>
					<uni-icons type="right" size="18" color="#AAAAAA"></uni-icons>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script setup>
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useCourseContextStore } from '@/store/courseContextStore';

const contextStore = useCourseContextStore();
const { currentTask, currentTaskAnalytics } = storeToRefs(contextStore);

onMounted(() => {
	// 页面加载时，根据当前任务ID获取统计数据
	if (currentTask.value.id) {
		contextStore.fetchTaskAnalytics(currentTask.value.id);
	}
});

const getStatusText = (status) => {
  const map = {
      'completed': '已完成',
      'in-progress': '进行中',
      'upcoming': '未开始',
      'submitted': '已提交'
  };
  return map[status] || '未知';
};

const goBack = () => uni.navigateBack();

const goTaskDetail = () => uni.navigateTo({ url: '/pages/index/TaskDetailView' });
const goExcellent = () => uni.navigateTo({ url: '/pages/index/ExcellentWorksView' });
const goAIChat = () => uni.navigateTo({ url: '/pages/index/AITutorView' });
</script>

<style lang="scss" scoped>
$bg-color: #F4F7FA;
$card-bg: #FFFFFF;
$text-color: #333333;
$text-light: #888888;
$shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

.task-analytics-page {
	height: 100vh;
	background-color: $bg-color;
	display: flex;
	flex-direction: column;
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

.page-scroll {
	flex: 1;
	height: 0;
	padding: 30rpx;
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	gap: 30rpx;
}

.task-header-card {
	background: linear-gradient(135deg, #0EA5E9, #2563EB);
	border-radius: 24rpx;
	padding: 40rpx;
	color: white;
	box-shadow: 0 12rpx 30rpx rgba(14, 165, 233, 0.4);
}
.task-header-top {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	gap: 20rpx;
	margin-bottom: 30rpx;
}
.task-name {
	font-size: 40rpx;
	font-weight: bold;
	display: block;
	margin-bottom: 12rpx;
}
.task-meta {
	font-size: 24rpx;
	color: rgba(255, 255, 255, 0.85);
}
.status-chip {
	padding: 10rpx 18rpx;
	border-radius: 12rpx;
	font-size: 24rpx;
	font-weight: 500;
	background: rgba(255, 255, 255, 0.2);
	&.completed {
		color: #059669;
	}
	&.in-progress {
		color: #FDE68A;
	}
	&.pending {
		color: #F87171;
	}
}
.task-info-grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 24rpx;
}
.info-item {
	padding: 20rpx;
	background: rgba(255, 255, 255, 0.12);
	border-radius: 16rpx;
	.info-label {
		font-size: 24rpx;
		color: rgba(255, 255, 255, 0.8);
	}
	.info-value {
		font-size: 30rpx;
		font-weight: bold;
		display: block;
		margin-top: 6rpx;
	}
}

.metric-grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 24rpx;
}
.metric-card {
	background: $card-bg;
	border-radius: 24rpx;
	padding: 32rpx;
	box-shadow: $shadow;
	display: flex;
	flex-direction: column;
	gap: 12rpx;
}
.metric-label {
	font-size: 26rpx;
	color: $text-light;
}
.metric-value {
	font-size: 40rpx;
	font-weight: bold;
	color: $text-color;
}
.mini-progress {
	height: 16rpx;
	background: #F0F0F0;
	border-radius: 10rpx;
	overflow: hidden;
}
.mini-progress-fill {
	height: 100%;
	background: linear-gradient(135deg, #4C8AF2, #6C5BFF);
}
.metric-footnote {
	font-size: 24rpx;
	color: $text-light;
}

.action-card {
	background: $card-bg;
	border-radius: 24rpx;
	box-shadow: $shadow;
}
.action-item {
	display: flex;
	align-items: center;
	padding: 28rpx 30rpx;
	gap: 20rpx;
	border-bottom: 1rpx solid #F0F0F0;
	&:last-child {
		border-bottom: none;
	}
}
.action-icon {
	width: 80rpx;
	height: 80rpx;
	border-radius: 20rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	&.detail {
		background: linear-gradient(135deg, #4C8AF2, #6C5BFF);
	}
	&.excellent {
		background: linear-gradient(135deg, #F472B6, #EC4899);
	}
	&.ai {
		background: linear-gradient(135deg, #34D399, #10B981);
	}
}
.action-info {
	flex: 1;
}
.action-title {
	font-size: 30rpx;
	font-weight: 600;
	color: $text-color;
	display: block;
	margin-bottom: 4rpx;
}
.action-desc {
	font-size: 24rpx;
	color: $text-light;
}
</style>