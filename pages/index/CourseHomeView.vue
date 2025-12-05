<template>
	<view class="course-home-page">
		<!-- 顶部导航栏 -->
		<view class="header-sticky">
			<view class="header-content">
				<view class="icon-button" @click="goBack">
					<uni-icons type="left" size="24" color="#555555"></uni-icons>
				</view>
				<view class="header-text">
					<text class="header-title">{{ currentCourse.courseName || '课程首页' }}</text>
					<text class="header-subtitle">{{ currentCourse.semester || '' }} · {{ currentCourse.teacher || '' }}</text>
				</view>
				<view class="icon-button" @click="goDataDashboard">
					<uni-icons type="pie-chart-filled" size="24" color="#4C8AF2"></uni-icons>
				</view>
			</view>
		</view>

		<scroll-view scroll-y="true" class="page-scroll" @scrolltolower="onScrollToLower">
      <!-- 进度概览卡片（点击进入数据看板 - 个人数据） -->
      <view class="progress-card" @click="goPersonalDashboard">
				<view class="progress-header">
					<view class="progress-title-section">
						<text class="progress-title">学习进度</text>
						<text class="progress-subtitle">已完成 {{ taskStats.completedTasks }}/{{ taskStats.totalTasks }} 个任务</text>
					</view>
					<view class="progress-circle-wrapper">
						<view class="progress-circle" :style="{ background: `conic-gradient(from 0deg, ${getProgressColor(taskStats.completionRate)} 0%, ${getProgressColor(taskStats.completionRate)} ${taskStats.completionRate}%, #E5E7EB ${taskStats.completionRate}%, #E5E7EB 100%)` }">
							<view class="progress-inner">
								<text class="progress-percent">{{ taskStats.completionRate }}%</text>
							</view>
						</view>
					</view>
				</view>
				<view class="progress-stats">
					<view class="stat-item">
						<view class="stat-icon completed">
							<uni-icons type="checkmarkempty" size="18" color="#2ECC71"></uni-icons>
						</view>
						<view class="stat-content">
							<text class="stat-value">{{ taskStats.completedTasks }}</text>
							<text class="stat-label">已完成</text>
						</view>
					</view>
					<view class="stat-item">
						<view class="stat-icon pending">
							<uni-icons type="clock" size="18" color="#F39C12"></uni-icons>
						</view>
						<view class="stat-content">
							<text class="stat-value">{{ pendingTasksCount }}</text>
							<text class="stat-label">待完成</text>
				</view>
					</view>
					<view class="stat-item">
						<view class="stat-icon overdue">
							<uni-icons type="flag" size="18" color="#E74C3C"></uni-icons>
						</view>
						<view class="stat-content">
							<text class="stat-value">{{ overdueTasksCount }}</text>
							<text class="stat-label">已逾期</text>
						</view>
						</view>
					</view>
				</view>

      <!-- 任务地图入口 -->
      <view class="entry-card" @click="goTaskMap">
        <view class="entry-left">
          <uni-icons type="map-filled" size="24" color="#4C8AF2"></uni-icons>
          <text class="entry-title">进入任务地图</text>
        </view>
        <view class="entry-right">
          <text class="entry-desc">查看本课程全部任务进度</text>
          <uni-icons type="right" size="20" color="#999"></uni-icons>
        </view>
      </view>

      <!-- 团队信息卡片（如果有团队，点击进入数据看板 - 团队数据） -->
      <view v-if="myTeam.id" class="team-card" @click="goTeamDashboard">
				<view class="team-header">
					<view class="team-info">
						<view class="team-icon-wrapper">
							<uni-icons type="person-filled" size="28" color="#FFFFFF"></uni-icons>
						</view>
						<view class="team-details">
							<text class="team-name">{{ myTeam.groupName || '未命名团队' }}</text>
							<text class="team-meta">{{ teamMembers.length }} 名成员 · 总分 {{ myTeam.totalScore || 0 }}</text>
						</view>
					</view>
					<uni-icons type="right" size="20" color="#999"></uni-icons>
				</view>
			</view>
		<view v-else class="team-card empty" @click="goTeamDashboard">
		    <view class="team-header">
		        <view class="team-info">
		            <view class="team-icon-wrapper empty-icon">
		                <uni-icons type="staff" size="28" color="#BDC3C7"></uni-icons>
		            </view>
		            <view class="team-details">
		                <text class="team-name" style="color: #666;">暂未加入团队</text>
		                <text class="team-meta">点击创建或加入团队</text>
		            </view>
		        </view>
		        <uni-icons type="right" size="20" color="#999"></uni-icons>
		    </view>
		</view>
      <!-- 近期任务列表（即使暂无任务也展示提示） -->
			<view class="card-box">
				<view class="section-header">
					<view class="header-left">
						<uni-icons type="flag-filled" size="20" color="#E74C3C"></uni-icons>
            <text class="section-title">近期任务</text>
					</view>
					<text class="view-all" @click="goTaskMap">查看全部</text>
				</view>
				<view v-if="urgentTasks.length > 0" class="task-list">
					<view 
						v-for="task in urgentTasks.slice(0, 3)" 
						:key="task.id"
						class="task-item"
						@click="handleTaskClick(task.id)"
					>
						<view class="task-item-left">
							<view class="task-status-dot" :class="task.status"></view>
							<view class="task-info">
								<text class="task-name">{{ task.storyName }}</text>
								<text class="task-meta">
									{{ formatDeadline(task.deadline) }}
									<text v-if="task.totalScore" class="task-score"> · {{ task.totalScore }}分</text>
								</text>
						</view>
					</view>
						<view class="task-item-right">
							<view class="task-status-badge" :class="task.status">
								<text>{{ getStatusText(task.status) }}</text>
						</view>
					</view>
				</view>
				</view>
        <view v-else class="recent-empty">
          <text class="recent-empty-text">近期暂无任务</text>
          <text class="recent-empty-hint">开始或提交任务后，将会出现在这里</text>
        </view>
			</view>

			<!-- 空状态提示 -->
			<view v-if="taskStats.totalTasks === 0" class="empty-state">
				<uni-icons type="info" size="64" color="#BDC3C7"></uni-icons>
				<text class="empty-text">暂无任务</text>
				<text class="empty-hint">课程任务将在课程开始后发布</text>
			</view>
		</scroll-view>
	</view>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { onPullDownRefresh } from '@dcloudio/uni-app';
