<template>
	<view class="course-home-page">
		<!-- 自定义头部 -->
		<view class="header-sticky">
			<view class="header-content">
				<view class="icon-button" @click="goBack">
					<uni-icons type="left" size="22" color="#555555"></uni-icons>
				</view>
				<view class="header-text">
					<text class="header-title">{{ courseDetail.name }}</text>
					<text class="header-subtitle">{{ courseDetail.semester }} · {{ courseDetail.teacher }}</text>
				</view>
				<view class="icon-button" @click="goSettings">
					<uni-icons type="gear-filled" size="22" color="#555555"></uni-icons>
				</view>
			</view>
		</view>

		<scroll-view scroll-y="true" class="page-scroll">
			<!-- 汇总数据 -->
			<view class="summary-card">
				<view class="score-block">
					<text class="block-label">课程总得分</text>
					<text class="block-value">{{ courseDetail.totalScore }}</text>
					<text class="block-sub">班级均分 {{ courseDetail.avgScore }}</text>
				</view>
				<view class="divider"></view>
				<view class="rank-block">
					<text class="block-label">当前排名</text>
					<text class="block-value" style="color: #F97316;">#{{ courseDetail.rank }}</text>
					<text class="block-sub">Top {{ courseDetail.rankPercent }}%</text>
				</view>
			</view>

			<!-- 能力维度 -->
			<view class="card-box">
				<view class="card-title-row">
					<uni-icons type="pyq" size="20" color="#4C8AF2"></uni-icons>
					<text class="card-title">工程认证能力维度达成度</text>
				</view>
				<view class="dimension-list">
					<view
						v-for="dimension in abilityDimensions"
						:key="dimension.id"
						class="dimension-item"
					>
						<view class="dimension-header">
							<text class="dimension-name">{{ dimension.label }}</text>
							<text class="dimension-value">{{ dimension.value }}%</text>
						</view>
						<view class="progress-bar-bg">
							<view
								class="progress-bar-fill"
								:style="{ width: dimension.value + '%', background: dimension.color }"
							></view>
						</view>
						<text class="dimension-comment">{{ dimension.comment }}</text>
					</view>
				</view>
			</view>

			<!-- 任务完成情况 -->
			<view class="card-box">
				<view class="card-title-row">
					<uni-icons type="list" size="20" color="#2ECC71"></uni-icons>
					<text class="card-title">任务完成情况</text>
				</view>

				<view class="completion-section">
					<view class="completion-chart">
						<text class="completion-rate">{{ completionRate }}%</text>
						<text class="completion-label">整体完成率</text>
					</view>
					<view class="completion-stats">
						<view class="stat-row">
							<text>已完成</text>
							<text>{{ courseDetail.completedTasks }}</text>
						</view>
						<view class="stat-row">
							<text>未完成</text>
							<text>{{ courseDetail.totalTasks - courseDetail.completedTasks }}</text>
						</view>
						<view class="stat-row">
							<text>包含团队任务</text>
							<text>{{ courseDetail.teamTasks }} 个</text>
						</view>
					</view>
				</view>

				<view class="action-buttons">
					<button class="button-primary" @click="goTaskMap">
						<uni-icons type="calendar-filled" size="18" color="#FFFFFF"></uni-icons>
						<text>进入任务地图</text>
					</button>
					<button class="button-outline" @click="goTeamPage">
						<uni-icons type="staff-filled" size="18" color="#4C8AF2"></uni-icons>
						<text>查看团队数据</text>
					</button>
				</view>
			</view>

			<!-- 数据看板入口 -->
			<view class="card-box">
				<view class="card-title-row">
					<uni-icons type="color" size="20" color="#9B59B6"></uni-icons>
					<text class="card-title">数据看板与任务联动</text>
				</view>
				<view class="data-grid">
					<view
						v-for="panel in quickPanels"
						:key="panel.id"
						class="data-card"
						@click="handlePanelClick(panel)"
					>
						<view class="panel-icon" :style="{ background: panel.gradient }">
							<uni-icons :type="panel.icon" size="20" color="#FFFFFF"></uni-icons>
						</view>
						<text class="panel-label">{{ panel.label }}</text>
						<text class="panel-value">{{ panel.value }}</text>
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
  name: '软件产品构建实训（2025）',
  semester: '2025 春季',
  teacher: '张老师',
  totalScore: 312,
  avgScore: 286,
  rank: 4,
  rankPercent: 15,
  totalTasks: 18,
  completedTasks: 12,
  teamTasks: 8
});

const abilityDimensions = ref([
  { id: 'collaboration', label: '团队协作', value: 82, color: '#4C8AF2', comment: '与团队保持高效沟通，按时交付' },
  { id: 'design', label: '方案设计', value: 75, color: '#9B59B6', comment: '原型交互质量良好，可继续迭代' },
  { id: 'implementation', label: '软件构建', value: 68, color: '#2ECC71', comment: '核心功能完成，代码规范可加强' },
  { id: 'quality', label: '质量保障', value: 60, color: '#F39C12', comment: '缺陷收敛较慢，建议安排专项测试' }
]);

const quickPanels = [
  { id: 'task-board', label: '任务数据看板', value: 'T4-1', icon: 'chart-bar', gradient: 'linear-gradient(135deg, #4C8AF2, #6C5BFF)' },
  { id: 'excellent', label: '优秀作业', value: '6 篇', icon: 'heart', gradient: 'linear-gradient(135deg, #F472B6, #EC4899)' },
  { id: 'ai', label: 'AI 互动次数', value: '18', icon: 'chatbubble-filled', gradient: 'linear-gradient(135deg, #38BDF8, #0EA5E9)' },
  { id: 'settings', label: '学习偏好', value: '已配置', icon: 'gear-filled', gradient: 'linear-gradient(135deg, #FACC15, #FB923C)' }
];

