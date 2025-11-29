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
			
			<view class="legend-bar">
				<view class="legend-item"><view class="dot completed"></view><text>完成</text></view>
				<view class="legend-item"><view class="dot progress"></view><text>进行</text></view>
				<view class="legend-item"><view class="dot upcoming"></view><text>未开</text></view>
			</view>
		</view>

		<view class="matrix-container">
			<scroll-view scroll-x="true" class="matrix-scroll-x" :show-scrollbar="false">
				<view class="matrix-table" :class="{ 'mode-compact': isCompactMode }">
					
					<view class="matrix-row goal-row">
						<view class="matrix-cell sticky-col header-corner-top">
							<text class="corner-text">毕业要求</text>
						</view>
						<view 
							v-for="goal in goalColumns" 
							:key="goal.id" 
							class="matrix-cell goal-cell"
							:style="{ flex: goal.span, minWidth: (goal.span * (isCompactMode ? 80 : 220)) + 'rpx' }"
						>
							<text class="goal-text">{{ goal.name }}</text>
						</view>
					</view>

					<view class="matrix-row epic-row">
						<view 
							class="matrix-cell sticky-col header-corner-bottom"
							:class="{ 'corner-compact': isCompactMode }"
						>
							<text class="corner-text">任务集合</text>
						</view>
						<view 
							v-for="epic in mapMetaData.epics" 
							:key="epic.id" 
							class="matrix-cell epic-cell"
						>
							<view class="vertical-text-wrapper">
								<text class="header-text">{{ epic.name }}</text>
							</view>
						</view>
					</view>

					<view 
						v-for="(release, rIndex) in mapMetaData.releases" 
						:key="release.id" 
						class="matrix-row body-row"
					>
						<view class="matrix-cell sticky-col release-cell">
							<text class="release-name">{{ release.name.split('：')[0] }}</text>
						</view>

						<view 
							v-for="(epic, cIndex) in mapMetaData.epics" 
							:key="epic.id" 
							class="matrix-cell task-cell"
						>
							<view class="task-stack">
								<view 
									v-for="task in getTasksInCell(cIndex, rIndex)" 
									:key="task.id"
									class="mini-node"
									:class="task.status"
									@click="openTaskPopup(task)"
								>
									<text class="node-text">{{ task.id }}</text>
								</view>
							</view>
						</view>
					</view>

				</view>
			</scroll-view>
		</view>

		<view v-if="selectedTask" class="task-overlay" @click="closePopup">
			<view
				class="task-detail-card"
				@click.stop
				@touchstart="onTouchStart"
				@touchend="onTouchEnd"
			>
				<view class="task-detail-header">
					<text class="task-detail-title">{{ selectedTask.storyName }}</text>
					<text class="task-detail-id">{{ selectedTask.id }}</text>
				</view>

				<view class="task-detail-row">
					<text class="detail-label">截止</text>
					<text class="detail-value">{{ selectedTask.deadline }}</text>
				</view>
				<view class="task-detail-row">
					<text class="detail-label">要求</text>
					<text class="detail-value desc">{{ selectedTask.storyDesc || '暂无描述' }}</text>
				</view>
				<view class="task-detail-row">
					<text class="detail-label">状态</text>
					<text class="detail-value status-text" :class="selectedTask.status">
						{{ getStatusText(selectedTask.status) }}
					</text>
				</view>

				<view class="detail-actions">
					<button class="button-primary" @click="enterDetail">
						<text>进入详情</text>
					</button>
					<text class="swipe-hint">👆 👇 👈 👉 滑动切换邻近任务</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useCourseContextStore } from '@/store/courseContextStore';

const contextStore = useCourseContextStore();
const { taskNodes, mapMetaData } = storeToRefs(contextStore);

const selectedTask = ref(null);
const touchStart = ref({ x: 0, y: 0 });

const goBack = () => uni.navigateBack();

// 智能判断模式
const isCompactMode = computed(() => {
    return mapMetaData.value.epics && mapMetaData.value.epics.length > 4;
});

const goalColumns = computed(() => {
    if (!mapMetaData.value.goals || !mapMetaData.value.epics) return [];
    return mapMetaData.value.goals.map(goal => {
        const span = mapMetaData.value.epics.filter(e => e.goalId === goal.id).length;
        return { ...goal, span: span || 1 };
    });
});