import { useCourseContextStore } from '@/store/courseContextStore';

const contextStore = useCourseContextStore();
const { currentCourse, taskStats, taskNodes, myTeam, teamMembers } = storeToRefs(contextStore);

// 计算待完成任务
const pendingTasksCount = computed(() => {
	return taskNodes.value.filter(t => ['in-progress', 'upcoming'].includes(t.status)).length;
});

// 计算逾期任务
const overdueTasksCount = computed(() => {
	return taskNodes.value.filter(t => t.status === 'overdue').length;
});

// 获取近期任务（进行中 + 已提交，按截止时间排序）
const urgentTasks = computed(() => {
  const statusPriority = {
    'in-progress': 0,
    'submitted': 1
  };
	const urgent = taskNodes.value.filter(t => 
    ['in-progress', 'submitted'].includes(t.status)
	);
	// 先按状态优先级排序，再按截止时间
	return urgent.sort((a, b) => {
    const priorityDiff =
      (statusPriority[a.status] ?? 99) - (statusPriority[b.status] ?? 99);
    if (priorityDiff !== 0) {
      return priorityDiff;
    }
		if (!a.deadline && !b.deadline) return 0;
		if (!a.deadline) return 1;
		if (!b.deadline) return -1;
		return new Date(a.deadline) - new Date(b.deadline);
	});
});

// 获取进度颜色
const getProgressColor = (rate) => {
	if (rate >= 80) return '#2ECC71';
	if (rate >= 50) return '#4C8AF2';
	return '#F39C12';
};

// 格式化截止时间
const formatDeadline = (deadline) => {
	if (!deadline) return '无截止时间';
	try {
		const date = new Date(deadline);
		const now = new Date();
		const diff = date.getTime() - now.getTime();
		const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
		
		if (days < 0) return '已逾期';
		if (days === 0) return '今天截止';
		if (days === 1) return '明天截止';
		if (days <= 7) return `${days}天后截止`;
		
		const month = date.getMonth() + 1;
		const day = date.getDate();
		return `${month}月${day}日`;
	} catch (e) {
		return '日期错误';
	}
};

// 获取状态文本
const getStatusText = (status) => {
	const map = {
		'completed': '已完成',
		'submitted': '已提交',
		'in-progress': '进行中',
		'upcoming': '待开始',
		'overdue': '已逾期'
	};
	return map[status] || '未知';
};

// 处理任务点击
const handleTaskClick = (taskId) => {
	contextStore.selectTask(taskId);
	uni.navigateTo({ url: '/pages/index/TaskDetailView' });
};

// 滚动到底部
const onScrollToLower = () => {
	// 可以在这里加载更多数据
};

onMounted(() => {
  if (!currentCourse.value.courseId) {
		// 尝试从本地存储恢复课程ID
		try {
			const savedCourseId = uni.getStorageSync('currentCourseId');
			if (savedCourseId) {
				contextStore.initCourseContext(savedCourseId);
			}
		} catch (e) {
			console.warn('获取本地课程ID失败', e);
		}
  }
});

