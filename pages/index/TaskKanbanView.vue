<template>
	<view class="task-map-page">
		<!-- 头部 -->
		<view class="header-sticky">
			<view class="header-content">
				<view class="icon-button" @click="goBack">
					<uni-icons type="left" size="24" color="#555555"></uni-icons>
				</view>
				<text class="header-title">任务地图</text>
				<view class="icon-button">
					<uni-icons type="more-filled" size="24" color="#555555"></uni-icons>
				</view>
			</view>
		</view>

		<view class="legend-bar">
			<view class="legend-item">
				<view class="legend-dot completed"></view>
				<text>已完成</text>
			</view>
			<view class="legend-item">
				<view class="legend-dot progress"></view>
				<text>进行中</text>
			</view>
			<view class="legend-item">
				<view class="legend-dot upcoming"></view>
				<text>未开始</text>
			</view>
		</view>

		<!-- 点阵地图 -->
		<view class="map-wrapper">
			<view class="grid" :style="gridStyle">
				<view
					class="grid-cell"
					v-for="cell in gridCells"
					:key="cell"
				></view>

				<view
					v-for="task in taskNodes"
					:key="task.id"
					class="task-node"
					:class="task.status"
					:style="getNodeStyle(task)"
					@click="openTask(task)"
				>
					<text class="node-label">{{ task.label }}</text>
				</view>
			</view>
		</view>

		<!-- 悬浮任务详情 -->
		<view v-if="activeTask" class="task-overlay" @click="closeOverlay">
			<view
				class="task-detail-card"
				@click.stop
				@touchstart="onTouchStart"
				@touchend="onTouchEnd"
			>
				<view class="task-detail-header">
					<text class="task-detail-title">{{ activeTask.name }}</text>
					<text class="task-detail-id">{{ activeTask.id }}</text>
				</view>

				<view class="task-detail-row">
					<text class="detail-label">截止</text>
					<text class="detail-value">{{ activeTask.deadline }}</text>
				</view>
				<view class="task-detail-row">
					<text class="detail-label">核心要求</text>
					<text class="detail-value">{{ activeTask.requirement }}</text>
				</view>
				<view class="task-detail-row">
					<text class="detail-label">热度指数</text>
					<text class="detail-value">{{ activeTask.heat }} / 100</text>
				</view>

				<view class="detail-actions">
					<button class="button-primary" @click="enterTask">
						<text>进入任务详情</text>
					</button>
					<text class="swipe-hint">在卡片上上下左右滑动，切换临近任务</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { computed, ref } from 'vue';

const mapSize = { rows: 6, cols: 6 };

const taskNodes = ref([
  { id: 'T0', label: '起点', name: '启动会议', x: 0, y: 0, deadline: '2025-11-01', requirement: '完成课程导入与分组', heat: 72, status: 'completed' },
  { id: 'T1', label: 'T1', name: '自动课程', x: 1, y: 1, deadline: '2025-11-05', requirement: '完成课程信息采集与配置', heat: 65, status: 'completed' },
  { id: 'T2', label: 'T2', name: '团队组建', x: 2, y: 1, deadline: '2025-11-08', requirement: '确定角色分工与负责人', heat: 70, status: 'completed' },
  { id: 'T3', label: 'T3', name: '团队竞价', x: 3, y: 2, deadline: '2025-11-12', requirement: '提交竞价报告与方案', heat: 58, status: 'submitted' },
  { id: 'T4-1', label: 'T4-1', name: '爱从游（学生端）', x: 4, y: 3, deadline: '2025-11-30', requirement: '实现点阵地图与AI入口', heat: 90, status: 'in-progress' },
  { id: 'T4-2', label: 'T4-2', name: '爱从游（教师端）', x: 2, y: 3, deadline: '2025-11-28', requirement: '搭建教师评价看板', heat: 76, status: 'in-progress' },
  { id: 'T5', label: 'T5', name: '爱从游（管理端）', x: 3, y: 4, deadline: '2025-12-05', requirement: '完成管理端监控功能', heat: 52, status: 'upcoming' },
  { id: 'T6', label: 'T6', name: '验收答辩', x: 5, y: 5, deadline: '2025-12-15', requirement: '准备汇报材料与演示', heat: 48, status: 'upcoming' }
]);

const activeTask = ref(null);
const touchStart = ref({ x: 0, y: 0 });

