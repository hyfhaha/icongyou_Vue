<template>
	<view class="task-map-page">
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
					<text class="node-label">{{ task.storyName }}</text>
				</view>
			</view>
		</view>

		<view v-if="activeTask" class="task-overlay" @click="closeOverlay">
			<view
				class="task-detail-card"
				@click.stop
				@touchstart="onTouchStart"
				@touchend="onTouchEnd"
			>
				<view class="task-detail-header">
					<text class="task-detail-title">{{ activeTask.storyName }}</text>
					<text class="task-detail-id">{{ activeTask.id }}</text>
				</view>

				<view class="task-detail-row">
					<text class="detail-label">截止</text>
					<text class="detail-value">{{ activeTask.deadline || '未设定' }}</text>
				</view>
				<view class="task-detail-row">
					<text class="detail-label">核心要求</text>
					<text class="detail-value">请参考详情页说明</text>
				</view>
				<view class="task-detail-row">
					<text class="detail-label">状态</text>
					<text class="detail-value">{{ activeTask.status }}</text>
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
import { storeToRefs } from 'pinia';
import { useCourseContextStore } from '@/store/courseContextStore';

const contextStore = useCourseContextStore();
const { taskNodes } = storeToRefs(contextStore);

// 假设数据库地图也是 6x6
const mapSize = { rows: 6, cols: 6 };

const activeTask = ref(null);
const touchStart = ref({ x: 0, y: 0 });

const gridCells = computed(() => mapSize.rows * mapSize.cols);

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${mapSize.cols}, 1fr)`,
  gridTemplateRows: `repeat(${mapSize.rows}, 1fr)`
}));

const getNodeStyle = (task) => ({
  // 数据库字段: positionX, positionY
  gridColumnStart: task.positionX + 1,
  gridRowStart: task.positionY + 1
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
  // [修改] 先在 Store 中选中，再跳转
  contextStore.selectTask(activeTask.value.id);
  uni.navigateTo({
    url: '/pages/index/TaskDetailView'
  });
};

// --- 滑动切换逻辑 (保留原代码) ---
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

  // 过滤出自己以外的所有任务
  const candidates = taskNodes.value.filter(task => task.id !== current.id);
  let next = null;

  // 注意：原代码用的是 task.x, task.y，现在改为 task.positionX, task.positionY
  const cx = current.positionX;
  const cy = current.positionY;

  if (direction === 'left') {
    next = candidates
      .filter(task => task.positionY === cy && task.positionX < cx)
      .sort((a, b) => b.positionX - a.positionX)[0];
  } else if (direction === 'right') {
    next = candidates
      .filter(task => task.positionY === cy && task.positionX > cx)
      .sort((a, b) => a.positionX - b.positionX)[0];
  } else if (direction === 'up') {
    next = candidates
      .filter(task => task.positionX === cx && task.positionY < cy)
      .sort((a, b) => b.positionY - a.positionY)[0];
  } else if (direction === 'down') {
    next = candidates
      .filter(task => task.positionX === cx && task.positionY > cy)
      .sort((a, b) => a.positionY - b.positionY)[0];
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
/* 完全复用您提供的 TaskKanbanView.vue 样式 */
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