const getTasksInCell = (x, y) => {
	return taskNodes.value.filter(t => t.x === x && t.y === y);
};

const getStatusText = (status) => {
	const map = { 'completed': '已完成', 'submitted': '已提交', 'in-progress': '进行中', 'upcoming': '未开始' };
	return map[status] || status;
};

const openTaskPopup = (task) => selectedTask.value = task;
const closePopup = () => selectedTask.value = null;

const enterDetail = () => {
	if (selectedTask.value) {
		contextStore.selectTask(selectedTask.value.id);
		uni.navigateTo({ url: '/pages/index/TaskDetailView' });
		closePopup();
	}
};

// --- 手势滑动逻辑 (反向修正版) ---
const onTouchStart = (e) => { touchStart.value = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY }; };
const onTouchEnd = (e) => {
  if (!selectedTask.value) return;
  const dx = e.changedTouches[0].clientX - touchStart.value.x;
  const dy = e.changedTouches[0].clientY - touchStart.value.y;
  
  if (Math.abs(dx) < 30 && Math.abs(dy) < 30) return;

  const dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
  
  moveToNeighbor(dir);
};

const moveToNeighbor = (direction) => {
  const current = selectedTask.value;
  if (!current) return;

  const sourceStack = getTasksInCell(current.x, current.y);
  const sourceIndex = sourceStack.findIndex(t => t.id === current.id);

  let next = null;

  // [修正] 向上滑 (Swipe Up) -> 去下面 (Down/Next in Stack)
  if (direction === 'up') {
      if (sourceIndex < sourceStack.length - 1) {
          next = sourceStack[sourceIndex + 1];
      } else {
          // 堆叠到底了，找下一行的对应列 (y + 1)
          next = findClosestColumnTask(current.x, current.y, 0, 1);
      }
  } 
  // [修正] 向下滑 (Swipe Down) -> 去上面 (Up/Prev in Stack)
  else if (direction === 'down') {
      if (sourceIndex > 0) {
          next = sourceStack[sourceIndex - 1];
      } else {
          // 堆叠到顶了，找上一行的对应列 (y - 1)
          next = findClosestColumnTask(current.x, current.y, 0, -1);
      }
  } 
  // [修正] 向左滑 (Swipe Left) -> 去右边 (Next Column, x + 1)
  else if (direction === 'left') {
      const targetX = findNextColumnX(current.x, current.y, 1); // dx = 1 (Right)
      if (targetX !== null) {
          const targetStack = getTasksInCell(targetX, current.y);
          if (targetStack.length > 0) {
              const targetIndex = Math.min(sourceIndex, targetStack.length - 1);
              next = targetStack[targetIndex];
          }
      }
  } 
  // [修正] 向右滑 (Swipe Right) -> 去左边 (Prev Column, x - 1)
  else if (direction === 'right') {
      const targetX = findNextColumnX(current.x, current.y, -1); // dx = -1 (Left)
      if (targetX !== null) {
          const targetStack = getTasksInCell(targetX, current.y);
          if (targetStack.length > 0) {
              const targetIndex = Math.min(sourceIndex, targetStack.length - 1);
              next = targetStack[targetIndex];
          }
      }
  }

  if (next) selectedTask.value = next;
  else {
      const dirText = { 'left': '右', 'right': '左', 'up': '下', 'down': '上' };
      uni.showToast({ title: `${dirText[direction]}侧无任务`, icon: 'none', duration: 800 });
  }
};

// 辅助：寻找下一个有任务的列的 X 坐标
const findNextColumnX = (cx, cy, dx) => {
    const rowTasks = taskNodes.value.filter(t => t.y === cy);
    const existXs = [...new Set(rowTasks.map(t => t.x))].sort((a, b) => a - b);
    
    if (dx === 1) { // 找右边 (> cx)
        return existXs.find(x => x > cx) ?? null;
    } else { // 找左边 (< cx)
        return existXs.reverse().find(x => x < cx) ?? null;
    }
};

