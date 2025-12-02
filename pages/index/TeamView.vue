<template>
	<view class="team-page">
		<!-- 头部 -->
		<view class="header-sticky">
			<view class="header-content">
				<view class="icon-button" @click="goBack">
					<uni-icons type="left" size="24" color="#555555"></uni-icons>
				</view>
				<text class="header-title">我的团队</text>
				<view class="icon-button">
					<uni-icons type="more-filled" size="24" color="#555555"></uni-icons>
				</view>
			</view>
		</view>

		<scroll-view scroll-y="true" class="page-scroll">
			<!-- 团队头部卡片 -->
			<view class="team-header-card" v-if="myTeam.id">
				<view class="header-top">
					<view>
						<text class="team-name">{{ myTeam.groupName || '未命名团队' }}</text>
						<text class="course-name">{{ currentCourse.courseName || '未选择课程' }}</text>
					</view>
					<view class="score-box">
						<text class="team-score">{{ myTeam.totalScore || 0 }}</text>
						<text class="score-label">团队总分</text>
					</view>
				</view>
				
				<view class="header-stats">
					<view class="stat-item">
						<text class="stat-value">{{ teamMembers.length }}</text>
						<text class="stat-label">成员</text>
					</view>
					<view class="stat-item">
						<text class="stat-value">{{ teamRank ? `#${teamRank}` : '--' }}</text>
						<text class="stat-label">排名</text>
					</view>
					<view class="stat-item">
						<text class="stat-value">{{ teamTasks.filter(t => t.status === 'completed').length }}</text>
						<text class="stat-label">已完成任务</text>
					</view>
				</view>
			</view>

			<!-- 未加入团队提示 -->
			<view v-else class="empty-state">
				<uni-icons type="info" size="48" color="#999"></uni-icons>
				<text class="empty-text">您尚未加入任何团队</text>
			</view>

			<!-- 团队成员 (US26, US27) -->
			<view class="card-box" v-if="myTeam.id">
				<view class="card-title-row">
					<uni-icons type="staff-filled" size="20" color="#4C8AF2"></uni-icons>
					<text class="card-title">团队成员</text>
				</view>
				<view class="member-list" v-if="teamMembers.length > 0">
					<view
						v-for="member in teamMembers"
						:key="member.id"
						class="member-item"
					>
						<view class="member-info">
							<view class="avatar-wrapper">
								<view class="avatar" :style="{ background: member.isLeader ? 'linear-gradient(135deg, #F9D423, #F97316)' : 'linear-gradient(135deg, #4C8AF2, #6C5BFF)' }">
									<text>{{ (member.name || '').charAt(0) || '?' }}</text>
								</view>
								<view v-if="member.isLeader" class="leader-icon">
									<uni-icons type="star-filled" size="10" color="#FFFFFF"></uni-icons>
								</view>
							</view>
							
							<view class="member-details">
								<view class="member-name-row">
									<text class="member-name">{{ member.name || '未知' }}</text>
									<text v-if="member.isLeader" class="leader-badge">队长</text>
								</view>
								<text class="member-id" v-if="member.studentId">学号: {{ member.studentId }}</text>
								<text class="member-id" v-else>学号: --</text>
							</view>
						</view>

						<view class="member-contribution">
							<text class="contribution-value">{{ member.contribution || 0 }}%</text>
							<text class="contribution-label">贡献度</text>
						</view>
					</view>
				</view>
				<view v-else class="empty-state-small">
					<text class="empty-text-small">暂无成员数据</text>
				</view>
			</view>

			<!-- 团队任务 (US28) -->
			<view class="card-box" v-if="myTeam.id">
				<view class="card-title-row">
					<uni-icons type="calendar-filled" size="20" color="#2ECC71"></uni-icons>
					<text class="card-title">团队任务</text>
				</view>
				<view class="task-list" v-if="teamTasks.length > 0">
					<view
						v-for="task in teamTasks"
						:key="task.id"
						class="task-item"
						@click="handleTaskClick(task.id)"
					>
						<view class="task-info">
							<text class="task-title">{{ task.title }}</text>
							<view class="task-meta-row">
								<view class="task-meta-item">
									<uni-icons type="paperplane-filled" size="14" color="#888"></uni-icons>
									<text>{{ task.points || 0 }}分</text>
								</view>
								<view class="task-meta-item" v-if="task.deadline">
									<uni-icons type="calendar" size="14" color="#888"></uni-icons>
									<text>{{ task.deadline }}</text>
								</view>
							</view>
						</view>
						<view class="task-status">
							<text v-if="task.status === 'completed' || task.status === 'submitted'" class="status-badge completed">
								已完成
							</text>
							<text v-else-if="task.status === 'in-progress'" class="status-badge in-progress">
								进行中
							</text>
							<text v-else class="status-badge todo">
								未开始
							</text>
						</view>
					</view>
				</view>
				<view v-else class="empty-state-small">
					<text class="empty-text-small">暂无团队任务</text>
				</view>
			</view>
			
			<!-- 团队数据 (US39) -->
			<view class="card-box" v-if="myTeam.id">
				<view class="card-title-row">
					<uni-icons type="pyq" size="20" color="#9B59B6"></uni-icons>
					<text class="card-title">团队数据</text>
				</view>
				<view class="stats-grid">
					<view class="stat-card" style="background: linear-gradient(135deg, #EBF0FF, #E6F0FF);">
						<text class="stat-card-label">平均贡献度</text>
						<text class="stat-card-value" style="color: #4C8AF2;">{{ teamStats.avgContribution }}%</text>
					</view>
					<view class="stat-card" style="background: linear-gradient(135deg, #EAFBF4, #E6FCEF);">
						<text class="stat-card-label">完成率</text>
						<text class="stat-card-value" style="color: #2ECC71;">{{ teamStats.completionRate }}%</text>
					</view>
					<view class="stat-card" style="background: linear-gradient(135deg, #F5F3FF, #F3EFFF);">
						<text class="stat-card-label">团队活跃度</text>
						<text class="stat-card-value" style="color: #9B59B6;">{{ teamStats.activeRate }}%</text>
					</view>
					<view class="stat-card" style="background: linear-gradient(135deg, #FFF7ED, #FFFBEB);">
						<text class="stat-card-label">协作指数</text>
						<text class="stat-card-value" style="color: #F97316;">{{ teamStats.collaborationIndex }}</text>
					</view>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useCourseContextStore } from '@/store/courseContextStore';