const completionRate = computed(() => {
  if (!courseDetail.value.totalTasks) return 0;
  return Math.round((courseDetail.value.completedTasks / courseDetail.value.totalTasks) * 100);
});

const goBack = () => {
  uni.navigateBack();
};

const goSettings = () => {
  uni.navigateTo({
    url: '/pages/index/SettingsView'
  });
};

const goTaskMap = () => {
  uni.navigateTo({
    url: '/pages/index/TaskKanbanView'
  });
};

const goTeamPage = () => {
  uni.navigateTo({
    url: '/pages/index/TeamView'
  });
};

const handlePanelClick = (panel) => {
  if (panel.id === 'task-board') {
    uni.navigateTo({
      url: '/pages/index/TaskAnalyticsView?taskId=T4-1'
    });
  } else if (panel.id === 'excellent') {
    uni.navigateTo({
      url: '/pages/index/ExcellentWorksView?taskId=T4-1'
    });
  } else if (panel.id === 'ai') {
    uni.navigateTo({
      url: '/pages/index/AITutorView?taskId=T4-1'
    });
  } else if (panel.id === 'settings') {
    goSettings();
  }
};
</script>

<style lang="scss" scoped>
$bg-color: #F4F7FA;
$card-bg: #FFFFFF;
$text-color: #333333;
$text-light: #888888;
$border-color: #EAEAEA;
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
	height: 100rpx;
}
.icon-button {
	width: 80rpx;
	height: 80rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}
.header-text {
	flex: 1;
	padding: 0 16rpx;
}
.header-title {
	font-size: 34rpx;
	font-weight: bold;
	color: $text-color;
	display: block;
}
.header-subtitle {
	font-size: 24rpx;
	color: $text-light;
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

.summary-card {
	display: flex;
	justify-content: space-between;
	background: linear-gradient(135deg, #4C8AF2, #6C5BFF);
	border-radius: 24rpx;
	padding: 40rpx 30rpx;
	color: white;
	box-shadow: 0 10rpx 30rpx rgba(76, 138, 242, 0.3);
}
.score-block,
.rank-block {
	flex: 1;
}
.block-label {
	font-size: 26rpx;
	color: rgba(255, 255, 255, 0.8);
}
.block-value {
	font-size: 60rpx;
	font-weight: bold;
	display: block;
	margin: 8rpx 0;
}
.block-sub {
	font-size: 24rpx;
	color: rgba(255, 255, 255, 0.9);
}
.divider {
	width: 1rpx;
	background: rgba(255, 255, 255, 0.2);
	margin: 0 30rpx;
}

.card-box {
	background: $card-bg;
	border-radius: 24rpx;
	padding: 40rpx;
	box-shadow: $shadow;
}
.card-title-row {
	display: flex;
	align-items: center;
	gap: 16rpx;
	margin-bottom: 30rpx;
	.card-title {
		font-size: 32rpx;
		font-weight: bold;
		color: $text-color;
	}
}

.dimension-list {
	display: flex;
	flex-direction: column;
	gap: 24rpx;
}
.dimension-item {
	.dimension-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 10rpx;
	}
	.dimension-name {
		font-size: 28rpx;
		font-weight: 500;
		color: $text-color;
	}
	.dimension-value {
		font-size: 28rpx;
		font-weight: bold;
	}
	.progress-bar-bg {
		height: 22rpx;
		background: #F0F0F0;
		border-radius: 12rpx;
		overflow: hidden;
	}
	.progress-bar-fill {
		height: 100%;
		border-radius: 12rpx;
	}
	.dimension-comment {
		margin-top: 8rpx;
		font-size: 24rpx;
		color: $text-light;
	}
}

.completion-section {
	display: flex;
	align-items: center;
	gap: 30rpx;
}
.completion-chart {
	width: 220rpx;
	height: 220rpx;
	border-radius: 50%;
	background: #F0F4FF;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	border: 12rpx solid #E0E7FF;
}
.completion-rate {
	font-size: 48rpx;
	font-weight: bold;
	color: #4C8AF2;
}
.completion-label {
	font-size: 24rpx;
	color: $text-light;
	margin-top: 4rpx;
}
.completion-stats {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 18rpx;
}
.stat-row {
	display: flex;
	justify-content: space-between;
	font-size: 28rpx;
	color: $text-color;
}

.action-buttons {
	margin-top: 30rpx;
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}
.button-primary, .button-outline {
	height: 96rpx;
	border-radius: 20rpx;
	font-size: 30rpx;
	font-weight: 600;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 14rpx;
}
.button-primary {
	background: linear-gradient(135deg, #4C8AF2, #6C5BFF);
	color: white;
	box-shadow: 0 8rpx 20rpx rgba(76, 138, 242, 0.3);
}
.button-outline {
	border: 2rpx solid #4C8AF2;
	color: #4C8AF2;
	background: transparent;
}

.data-grid {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 24rpx;
}
.data-card {
	padding: 24rpx;
	border-radius: 20rpx;
	background: $bg-color;
	display: flex;
	flex-direction: column;
	gap: 12rpx;
}
.panel-icon {
	width: 64rpx;
	height: 64rpx;
	border-radius: 16rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}
.panel-label {
	font-size: 26rpx;
	color: $text-light;
}
.panel-value {
	font-size: 32rpx;
	font-weight: bold;
	color: $text-color;
}
</style>