// 辅助：寻找跨行(垂直方向)的最近任务
const findClosestColumnTask = (cx, cy, dx, dy) => {
    const targetY = cy + dy;
    const rowTasks = taskNodes.value.filter(t => t.y === targetY);
    if (rowTasks.length === 0) return null;

    let targets = rowTasks.filter(t => t.x === cx);
    
    if (targets.length > 0) {
        // dy=1 (去下一行) -> 取目标格子的第1个
        // dy=-1 (去上一行) -> 取目标格子的最后1个 (底部)
        return dy === 1 ? targets[0] : targets[targets.length - 1];
    }
    return null;
};
</script>

<style lang="scss" scoped>
$bg-color: #FFFFFF;
$text-main: #333;
$text-sub: #999;
$theme-color: #4C8AF2;
$line-color: #EAEAEA;

/* 柔和配色 */
$goal-bg: #FFF7ED;  
$goal-text: #C05621;
$epic-bg: #FEFCE8;  
$epic-text: #975A16;
$grid-line: #E5E7EB;

.task-map-page {
	height: 100vh;
	display: flex;
	flex-direction: column;
	background-color: $bg-color;
}

.header-sticky {
	position: sticky; top: 0; z-index: 50; background: #fff;
	border-bottom: 1rpx solid $line-color;
}
.header-content {
	height: 88rpx; display: flex; justify-content: space-between; align-items: center; padding: 0 20rpx;
}
.icon-button { width: 80rpx; height: 80rpx; display: flex; align-items: center; justify-content: center; }
.header-title { font-weight: bold; font-size: 32rpx; color: $text-main; }