import { onShow } from '@dcloudio/uni-app';

const contextStore = useCourseContextStore();
const { myTeam, teamMembers, currentCourse, currentCourseId, taskNodes } = storeToRefs(contextStore);

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

// 团队任务（筛选出团队类型的任务 story_type === 2）
const teamTasks = computed(() => {
  const tasks = taskNodes.value || [];
  return tasks
    .filter(task => task.storyType === 2) // 团队任务
    .map(task => ({
      id: task.id,
      title: task.storyName,
      points: task.totalScore,
      deadline: formatDate(task.deadline),
      status: task.status,
      score: null // 团队任务分数需要从团队成绩接口获取
    }));
});

// 统计数据
const teamStats = computed(() => {
  const members = teamMembers.value || [];
  if (members.length === 0) {
    return {
      avgContribution: 0,
      completionRate: 0,
      activeRate: 0,
      collaborationIndex: 0
    };
  }

  // 平均贡献度
  const avgContribution = Math.round(
    members.reduce((sum, m) => sum + (m.contribution || 0), 0) / members.length
  );

  // 完成率（已完成任务数 / 总任务数）
  const tasks = teamTasks.value || [];
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const completionRate = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  // 团队活跃度（有贡献的成员数 / 总成员数）
  const activeMembers = members.filter(m => (m.contribution || 0) > 0).length;
  const activeRate = members.length > 0 ? Math.round((activeMembers / members.length) * 100) : 0;

  // 协作指数（基于成员贡献度的方差，方差越小协作越好）
  const contributions = members.map(m => m.contribution || 0);
  const avg = avgContribution;
  const variance = contributions.reduce((sum, c) => sum + Math.pow(c - avg, 2), 0) / members.length;
  const collaborationIndex = Math.max(0, Math.min(100, Math.round(100 - variance)));

  return {
    avgContribution,
    completionRate,
    activeRate,
    collaborationIndex
  };
});

// 团队排名（需要从课程学生排行榜中获取）
const teamRank = ref(null);

// 加载团队数据
const loadTeamData = async () => {
  if (!currentCourseId.value) {
    uni.showToast({ title: '未选择课程', icon: 'none' });
    return;
  }

  try {
    // 如果还没有团队信息，先获取
    if (!myTeam.value.id) {
      await contextStore.fetchTeamInfo(currentCourseId.value);
    }

    // 如果没有团队成员，再次尝试获取
    if (teamMembers.value.length === 0 && myTeam.value.id) {
      await contextStore.fetchTeamInfo(currentCourseId.value);
    }
  } catch (error) {
    console.error('加载团队数据失败', error);
    uni.showToast({ title: '加载团队数据失败', icon: 'none' });
  }
};

onShow(() => {
  loadTeamData();
});

const handleTaskClick = (taskId) => {
  if (taskId) {
    contextStore.selectTask(taskId);
    uni.navigateTo({ url: `/pages/index/TaskDetailView?taskId=${taskId}` });
  }
};

const goBack = () => {
  uni.navigateBack();
};
</script>

<style lang="scss" scoped>
$bg-color: #F4F7FA;
$card-bg: #FFFFFF;
$text-color: #333333;
$text-light: #888888;
$border-color: #EAEAEA;
$shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

.team-page {
	display: flex;
	flex-direction: column;
	height: 100vh;
	background-color: $bg-color;
}

.header-sticky {
	position: sticky;
	top: 0;
	z-index: 20;
	background: #FFFFFF;
	padding-top: var(--status-bar-height);
	box-shadow: $shadow;
}
.header-content {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 16rpx;
	height: 88rpx;
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
	color: $text-color;
}

