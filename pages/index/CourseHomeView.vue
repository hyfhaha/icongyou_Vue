<template>
	<view class="course-home-page">
		<view class="header-sticky">
			<view class="header-content">
				<view class="icon-button" @click="goBack">
					<uni-icons type="left" size="24" color="#555555"></uni-icons>
				</view>
				<view class="header-text">
					<text class="header-title">{{ courseDetail.name }}</text>
					<text class="header-subtitle">{{ courseDetail.semester }} · {{ courseDetail.teacher }}</text>
				</view>
				<view class="icon-button"></view>
			</view>
		</view>

		<scroll-view scroll-y="true" class="page-scroll">
			
			<view class="card-box highlight-card">
				<view class="card-title-row">
					<uni-icons type="list" size="20" color="#2ECC71"></uni-icons>
					<text class="card-title">当前任务进度</text>
				</view>

				<view class="completion-section">
					<view class="completion-chart">
						<text class="completion-rate">{{ completionRate }}%</text>
						<text class="completion-label">整体完成率</text>
					</view>
					<view class="completion-stats">
						<view class="stat-row">
							<text>已完成任务</text>
							<text class="stat-num">{{ courseDetail.completedTasks }}</text>
						</view>
						<view class="stat-row">
							<text>待完成任务</text>
							<text class="stat-num warning">{{ courseDetail.totalTasks - courseDetail.completedTasks }}</text>
						</view>
					</view>
				</view>

				<view class="action-buttons">
					<button class="button-primary" @click="goTaskMap">
						<uni-icons type="map-filled" size="20" color="#FFFFFF"></uni-icons>
						<text>进入任务地图</text>
					</button>
					
					<button class="button-outline" @click="goDataDashboard">
						<uni-icons type="pie-chart-filled" size="20" color="#4C8AF2"></uni-icons>
						<text>查看数据页面</text>
					</button>
				</view>
			</view>

			<view class="card-box">
				<text class="section-header">快捷访问</text>
				<view class="quick-grid">
					<view class="quick-item" @click="goExcellent">
						<view class="quick-icon pink">
							<uni-icons type="heart-filled" size="24" color="#FFFFFF"></uni-icons>
						</view>
						<text>优秀作业</text>
					</view>
					<view class="quick-item" @click="goAITutor">
						<view class="quick-icon blue">
							<uni-icons type="chatbubble-filled" size="24" color="#FFFFFF"></uni-icons>
						</view>
						<text>AI 答疑</text>
					</view>
				</view>
			</view>

		</scroll-view>
	</view>
</template>

<script setup>
import { computed, ref } from 'vue';

const courseDetail = ref({
  id: 1,
  name: '软件产品构建实训',
  semester: '2025 春季',
  teacher: '张老师',
  totalTasks: 18,
  completedTasks: 12
});

const completionRate = computed(() => {
  if (!courseDetail.value.totalTasks) return 0;
  return Math.round((courseDetail.value.completedTasks / courseDetail.value.totalTasks) * 100);
});

const goBack = () => {
  const pages = getCurrentPages();
  if (pages.length > 1) {
    uni.navigateBack();
  } else {
    uni.switchTab({ url: '/pages/index/CourseListView' });
  }
};

const goTaskMap = () => {
  uni.navigateTo({ url: '/pages/index/TaskKanbanView' });
};

const goDataDashboard = () => {
  uni.navigateTo({ url: '/pages/index/DataDashboardView' });
};

const goExcellent = () => {
  uni.navigateTo({ url: '/pages/index/ExcellentWorksView' });
};

const goAITutor = () => {
  uni.navigateTo({ url: '/pages/index/AITutorView' });
};
</script>

<style lang="scss" scoped>
$bg-color: #F4F7FA;
$card-bg: #FFFFFF;
$text-color: #333333;
$theme-color: #4C8AF2;
$shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

.course-home-page {
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
	height: 88rpx;
}
.icon-button { width: 80rpx; height: 80rpx; display: flex; align-items: center; justify-content: center; }
.header-text { flex: 1; padding: 0 16rpx; }
.header-title { font-size: 32rpx; font-weight: bold; color: $text-color; }
.header-subtitle { font-size: 24rpx; color: #888; }

.page-scroll { flex: 1; height: 0; padding: 30rpx; box-sizing: border-box; }

.card-box {
	background: $card-bg; border-radius: 24rpx; padding: 40rpx; box-shadow: $shadow; margin-bottom: 30rpx;
}
.card-title-row { display: flex; align-items: center; gap: 16rpx; margin-bottom: 40rpx; }
.card-title { font-size: 32rpx; font-weight: bold; color: $text-color; }

.completion-section { display: flex; align-items: center; gap: 40rpx; margin-bottom: 40rpx; }
.completion-chart {
	width: 180rpx; height: 180rpx; border-radius: 50%; background: #F0F4FF; border: 10rpx solid #E0E7FF;
	display: flex; flex-direction: column; align-items: center; justify-content: center;
}
.completion-rate { font-size: 48rpx; font-weight: bold; color: $theme-color; }
.completion-label { font-size: 20rpx; color: #888; }
.completion-stats { flex: 1; display: flex; flex-direction: column; gap: 20rpx; }
.stat-row { display: flex; justify-content: space-between; font-size: 28rpx; color: #666; }
.stat-num { font-weight: bold; color: $text-color; }
.stat-num.warning { color: #F39C12; }

.action-buttons { display: flex; flex-direction: column; gap: 24rpx; }
.button-primary {
	background: linear-gradient(135deg, #4C8AF2, #6C5BFF); color: white;
	height: 96rpx; border-radius: 20rpx; font-size: 30rpx; font-weight: bold;
	display: flex; align-items: center; justify-content: center; gap: 16rpx;
}
.button-outline {
	background: white; border: 2rpx solid $theme-color; color: $theme-color;
	height: 96rpx; border-radius: 20rpx; font-size: 30rpx; font-weight: 500;
	display: flex; align-items: center; justify-content: center; gap: 16rpx;
}

.section-header { font-size: 28rpx; font-weight: bold; margin-bottom: 20rpx; display: block; }
.quick-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20rpx; }
.quick-item { background: #F9FAFB; border-radius: 20rpx; padding: 30rpx; display: flex; align-items: center; gap: 20rpx; }
.quick-icon {
	width: 80rpx; height: 80rpx; border-radius: 16rpx; display: flex; align-items: center; justify-content: center;
	&.pink { background: linear-gradient(135deg, #F472B6, #EC4899); }
	&.blue { background: linear-gradient(135deg, #38BDF8, #0EA5E9); }
}
</style>