.legend-bar {
	display: flex; justify-content: center; gap: 24rpx; padding-bottom: 12rpx; font-size: 20rpx; color: $text-sub;
}
.legend-item { display: flex; align-items: center; gap: 6rpx; }
.dot { width: 12rpx; height: 12rpx; border-radius: 2rpx; }
.dot.completed { background: #2ECC71; }
.dot.progress { background: #4C8AF2; }
.dot.upcoming { background: #BDC3C7; }

.matrix-container {
	flex: 1;
	height: 0;
	position: relative;
}
.matrix-scroll-x {
	height: 100%;
	width: 100%;
}
.matrix-table {
	display: flex;
	flex-direction: column;
	min-width: 100%;
}
.matrix-row {
	display: flex;
	width: 100%;
	align-items: stretch; /* 高度拉伸对齐 */
}

/* --- 基础单元格 (宽绰模式) --- */
.matrix-cell {
	flex: 1;
	min-width: 220rpx; 
	padding: 10rpx;
	box-sizing: border-box;
	flex-shrink: 0;
	border-right: 1rpx solid $grid-line;
	border-bottom: 1rpx solid $grid-line;
	display: flex;
	justify-content: center;
	align-items: center;
}

.sticky-col {
	position: sticky; left: 0; z-index: 10; background-color: #fff;
	flex: 0 0 120rpx; 
	min-width: 120rpx;
	width: 120rpx;
	border-right: 1rpx solid $line-color;
    box-shadow: 2rpx 0 6rpx rgba(0,0,0,0.02);
}

.epic-cell {
	background-color: $epic-bg;
	color: $epic-text;
	height: 80rpx;
	border-bottom: 1rpx solid $line-color;
	border-right: 1rpx solid $grid-line;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0 10rpx;
}
.header-text {
	font-size: 26rpx;
	font-weight: bold;
	text-align: center;
	white-space: normal;
	line-height: 1.2;
}

/* 内容行 */
.body-row { 
    border-bottom: 1rpx solid $line-color;
    min-height: 240rpx; 
}
.release-cell {
	background-color: #FFFFFF;
	font-size: 26rpx;
	font-weight: bold;
	color: #555;
	text-align: center;
	line-height: 1.2;
    /* [关键] 垂直居中 */
    align-items: center; 
    justify-content: center;
}

/* [关键] 任务节点容器：垂直居中 */
.task-cell {
	align-items: center; /* 垂直居中 */
	padding-top: 0;
}

.task-stack {
	display: flex;
	flex-direction: column;
	gap: 12rpx;
	width: 100%;
	align-items: center;
    justify-content: center; /* 堆叠内容居中 */
}

/* [关键] 正方形图标 */
.mini-node {
	width: 90rpx; 
	height: 90rpx;
	border-radius: 16rpx;
	display: flex; align-items: center; justify-content: center;
	font-size: 28rpx;
	font-weight: bold;
	color: white;
	transition: all 0.3s ease;
    box-shadow: 0 4rpx 10rpx rgba(0,0,0,0.1);
}

/* --- 紧凑模式 (Compact Mode) --- */
.mode-compact {
	.matrix-cell {
		min-width: 80rpx; 
		padding: 10rpx 4rpx;
	}
	.sticky-col {
		flex: 0 0 90rpx;
		min-width: 90rpx;
		width: 90rpx;
	}
    .body-row {
        min-height: 160rpx;
    }
    .release-cell {
        font-size: 20rpx;
    }

	.mini-node {
		width: 40rpx; 
		height: 40rpx;
		border-radius: 6rpx;
		font-size: 16rpx;
        box-shadow: none;
	}
    .task-stack {
        gap: 6rpx;
    }

	.epic-cell {
		height: 220rpx; 
		align-items: center;
		padding: 10rpx 0;
	}
	.header-text {
		font-size: 20rpx;
		writing-mode: vertical-lr; 
		text-orientation: upright;
		letter-spacing: 4rpx;
	}
    .corner-compact {
        height: 220rpx !important;
    }
}

/* 表头通用 */
.goal-row { position: sticky; top: 0; z-index: 21; }
.header-corner-top {
	background-color: #fff;
	height: 60rpx;
	font-size: 18rpx; color: $text-sub;
	border-bottom: 1rpx solid #fff;
	align-items: center;
	justify-content: center;
}
.goal-cell {
	background-color: $goal-bg;
	color: $goal-text;
	font-size: 20rpx;
	font-weight: bold;
	height: 60rpx;
	border-right: 1rpx solid $grid-line;
	text-align: center;
	overflow: hidden;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	line-height: 1.1;
	padding: 4rpx 8rpx;
}

.epic-row { position: sticky; top: 60rpx; z-index: 20; }
.header-corner-bottom {
	background-color: #fff;
	height: 80rpx; 
	font-size: 18rpx; color: $text-sub;
	border-bottom: 1rpx solid $line-color;
	display: flex; 
	align-items: center; 
	justify-content: center;
}

/* 状态颜色 */
.mini-node:active { opacity: 0.6; }
.mini-node.completed { background: #2ECC71; }
.mini-node.submitted { background: #4C8AF2; }
.mini-node.in-progress { background: #4C8AF2; }
.mini-node.upcoming { background: #E0E0E0; color: #AAA; }

/* 弹窗 */
.task-overlay {
	position: fixed; left: 0; top: 0; width: 100%; height: 100%;
	background: rgba(0, 0, 0, 0.5); z-index: 100;
	display: flex; align-items: center; justify-content: center;
	padding: 40rpx;
    backdrop-filter: blur(2px);
}
.task-detail-card {
	width: 100%; max-width: 560rpx;
	background: #fff; border-radius: 20rpx; padding: 36rpx;
	box-shadow: 0 10rpx 40rpx rgba(0,0,0,0.2);
	animation: popIn 0.15s ease-out;
}
@keyframes popIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }

.task-detail-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24rpx; }
.task-detail-title { font-size: 32rpx; font-weight: bold; color: $text-main; }
.task-detail-id { font-size: 22rpx; color: $text-sub; background: #f0f0f0; padding: 4rpx 10rpx; border-radius: 6rpx; font-family: monospace;}

.task-detail-row { display: flex; margin-bottom: 12rpx; font-size: 24rpx; }
.detail-label { width: 100rpx; color: $text-sub; flex-shrink: 0; }
.detail-value { flex: 1; color: $text-main; line-height: 1.4; }
.status-text.completed { color: #2ECC71; font-weight: bold; }
.status-text.in-progress { color: #4C8AF2; font-weight: bold; }
.detail-actions { margin-top: 36rpx; display: flex; flex-direction: column; align-items: stretch; gap: 16rpx; }
.button-primary {
	height: 80rpx; border-radius: 12rpx;
	background: linear-gradient(135deg, #4C8AF2, #6C5BFF);
	color: #fff; font-size: 26rpx; font-weight: bold;
	display: flex; align-items: center; justify-content: center;
}
.swipe-hint { font-size: 20rpx; color: #bbb; text-align: center; }
</style>