.page-scroll {
	flex: 1;
	height: 0;
	padding: 30rpx;
	box-sizing: border-box;
}

.team-header-card {
	background: linear-gradient(135deg, #8B5CF6, #6366F1);
	border-radius: 24rpx;
	padding: 40rpx;
	color: white;
	box-shadow: 0 10rpx 30rpx rgba(139, 92, 246, 0.3);
	margin-bottom: 30rpx;
	
	.header-top {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 30rpx;
	}
	.team-name {
		font-size: 44rpx;
		font-weight: bold;
		margin-bottom: 16rpx;
		display: block;
	}
	.course-name {
		font-size: 26rpx;
		color: #E0E7FF;
	}
	.score-box {
		text-align: right;
	}
	.team-score {
		font-size: 56rpx;
		font-weight: bold;
	}
	.score-label {
		font-size: 24rpx;
		color: #E0E7FF;
	}
	
	.header-stats {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		gap: 20rpx;
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10px);
		border-radius: 16rpx;
		padding: 30rpx;
	}
	.stat-item {
		text-align: center;
		border-right: 1rpx solid rgba(255, 255, 255, 0.2);
		&:last-child {
			border-right: none;
		}
	}
	.stat-value {
		font-size: 40rpx;
		font-weight: bold;
	}
	.stat-label {
		font-size: 22rpx;
		color: #E0E7FF;
	}
}

.card-box {
	background: $card-bg;
	border-radius: 24rpx;
	box-shadow: $shadow;
	padding: 40rpx;
	margin-bottom: 30rpx;
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

.member-list {
	display: flex;
	flex-direction: column;
	gap: 24rpx;
}
.member-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 24rpx;
	background: $bg-color;
	border-radius: 20rpx;
}
.member-info {
	display: flex;
	align-items: center;
	flex: 1;
	gap: 24rpx;
}
.avatar-wrapper {
	position: relative;
	flex-shrink: 0;
	.avatar {
		width: 96rpx;
		height: 96rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-size: 40rpx;
		font-weight: bold;
	}
	.leader-icon {
		position: absolute;
		bottom: 0;
		right: 0;
		width: 36rpx;
		height: 36rpx;
		background: #F9A825;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 4rpx solid $card-bg;
	}
}
.member-details {
	flex: 1;
}
.member-name-row {
	display: flex;
	align-items: center;
	gap: 12rpx;
	margin-bottom: 8rpx;
	.member-name {
		font-size: 30rpx;
		font-weight: bold;
		color: $text-color;
	}
	.leader-badge {
		font-size: 20rpx;
		font-weight: 500;
		background: #FEF3C7;
		color: #D97706;
		padding: 4rpx 10rpx;
		border-radius: 8rpx;
	}
}
.member-id {
	font-size: 24rpx;
	color: $text-light;
}
.member-contribution {
	text-align: right;
	.contribution-value {
		font-size: 32rpx;
		font-weight: bold;
		color: #4C8AF2; // $theme-color
	}
	.contribution-label {
		font-size: 22rpx;
		color: $text-light;
	}
}

.task-list {
	display: flex;
	flex-direction: column;
	gap: 24rpx;
}
.task-item {
	padding: 24rpx;
	border: 1rpx solid $border-color;
	border-radius: 20rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 20rpx;
}
.task-info {
	flex: 1;
	.task-title {
		font-size: 28rpx;
		font-weight: 500;
		color: $text-color;
		display: block;
		margin-bottom: 12rpx;
	}
}
.task-meta-row {
	display: flex;
	align-items: center;
	gap: 24rpx;
}
.task-meta-item {
	display: flex;
	align-items: center;
	gap: 8rpx;
	font-size: 24rpx;
	color: $text-light;
}
.task-status {
	flex-shrink: 0;
	.status-badge {
		padding: 8rpx 16rpx;
		border-radius: 12rpx;
		font-size: 24rpx;
		font-weight: 500;
		
		&.completed {
			background: #EAFBF4;
			color: #2ECC71;
		}
		&.in-progress {
			background: #EBF0FF;
			color: #4C8AF2;
		}
		&.todo {
			background: #F0F0F0;
			color: $text-light;
		}
	}
}

.stats-grid {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 24rpx;
}
.stat-card {
	padding: 30rpx;
	border-radius: 20rpx;
	.stat-card-label {
		font-size: 26rpx;
		color: $text-light;
		margin-bottom: 8rpx;
		display: block;
	}
	.stat-card-value {
		font-size: 44rpx;
		font-weight: bold;
	}
}

.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 100rpx 40rpx;
	background: $card-bg;
	border-radius: 24rpx;
	margin-bottom: 30rpx;
	.empty-text {
		margin-top: 24rpx;
		font-size: 28rpx;
		color: $text-light;
	}
}

.empty-state-small {
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 60rpx 40rpx;
	.empty-text-small {
		font-size: 26rpx;
		color: $text-light;
	}
}
</style>