// 下拉刷新：重新初始化当前课程上下文并停止刷新动画
onPullDownRefresh(async () => {
  try {
    let courseId = currentCourse.value.courseId;
    if (!courseId) {
      try {
        const savedCourseId = uni.getStorageSync('currentCourseId');
        if (savedCourseId) {
          courseId = savedCourseId;
        }
      } catch (e) {
        console.warn('下拉刷新获取本地课程ID失败', e);
      }
    }

    if (courseId) {
      await contextStore.initCourseContext(courseId);
    }
  } finally {
    uni.stopPullDownRefresh();
  }
});

const goBack = () => {
  const pages = getCurrentPages();
  if (pages.length > 1) uni.navigateBack();
  else uni.switchTab({ url: '/pages/index/CourseListView' });
};

const goTaskMap = () => uni.navigateTo({ url: '/pages/index/TaskKanbanView' });
// 默认按钮（右上角）进入个人数据
const goDataDashboard = () => uni.navigateTo({ url: '/pages/index/DataDashboardView?tab=personal' });
// 进度卡片进入个人数据
const goPersonalDashboard = () => uni.navigateTo({ url: '/pages/index/DataDashboardView?tab=personal' });
// 小组卡片进入团队数据
const goTeamDashboard = () => uni.navigateTo({ url: '/pages/index/DataDashboardView?tab=team' });
const goTeam = () => uni.navigateTo({ url: '/pages/index/TeamView' });
const goExcellent = () => uni.navigateTo({ url: '/pages/index/ExcellentWorksView' });
const goAITutor = () => uni.navigateTo({ url: '/pages/index/AITutorView' });
</script>

<style lang="scss" scoped>
$bg-color: #F4F7FA;
$card-bg: #FFFFFF;
$text-color: #333333;
$text-light: #666666;
$text-lighter: #999999;
$theme-color: #4C8AF2;
$shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
$shadow-hover: 0 8px 24px rgba(0, 0, 0, 0.1);

