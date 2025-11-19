<template>
	<view class="kanban-page">
		<!-- 头部 -->
		<view class="header-sticky">
			<view class="header-content">
				<view class="icon-button" @click="goBack">
					<uni-icons type="left" size="24" color="#555555"></uni-icons>
				</view>
				<text class="header-title">软件产品构建实训</text>
				<view class="icon-button">
					<uni-icons type="more-filled" size="24" color="#555555"></uni-icons>
				</view>
			</view>
			
			<!-- 分类筛选 (史诗) -->
			<scroll-view scroll-x="true" class="category-scroll" :show-scrollbar="false">
				<view
					v-for="category in categories"
					:key="category.id"
					@click="activeCategory = category.id"
					class="category-tag"
					:class="{ active: activeCategory === category.id }"
				>
					<text>{{ category.label }}</text>
				</view>
			</scroll-view>
		</view>

		<!-- 页面内容 -->
		<scroll-view scroll-y="true" class="page-scroll">
			<!-- 毕业要求卡片 (US41, US43) -->
			<view class="requirement-card">
				<view class="req-icon-wrapper">
					<uni-icons type="info" size="18" color="#D97706"></uni-icons>
				</view>
				<view class="req-content">
					<text class="req-title">毕业要求</text>
					<text class="req-text">能够在团队中承担任务，任务完成质量达标，且展示了协同合作、冲突化解的能力</text>
				</view>
			</view>
			
			<!-- 任务类型筛选 (子史诗/标签) -->
			<view class="type-filters">
				<view class="type-tag active">团队协作</view>
				<view class="type-tag">产品规划</view>
				<view class="type-tag">
					<text>软件构建</text>
					<text class="type-tag-sub">(子类#1)</text>
				</view>
			</view>
			
			<!-- 任务列表 (按阶段) -->
			<view class="phase-list">
				<view v-for="phase in phases" :key="phase.id" class="phase-group">
					<view class="phase-header">
						<text class="phase-name">{{ phase.name }}</text>
						<text class="phase-count">{{ phase.tasks.length }} 个任务</text>
					</view>
					
					<!-- 任务卡片网格 (US12) -->
					<view class="task-grid">
						<view
							v-for="task in phase.tasks"
							:key="task.id"
							@click="openTask(task)"
							class="task-card"
							:style="{ background: getTaskGradient(task.status) }"
						>
							<!-- 状态角标 (US14) -->
							<view class="status-badge" :style="{ background: getStatusBadgeColor(task.status).bg, color: getStatusBadgeColor(task.status).text }">
								<text>{{ getStatusText(task.status) }}</text>
							</view>
							
							<!-- 团队图标 (US13) -->
							<view v-if="task.isTeam" class="team-icon-bg">
								<uni-icons type="staff-filled" size="16" color="#FFFFFF"></uni-icons>
							</view>

							<!-- 任务内容 -->
							<view class="task-content">
								<text class="task-title">{{ task.title }}</text>
								
								<view class="task-meta">
									<view class="meta-item">
										<uni-icons type="paperplane-filled" size="12" color="#FFFFFF"></uni-icons>
										<text>{{ task.points }}</text>
									</view>
									<view class="meta-item">
										<uni-icons type="refreshempty" size="12" color="#FFFFFF"></uni-icons>
										<text>{{ task.deadline }}</text>
									</view>
								</view>
								
								<!-- 星级 (US13) -->
								<view v-if="task.rating > 0" class="rating-bar">
									<uni-icons 
										v-for="i in 5" 
										:key="i" 
										type="star-filled" 
										size="14"
										:color="i <= task.rating ? '#FFD700' : 'rgba(255,255,255,0.3)'">
									</uni-icons>
								</view>
								
								<!-- 提交率 (US15) -->
								<text class="submission-rate">提交率: {{ task.submissionRate }}%</text>
							</view>
						</view>
					</view>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script setup>
import { ref } from 'vue';

const activeCategory = ref('all');

// (US12) 史诗/大类
const categories = [
  { id: 'all', label: '任务地图' },
  { id: 'requirement', label: '能够在团队中承担' },
  { id: 'design', label: '能够在设计与开发' },
  { id: 'quality', label: '具有分析和判断' }
];

// (US12) 阶段/行
const phases = ref([
  {
    id: 'phase1',
    name: '阶段1',
    tasks: [
      { id: 'T1', title: '自动课程', points: 4, deadline: '11:16', rating: 5, status: 'completed', submissionRate: 100, isTeam: false },
      { id: 'T2', title: '团队组建', points: 2, deadline: '11:16', rating: 0, status: 'not-started', submissionRate: 0, isTeam: true },
      { id: 'T3', title: '团队竞价', points: 2, deadline: '11:16', rating: 0, status: 'not-started', submissionRate: 0, isTeam: true },
    ]
  },
  {
    id: 'phase2',
    name: '阶段2',
    tasks: [
      { id: 'T4-1', title: 'T4-爱从游（学生移动端）', points: 3, deadline: '11:30', rating: 0, status: 'in-progress', submissionRate: 45, isTeam: true },
      { id: 'T4-2', title: 'T4-爱从游（教师网页端）', points: 4, deadline: '11:30', rating: 0, status: 'in-progress', submissionRate: 38, isTeam: true },
      { id: 'T5', title: 'T5-爱从游（管理端）', points: 5, deadline: '11:30', rating: 0, status: 'not-started', submissionRate: 12, isTeam: true },
    ]
  }
]);

const getTaskGradient = (status) => {
  switch (status) {
    case 'completed':
      return 'linear-gradient(135deg, #10B981, #059669)'; // 绿色
    case 'submitted':
      return 'linear-gradient(135deg, #3B82F6, #2563EB)'; // 蓝色
    case 'in-progress':
      return 'linear-gradient(135deg, #06B6D4, #0E7490)'; // 青色
    default:
      return 'linear-gradient(135deg, #06B6D4, #0E7490)'; // 默认青色
  }
};

const getStatusBadgeColor = (status) => {
  switch (status) {
    case 'completed':
      return { bg: 'rgba(255,255,255,0.9)', text: '#059669' };
    case 'submitted':
      return { bg: 'rgba(255,255,255,0.9)', text: '#2563EB' };
    default:
      return { bg: 'rgba(255,255,255,0.9)', text: '#555' };
  }
};

const getStatusText = (status) => {
  switch (status) {
    case 'completed': return '已完成';
    case 'submitted': return '已提交';
    case 'in-progress': return '进行中';
    default: return '未开始';
  }
};

const goBack = () => {
  uni.navigateBack();
};

const openTask = (task) => {
  console.log('Open task:', task.id);
  uni.navigateTo({
    url: `/pages/index/TaskAnalyticsView?taskId=${task.id}`
  });
};
</script>

<style lang="scss" scoped>
$bg-color: #F4F7FA;
$text-color: #333333;
$text-light: #888888;
$border-color: #EAEAEA;
$shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

.kanban-page {
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
.category-scroll {
	width: 100%;
	white-space: nowrap;
	padding: 20rpx 30rpx;
	background: #FFFFFF;
	border-top: 1rpx solid $border-color;
	.category-tag {
		display: inline-block;
		padding: 14rpx 28rpx;
		border-radius: 30rpx;
		font-size: 26rpx;
		font-weight: 500;
		margin-right: 20rpx;
		background: #F0F0F0;
		color: $text-light;
		transition: all 0.2s;
		&.active {
			background: linear-gradient(135deg, #F97316, #EA580C);
			color: white;
			box-shadow: 0 4rpx 10rpx rgba(249, 115, 22, 0.3);
		}
	}
}

.page-scroll {
	flex: 1;
	height: 0; // 必须设置，使 scroll-view 生效
	padding: 30rpx;
	box-sizing: border-box;
}

.requirement-card {
	display: flex;
	align-items: flex-start;
	background: linear-gradient(135deg, #FFF7ED, #FFFBEB);
	border-left: 8rpx solid #F97316;
	border-radius: 16rpx;
	padding: 24rpx;
	margin-bottom: 30rpx;
	
	.req-icon-wrapper {
		flex-shrink: 0;
		width: 40rpx;
		height: 40rpx;
		background: #FEF3C7;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 20rpx;
		margin-top: 4rpx;
	}
	.req-content {
		flex: 1;
	}
	.req-title {
		font-size: 26rpx;
		font-weight: 500;
		color: #9A3412;
		display: block;
	}
	.req-text {
		font-size: 26rpx;
		color: #B45309;
		margin-top: 4rpx;
		line-height: 1.5;
	}
}

.type-filters {
	display: flex;
	align-items: center;
	gap: 20rpx;
	margin-bottom: 30rpx;
	.type-tag {
		padding: 14rpx 24rpx;
		background: #FFFFFF;
		color: $text-light;
		border-radius: 16rpx;
		font-size: 26rpx;
		&.active {
			background: #4C8AF2; // $theme-color
			color: white;
			font-weight: 500;
			box-shadow: 0 4rpx 10rpx rgba(76, 138, 242, 0.3);
		}
	}
	.type-tag-sub {
		font-size: 22rpx;
		margin-left: 8rpx;
	}
}

.phase-list {
	.phase-group {
		margin-bottom: 40rpx;
	}
	.phase-header {
		display: flex;
		align-items: center;
		margin-bottom: 30rpx;
		.phase-name {
			background: #E0E0E0;
			border-radius: 12rpx;
			padding: 10rpx 20rpx;
			font-size: 30rpx;
			font-weight: bold;
			color: $text-color;
			margin-right: 20rpx;
		}
		.phase-count {
			font-size: 26rpx;
			color: $text-light;
		}
	}
}

.task-grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr); // 移动端两列
	gap: 24rpx;
}

.task-card {
	position: relative;
	border-radius: 20rpx;
	padding: 24rpx;
	box-shadow: $shadow;
	overflow: hidden;
	transition: all 0.2s;
	
	&:active {
		transform: scale(0.97);
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
	}

	.status-badge {
		position: absolute;
		top: 20rpx;
		right: 20rpx;
		padding: 6rpx 12rpx;
		border-radius: 10rpx;
		text {
			font-size: 22rpx;
			font-weight: bold;
		}
	}
	
	.team-icon-bg {
		position: absolute;
		top: 20rpx;
		left: 20rpx;
		width: 44rpx;
		height: 44rpx;
		background: rgba(255, 255, 255, 0.3);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.task-content {
		margin-top: 50rpx; // 为图标和角标留出空间
	}
	
	.task-title {
		font-size: 28rpx;
		font-weight: bold;
		color: white;
		margin-bottom: 12rpx;
		line-height: 1.4;
		// 2行截断
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
	}
	
	.task-meta {
		display: flex;
		align-items: center;
		justify-content: space-between;
		color: rgba(255, 255, 255, 0.9);
		font-size: 24rpx;
		margin-bottom: 16rpx;
		
		.meta-item {
			display: flex;
			align-items: center;
			gap: 8rpx;
		}
	}
	
	.rating-bar {
		display: flex;
		gap: 4rpx;
		margin-bottom: 12rpx;
	}
	
	.submission-rate {
		font-size: 22rpx;
		color: rgba(255, 255, 255, 0.8);
	}
}
</style>