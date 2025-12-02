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
				    <view class="legend-item"><view class="dot submitted"></view><text>未评</text></view> <view class="legend-item"><view class="dot progress"></view><text>进行</text></view>
				    <view class="legend-item"><view class="dot upcoming"></view><text>未开</text></view>
				    <view class="legend-item"><view class="dot overdue"></view><text>逾期</text></view></view>
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
									:class="[task.status, { 'is-optional': !task.required }]" 
									@click="openTaskPopup(task)"
								>
									<text class="node-text">{{ task.id }}</text>
									
									<text v-if="!task.required" class="optional-tag">选</text>
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
	const map = { 'completed': '已完成', 'submitted': '未点评', 'in-progress': '进行中', 'upcoming': '未开始' ,'overdue': '已逾期'};
	return map[status] || status;
};

const openTaskPopup = (task) => {
    console.log('当前任务数据:', task); // <--- 看这里
    console.log('required字段:', task.required); 
    selectedTask.value = task;
};
const closePopup = () => selectedTask.value = null;

const enterDetail = () => {
	if (selectedTask.value) {
		const taskId = selectedTask.value.id;
		contextStore.selectTask(taskId);
		uni.navigateTo({ url: `/pages/index/TaskDetailView?taskId=${taskId}` });
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
	padding-top: var(--status-bar-height);
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
.dot.submitted { background: #F39C12; } 
.dot.progress { background: #4C8AF2; }
.dot.upcoming { background: #BDC3C7; }
.dot.overdue { background: #E74C3C; }   /* [新增] 红色 */

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
    /* [修改] 改为 auto，让高度随任务数量自适应 */
    height: auto; 
    /* [修改] 给一个最小高度即可（大约一个卡片加padding的高度），避免空行太扁 */
    min-height: 120rpx; 
    display: flex; /* 确保 stretch 生效 */ 
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
	flex: 1;
	    min-width: 220rpx;
	    /* [修改] 上下留少许空隙，左右空隙极小，让卡片看起来撑满 */
	    padding: 12rpx 6rpx; 
	    box-sizing: border-box;
	    flex-shrink: 0;
	    border-right: 1rpx solid $grid-line;
	    border-bottom: 1rpx solid $grid-line;
	    display: flex;
	    justify-content: center;
	    /* [关键] 保持顶部对齐，防止不同堆叠数量导致错位 */
	    align-items: flex-start;
}

.task-stack {
display: flex;
    flex-direction: column;
    /* [修改] 间距稍微调小一点，显得更紧凑 */
    gap: 8rpx; 
    /* [关键] 强制占满单元格宽度 */
    width: 100%; 
    align-items: center;
    justify-content: flex-start;
}

/* [关键] 正方形图标 */
.mini-node {
/* [修改] 宽度占满父容器 */
	position: relative;
    width: 100%; 
    /* [修改] 高度设为 72-80rpx，配合宽宽度形成扁长方形 */
    height: 76rpx; 
    border-radius: 12rpx;
    display: flex; 
    align-items: center; 
    justify-content: center;
    font-size: 26rpx; /* 字体稍微调小一点点适配 */
    font-weight: bold;
    color: white;
    transition: all 0.3s ease;
    box-shadow: 0 4rpx 8rpx rgba(0,0,0,0.15); /* 加深一点阴影增加质感 */
}
/* [新增] 选做任务的特殊样式 */
.mini-node.is-optional {
    opacity: 0.85; /*稍微透明一点，显示出区别*/
    border: 2rpx dashed rgba(255,255,255,0.6); /* 增加虚线边框 */
    /* 如果背景色太深，虚线可能看不清，可以根据实际情况调整透明度 */
}

/* [新增] 角标样式 */
.optional-tag {
    position: absolute;
    right: 4rpx; /* 距离右边的距离 */
    top: 4rpx;   /* 距离顶部的距离 */
    font-size: 16rpx; /* 字体非常小 */
    line-height: 1;
    color: rgba(255,255,255,0.9);
    background-color: rgba(0,0,0,0.2); /* 半透明黑底，增加对比度 */
    padding: 2rpx 4rpx;
    border-radius: 4rpx;
    font-weight: normal;
}
/* --- 紧凑模式 (Compact Mode) --- */
.mode-compact {
	.optional-tag {
	        font-size: 12rpx;          /* 字体极小 */
	        padding: 0 2rpx;           /* 减少内边距 */
	        right: 2rpx;
	        top: 2rpx;
	        transform: scale(0.8);     /* 整体再缩放一下 */
	        transform-origin: top right; /*以此为基点缩放*/
	        opacity: 0.9;
	    }
	    
	    /* 让卡片文字稍微左移，避开角标 */
	    .mini-node .node-text {
	        padding-right: 10rpx; 
	    }
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
        min-height: 120rpx;
    }
    .release-cell {
        font-size: 20rpx;
    }

.mini-node {
        /* 紧凑模式下还是保持小方块，或者也改成 100% */
        width: 85%; 
        height: 50rpx; /* 高度压扁 */
        border-radius: 6rpx;
        font-size: 16rpx;
        box-shadow: none;
    }
    .task-cell {
        min-width: 80rpx;
        padding: 8rpx 2rpx; /* 紧凑模式边距更小 */
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
.mini-node.overdue { background: #E74C3C; }

/* 弹窗 */
.task-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;  /* [关键] 同时设置左右为0 */
    bottom: 0; /* [关键] 同时设置上下为0 */
    
    width: 100%;
    height: 100%;
    
    background: rgba(0, 0, 0, 0.5);
    z-index: 100;
    
    /* [关键] 强制内容水平垂直居中 */
    display: flex;
    align-items: center;
    justify-content: center;
    
    backdrop-filter: blur(2px);
}
.task-detail-card {
    /* 宽度占据屏幕的 85% */
    width: 85%;
    /* 最大宽度放宽到 700rpx (原 560rpx) */
    max-width: 560rpx;
    
    /* 背景与圆角 */
    background: #fff;
    border-radius: 32rpx; /* 圆角也稍微加大一点，更圆润 */
    
    /* [关键] 增加内边距，让内容呼吸感更强 */
    padding: 50rpx 40rpx;
    
    /* 阴影加重，增加浮起感 */
    box-shadow: 0 20rpx 60rpx rgba(0,0,0,0.2);
	
	/* [关键修改] 设置最小高度，让它竖向变长 */
	    min-height: 65vh;  /* 占据屏幕高度的 65% */
	    max-height: 85vh;  /* 防止太高超出屏幕 */
    
    /* 动画稍微调慢一点点，更有质感 */
    animation: popIn 0.25s cubic-bezier(0.18, 0.89, 0.32, 1.28);
    
    /* 防止内容过多溢出屏幕，设置最大高度 */
    max-height: 80vh;
    display: flex;
    flex-direction: column;
}
@keyframes popIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }

.task-detail-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24rpx; }
.task-detail-title {
    font-size: 40rpx; /* 原 32rpx */
    font-weight: bold;
    color: $text-main;
    line-height: 1.4;
    margin-bottom: 8rpx;
}
.task-detail-id { font-size: 22rpx; color: $text-sub; background: #f0f0f0; padding: 4rpx 10rpx; border-radius: 6rpx; font-family: monospace;}

.task-detail-row {
    display: flex;
    margin-bottom: 24rpx; /* 间距拉大 */
    font-size: 40rpx;     /* 字号微调 */
	margin-top: auto;
    line-height: 1.6;
}
.detail-label {
    width: 110rpx; /* 稍微宽一点 */
    color: $text-sub;
    flex-shrink: 0;
}
.detail-value { flex: 1; color: $text-main; line-height: 1.4; }
.status-text.completed { color: #2ECC71; font-weight: bold; }
.status-text.submitted { color: #F39C12; font-weight: bold; }
.status-text.in-progress { color: #4C8AF2; font-weight: bold; }
.status-text.overdue { color: #E74C3C; font-weight: bold; }
.detail-actions {
    /* [关键修改] auto 会自动占据剩余空间，把按钮推到卡片最底部 */
    margin-top: auto; 
    
    display: flex; 
    flex-direction: column; 
    align-items: stretch; 
    gap: 30rpx;
    
    /* 如果觉得离上面内容太近，可以加个最小间距 */
    padding-top: 40rpx; 
}
.button-primary {
    /* [关键] 高度加大 */
    height: 110rpx; 
    
    border-radius: 24rpx; /* 圆角也配合加大 */
    background: linear-gradient(135deg, #4C8AF2, #6C5BFF);
    color: #fff;
    
    /* [关键] 字体变大 */
    font-size: 34rpx; 
    font-weight: bold;
    
    display: flex;
    align-items: center;
    justify-content: center;
    
    /* 增加阴影，让大按钮更有层次感 */
    box-shadow: 0 8rpx 20rpx rgba(76, 138, 242, 0.4);
    
    &:active {
        transform: scale(0.98);
        opacity: 0.9;
    }
}
.swipe-hint { font-size: 20rpx; color: #bbb; text-align: center; }
</style>