const gridCells = computed(() => mapSize.rows * mapSize.cols);

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${mapSize.cols}, 1fr)`,
  gridTemplateRows: `repeat(${mapSize.rows}, 1fr)`
}));

const getNodeStyle = (task) => ({
  gridColumnStart: task.x + 1,
  gridRowStart: task.y + 1
});

const goBack = () => {
  uni.navigateBack();
};

const openTask = (task) => {
  activeTask.value = task;
};

const closeOverlay = () => {
  activeTask.value = null;
};

const enterTask = () => {
  if (!activeTask.value) return;
  uni.navigateTo({
    url: `/pages/index/TaskDetailView?taskId=${activeTask.value.id}`
  });
};

const onTouchStart = (event) => {
  const touch = event.changedTouches?.[0];
  if (!touch) return;
  touchStart.value = { x: touch.clientX, y: touch.clientY };
};

const onTouchEnd = (event) => {
  if (!activeTask.value) return;
  const touch = event.changedTouches?.[0];
  if (!touch) return;
  const dx = touch.clientX - touchStart.value.x;
  const dy = touch.clientY - touchStart.value.y;
  if (Math.abs(dx) < 30 && Math.abs(dy) < 30) return;

  const direction = Math.abs(dx) > Math.abs(dy)
    ? (dx > 0 ? 'right' : 'left')
    : (dy > 0 ? 'down' : 'up');

  moveToNeighbor(direction);
};

const moveToNeighbor = (direction) => {
  const current = activeTask.value;
  if (!current) return;

  const candidates = taskNodes.value.filter(task => task.id !== current.id);
  let next = null;

  if (direction === 'left') {
    next = candidates
      .filter(task => task.y === current.y && task.x < current.x)
      .sort((a, b) => b.x - a.x)[0];
  } else if (direction === 'right') {
    next = candidates
      .filter(task => task.y === current.y && task.x > current.x)
      .sort((a, b) => a.x - b.x)[0];
  } else if (direction === 'up') {
    next = candidates
      .filter(task => task.x === current.x && task.y < current.y)
      .sort((a, b) => b.y - a.y)[0];
  } else if (direction === 'down') {
    next = candidates
      .filter(task => task.x === current.x && task.y > current.y)
      .sort((a, b) => a.y - b.y)[0];
  }

  if (next) {
    activeTask.value = next;
  } else {
    uni.showToast({
      title: '该方向无任务',
      icon: 'none',
      duration: 800
    });
  }
};
</script>

<style lang="scss" scoped>
$bg-color: #F4F7FA;
$card-bg: #FFFFFF;
$text-color: #333333;
$text-light: #888888;
$shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

.task-map-page {
	display: flex;
	flex-direction: column;
	height: 100vh;
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
	padding: 0 20rpx;
	height: 90rpx;
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

.legend-bar {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 30rpx;
	padding: 20rpx;
	font-size: 24rpx;
	color: $text-light;
}
.legend-item {
	display: flex;
	align-items: center;
	gap: 10rpx;
}
.legend-dot {
	width: 20rpx;
	height: 20rpx;
	border-radius: 6rpx;
	background: #E0E0E0;
	&.completed {
		background: linear-gradient(135deg, #10B981, #059669);
	}
	&.progress {
		background: linear-gradient(135deg, #3B82F6, #2563EB);
	}
	&.upcoming {
		background: linear-gradient(135deg, #F59E0B, #F97316);
	}
}

.map-wrapper {
	flex: 1;
	padding: 20rpx 30rpx 40rpx;
}

.grid {
	width: 100%;
	height: 100%;
	display: grid;
	gap: 20rpx;
	background: radial-gradient(circle at center, #FFFFFF 0%, #EEF2FF 100%);
	border-radius: 32rpx;
	padding: 30rpx;
	box-shadow: 0 12rpx 30rpx rgba(76, 138, 242, 0.15);
	box-sizing: border-box;
}
.grid-cell {
	border: 1rpx dashed rgba(76, 138, 242, 0.15);
	border-radius: 16rpx;
}

.task-node {
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 16rpx;
	font-size: 24rpx;
	font-weight: 600;
	color: #FFFFFF;
	box-shadow: $shadow;
	padding: 10rpx;
	transition: transform 0.2s, box-shadow 0.2s;
	&:active {
		transform: scale(0.95);
	}
	&.completed {
		background: linear-gradient(135deg, #10B981, #059669);
	}
	&.submitted,
	&.in-progress {
		background: linear-gradient(135deg, #3B82F6, #2563EB);
	}
	&.upcoming {
		background: linear-gradient(135deg, #F59E0B, #F97316);
	}
}
.node-label {
	color: #FFFFFF;
}

.task-overlay {
	position: fixed;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
	background: rgba(0, 0, 0, 0.4);
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 40rpx 30rpx;
	box-sizing: border-box;
}
.task-detail-card {
	width: 100%;
	background: $card-bg;
	border-radius: 24rpx;
	padding: 40rpx 36rpx;
	box-shadow: 0 20rpx 40rpx rgba(0, 0, 0, 0.1);
}
.task-detail-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 30rpx;
}
.task-detail-title {
	font-size: 34rpx;
	font-weight: bold;
	color: $text-color;
}
.task-detail-id {
	font-size: 26rpx;
	color: $text-light;
}
.task-detail-row {
	display: flex;
	margin-bottom: 16rpx;
	font-size: 26rpx;
	.detail-label {
		width: 140rpx;
		color: $text-light;
	}
	.detail-value {
		flex: 1;
		color: $text-color;
		line-height: 1.4;
	}
}

.detail-actions {
	margin-top: 30rpx;
	display: flex;
	flex-direction: column;
	gap: 16rpx;
	align-items: stretch;
}
.button-primary {
	height: 90rpx;
	border-radius: 20rpx;
	background: linear-gradient(135deg, #4C8AF2, #6C5BFF);
	color: #FFFFFF;
	font-size: 30rpx;
	font-weight: 600;
}
.swipe-hint {
	font-size: 24rpx;
	color: $text-light;
	text-align: center;
}
</style>

