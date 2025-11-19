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
			<view class="team-header-card">
				<view class="header-top">
					<view>
						<text class="team-name">追梦小队</text>
						<text class="course-name">软件产品构建实训（2025）</text>
					</view>
					<view class="score-box">
						<text class="team-score">85</text>
						<text class="score-label">团队总分</text>
					</view>
				</view>
				
				<view class="header-stats">
					<view class="stat-item">
						<text class="stat-value">4</text>
						<text class="stat-label">成员</text>
					</view>
					<view class="stat-item">
						<text class="stat-value">#3</text>
						<text class="stat-label">排名</text>
					</view>
					<view class="stat-item">
						<text class="stat-value">12</text>
						<text class="stat-label">已完成任务</text>
					</view>
				</view>
			</view>

			<!-- 团队成员 (US26, US27) -->
			<view class="card-box">
				<view class="card-title-row">
					<uni-icons type="staff-filled" size="20" color="#4C8AF2"></uni-icons>
					<text class="card-title">团队成员</text>
				</view>
				<view class="member-list">
					<view
						v-for="member in teamMembers"
						:key="member.id"
						class="member-item"
					>
						<view class="member-info">
							<view class="avatar-wrapper">
								<view class="avatar" :style="{ background: member.isLeader ? 'linear-gradient(135deg, #F9D423, #F97316)' : 'linear-gradient(135deg, #4C8AF2, #6C5BFF)' }">
									<text>{{ member.name.charAt(0) }}</text>
								</view>
								<view v-if="member.isLeader" class="leader-icon">
									<uni-icons type="star-filled" size="10" color="#FFFFFF"></uni-icons>
								</view>
							</view>
							
							<view class="member-details">
								<view class="member-name-row">
									<text class="member-name">{{ member.name }}</text>
									<text v-if="member.isLeader" class="leader-badge">队长</text>
								</view>
								<text class="member-id">学号: {{ member.studentId }}</text>
							</view>
						</view>

						<view class="member-contribution">
							<text class="contribution-value">{{ member.contribution }}%</text>
							<text class="contribution-label">贡献度</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 团队任务 (US28) -->
			<view class="card-box">
				<view class="card-title-row">
					<uni-icons type="calendar-filled" size="20" color="#2ECC71"></uni-icons>
					<text class="card-title">团队任务</text>
				</view>
				<view class="task-list">
					<view
						v-for="task in teamTasks"
						:key="task.id"
						class="task-item"
					>
						<view class="task-info">
							<text class="task-title">{{ task.title }}</text>
							<view class="task-meta-row">
								<view class="task-meta-item">
									<uni-icons type="paperplane-filled" size="14" color="#888"></uni-icons>
									<text>{{ task.points }}分</text>
								</view>
								<view class="task-meta-item">
									<uni-icons type="calendar" size="14" color="#888"></uni-icons>
									<text>{{ task.deadline }}</text>
								</view>
							</view>
						</view>
						<view class="task-status">
							<text v-if="task.status === 'completed'" class="status-badge completed">
								得分: {{ task.score }}
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
			</view>
			
			<!-- 团队数据 (US39) -->
			<view class="card-box">
				<view class="card-title-row">
					<uni-icons type="pyq" size="20" color="#9B59B6"></uni-icons>
					<text class="card-title">团队数据</text>
				</view>
				<view class="stats-grid">
					<view class="stat-card" style="background: linear-gradient(135deg, #EBF0FF, #E6F0FF);">
						<text class="stat-card-label">平均贡献度</text>
						<text class="stat-card-value" style="color: #4C8AF2;">25%</text>
					</view>
					<view class="stat-card" style="background: linear-gradient(135deg, #EAFBF4, #E6FCEF);">
						<text class="stat-card-label">完成率</text>
						<text class="stat-card-value" style="color: #2ECC71;">75%</text>
					</view>
					<view class="stat-card" style="background: linear-gradient(135deg, #F5F3FF, #F3EFFF);">
						<text class="stat-card-label">团队活跃度</text>
						<text class="stat-card-value" style="color: #9B59B6;">92%</text>
					</view>
					<view class="stat-card" style="background: linear-gradient(135deg, #FFF7ED, #FFFBEB);">
						<text class="stat-card-label">协作指数</text>
						<text class="stat-card-value" style="color: #F97316;">88</text>
					</view>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script setup>
import { ref } from 'vue';

const teamMembers = ref([
  { id: 1, name: '张三', studentId: '2021001', contribution: 28, isLeader: true },
  { id: 2, name: '李四', studentId: '2021002', contribution: 25, isLeader: false },
  { id: 3, name: '王五', studentId: '2021003', contribution: 24, isLeader: false },
  { id: 4, name: '赵六', studentId: '2021004', contribution: 23, isLeader: false }
]);

const teamTasks = ref([
  { id: 1, title: 'T4-1爱从游（学生移动端）', points: 200, deadline: '2025-11-30', status: 'in-progress', score: null },
  { id: 2, title: 'T2 资源调度计划', points: 150, deadline: '2025-11-16', status: 'completed', score: 142 },
  { id: 3, title: 'T1 自动课程', points: 100, deadline: '2025-11-16', status: 'completed', score: 95 }
]);

const getStatusText = (status) => {
  switch (status) {
    case 'completed': return '已完成';
    case 'in-progress': return '进行中';
    default: return '未开始';
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
</style>