.course-home-page {
	height: 100vh;
	background: linear-gradient(180deg, #F8FAFC 0%, $bg-color 100%);
	display: flex;
	flex-direction: column;
}

.header-sticky {
    position: sticky;
    top: 0;
    z-index: 100;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-bottom: 1rpx solid #E5E7EB;
    
    /* 1. 先设置左右和底部的 padding */
    padding-left: 30rpx;
    padding-right: 30rpx;
    padding-bottom: 20rpx;
    
    /* 2. 单独设置顶部 padding：状态栏高度 + 原有的 20rpx 间距 */
    /* 注意：必须放在 padding 简写属性之后（如果有的话），或者像这样分开写 */
    padding-top: calc(var(--status-bar-height) + 20rpx);
}

.header-content {
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 88rpx;
}

.icon-button {
	width: 80rpx;
	height: 80rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 16rpx;
	transition: background 0.2s;
	&:active {
		background: #F3F4F6;
	}
}

.header-text {
	flex: 1;
	padding: 0 20rpx;
	display: flex;
	flex-direction: column;
	gap: 8rpx;
}

.header-title {
	font-size: 34rpx;
	font-weight: bold;
	color: $text-color;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.header-subtitle {
	font-size: 24rpx;
	color: $text-lighter;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.page-scroll {
	flex: 1;
	height: 0;
	padding: 30rpx;
	box-sizing: border-box;
}

// 进度卡片
.progress-card {
	background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%);
	border-radius: 32rpx;
	padding: 40rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
	color: white;
}

.progress-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: 40rpx;
}

.progress-title-section {
	flex: 1;
}

.progress-title {
	font-size: 36rpx;
	font-weight: bold;
	margin-bottom: 12rpx;
	display: block;
}

.progress-subtitle {
	font-size: 24rpx;
	opacity: 0.9;
	display: block;
}

.progress-circle-wrapper {
	width: 160rpx;
	height: 160rpx;
}

.progress-circle {
	width: 100%;
	height: 100%;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;
}

.progress-inner {
	width: 120rpx;
	height: 120rpx;
	background: rgba(255, 255, 255, 0.2);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	backdrop-filter: blur(10px);
}

.progress-percent {
	font-size: 40rpx;
	font-weight: bold;
	color: white;
}

.progress-stats {
	display: flex;
	gap: 30rpx;
}

.stat-item {
	flex: 1;
	display: flex;
	align-items: center;
	gap: 16rpx;
	background: rgba(255, 255, 255, 0.15);
	border-radius: 16rpx;
	padding: 20rpx;
	backdrop-filter: blur(10px);
}

.stat-icon {
	width: 56rpx;
	height: 56rpx;
	border-radius: 12rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(255, 255, 255, 0.2);
	&.completed { background: rgba(46, 204, 113, 0.3); }
	&.pending { background: rgba(243, 156, 18, 0.3); }
	&.overdue { background: rgba(231, 76, 60, 0.3); }
}

.stat-content {
	display: flex;
	flex-direction: column;
	gap: 4rpx;
}

.stat-value {
	font-size: 32rpx;
	font-weight: bold;
	color: white;
}

.stat-label {
	font-size: 22rpx;
	opacity: 0.8;
	color: white;
}

// 团队卡片
.team-card {
	background: $card-bg;
	border-radius: 24rpx;
	padding: 30rpx;
	margin-bottom: 30rpx;
	box-shadow: $shadow;
	transition: all 0.3s;
	&:active {
		transform: scale(0.98);
		box-shadow: $shadow-hover;
	}
}

.team-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.team-info {
	display: flex;
	align-items: center;
	gap: 24rpx;
	flex: 1;
}

.team-icon-wrapper {
	width: 96rpx;
	height: 96rpx;
	background: linear-gradient(135deg, #2ECC71, #27AE60);
	border-radius: 20rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 4px 12px rgba(46, 204, 113, 0.3);
}

.team-icon-wrapper.empty-icon {
    background: #F0F2F5; /* 灰色背景 */
    box-shadow: none;
}

/* 可以给未加入的卡片加个虚线边框或其他样式区别 */
.team-card.empty {
    border: 2rpx dashed #E0E0E0;
    background: #FAFAFA;
}

.team-details {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 8rpx;
}

.team-name {
	font-size: 32rpx;
	font-weight: bold;
	color: $text-color;
}

.team-meta {
	font-size: 24rpx;
	color: $text-lighter;
}

// 卡片通用样式
.card-box {
	background: $card-bg;
	border-radius: 24rpx;
	padding: 40rpx;
	margin-bottom: 30rpx;
	box-shadow: $shadow;
}

.section-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 30rpx;
}

.header-left {
	display: flex;
	align-items: center;
	gap: 12rpx;
}

.section-title {
	font-size: 32rpx;
	font-weight: bold;
	color: $text-color;
}

.view-all {
	font-size: 26rpx;
	color: $theme-color;
}

// 任务列表
.task-list {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.task-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 24rpx;
	background: #F9FAFB;
	border-radius: 16rpx;
	transition: all 0.2s;
	&:active {
		background: #F3F4F6;
		transform: scale(0.98);
	}
}

.task-item-left {
	display: flex;
	align-items: center;
	gap: 20rpx;
	flex: 1;
	min-width: 0;
}

.task-status-dot {
	width: 16rpx;
	height: 16rpx;
	border-radius: 50%;
	flex-shrink: 0;
	&.completed { background: #2ECC71; }
	&.submitted { background: #4C8AF2; }
	&.in-progress { background: #F39C12; }
	&.upcoming { background: #BDC3C7; }
	&.overdue { background: #E74C3C; }
}

.task-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 8rpx;
	min-width: 0;
}

.task-name {
	font-size: 28rpx;
	font-weight: 500;
	color: $text-color;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.task-meta {
	font-size: 24rpx;
	color: $text-lighter;
}

.task-score {
	color: $theme-color;
	font-weight: 500;
}

.task-item-right {
	flex-shrink: 0;
}

.task-status-badge {
	padding: 8rpx 16rpx;
	border-radius: 20rpx;
	font-size: 22rpx;
	&.completed { background: #D5F4E6; color: #2ECC71; }
	&.submitted { background: #DBEAFE; color: #4C8AF2; }
	&.in-progress { background: #FEF3C7; color: #F39C12; }
	&.upcoming { background: #F3F4F6; color: #6B7280; }
	&.overdue { background: #FEE2E2; color: #E74C3C; }
}

// 近期任务空提示
.recent-empty {
  padding: 20rpx;
  border-radius: 16rpx;
  background: #F9FAFB;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.recent-empty-text {
  font-size: 28rpx;
  color: $text-light;
  font-weight: 500;
}

.recent-empty-hint {
  font-size: 24rpx;
  color: $text-lighter;
}

// 任务地图入口
.entry-card {
  background: $card-bg;
  border-radius: 24rpx;
  padding: 26rpx 30rpx;
  margin-bottom: 24rpx;
  box-shadow: $shadow;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.entry-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.entry-title {
  font-size: 30rpx;
  font-weight: 600;
  color: $text-color;
}

.entry-right {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.entry-desc {
  font-size: 24rpx;
  color: $text-lighter;
}

// 空状态
.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 100rpx 0;
	gap: 20rpx;
}

.empty-text {
	font-size: 32rpx;
	color: $text-light;
	font-weight: 500;
}

.empty-hint {
	font-size: 26rpx;
	color: $text-lighter;
}
</style>
