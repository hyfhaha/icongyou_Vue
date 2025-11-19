<template>
	<view class="task-detail-page">
		<!-- 头部 -->
		<view class="header-sticky">
			<view class="header-content">
				<view class="icon-button" @click="goBack">
					<uni-icons type="left" size="24" color="#555555"></uni-icons>
				</view>
				<text class="header-title">任务详情</text>
				<view class="icon-button">
					<uni-icons type="more-filled" size="24" color="#555555"></uni-icons>
				</view>
			</view>
		</view>

		<scroll-view scroll-y="true" class="page-scroll">
			<!-- 任务头信息卡片 -->
			<view class="task-header-card">
				<view class="header-top">
					<view class="header-left">
						<text class="task-title">T4-1爱从游（学生移动端）详情</text>
						<view class="meta-row">
							<view class="meta-tag">
								<uni-icons type="staff-filled" size="14" color="#FFFFFF"></uni-icons>
								<text>团队任务</text>
							</view>
							<view class="meta-tag">
								<uni-icons type="paperplane-filled" size="14" color="#FFFFFF"></uni-icons>
								<text>200分</text>
							</view>
						</view>
					</view>
					<view class="header-right">
						<view class="rating-badge">
							<text>⭐⭐⭐ 正常</text>
						</view>
						<text class="meta-text">提交 1次</text>
					</view>
				</view>
				
				<!-- 截止时间 -->
				<view class="deadline-card">
					<view class="deadline-item">
						<text class="deadline-label">截止时间</text>
						<text class="deadline-value">2025-11-30 00:00:00</text>
					</view>
					<view class="deadline-item" style="text-align: right;">
						<text class="deadline-label">剩余时间</text>
						<text class="deadline-value" style="color: #F39C12;">13天</text>
					</view>
				</view>
			</view>

			<!-- 任务信息 -->
			<view class="card-box">
				<view class="info-grid">
					<view class="info-item">
						<text class="info-label">任务名称</text>
						<text class="info-value">T4-1爱从游（学生移动端）</text>
					</view>
					<view class="info-item">
						<text class="info-label">任务类型</text>
						<text class="info-value">团队(队长交)</text>
					</view>
					<view class="info-item">
						<text class="info-label">任务总分</text>
						<text class="info-value">200</text>
					</view>
					<view class="info-item">
						<text class="info-label">提交次数</text>
						<text class="info-value">1次</text>
					</view>
					<view class="info-item">
						<text class="info-label">是否必做</text>
						<text class="info-value" style="color: #2ECC71;">是</text>
					</view>
					<view class="info-item">
						<text class="info-label">作业性质</text>
						<text class="info-value">任务剧团队内提交</text>
					</view>
					<view class="info-item">
						<text class="info-label">开始时间</text>
						<text class="info-value">未设定</text>
					</view>
					<view class="info-item">
						<text class="info-label">任务解锁</text>
						<text class="info-value">不上锁</text>
					</view>
				</view>
			</view>

			<!-- 要求事项 -->
			<view class="card-box">
				<view class="card-title-row">
					<uni-icons type="info-filled" size="20" color="#4C8AF2"></uni-icons>
					<text class="card-title">要求事项</text>
				</view>
				<view class="req-list">
					<view class="req-item">
						<view class="req-number"><text>1</text></view>
						<text class="req-text">多课程教学规划：整合多学科知识要素入口，以本示式规范课程描述、进度要求及支持标准与任务方法；支持跨学科同步和学习路径未来演绎与任务方向。</text>
					</view>
					<view class="req-item">
						<view class="req-number"><text>2</text></view>
						<text class="req-text">展示某课程的任务示例任务，协会某课程中任务者包含色号，展示某任务名称、概览与要求。</text>
					</view>
					<!-- ... 其他要求 ... -->
					<view class="req-item">
						<view class="req-number"><text>7</text></view>
						<text class="req-text">兼某者本演练的开表</text>
					</view>
				</view>
			</view>

			<!-- 任务资料 -->
			<view class="card-box">
				<view class="card-title-row">
					<uni-icons type="paperclip" size="20" color="#2ECC71"></uni-icons>
					<text class="card-title">任务资料 (3)</text>
				</view>
				<view class="material-list">
					<view class="material-item">
						<view class="material-icon-bg">
							<uni-icons type="download-filled" size="24" color="#4C8AF2"></uni-icons>
						</view>
						<view class="material-info">
							<text class="material-name">项目需求文档.pdf</text>
							<text class="material-size">2.3 MB</text>
						</view>
						<uni-icons type="right" size="16" color="#AAAAAA" class="material-arrow"></uni-icons>
					</view>
				</view>
			</view>

			<!-- 按钮组 -->
			<view class="button-group">
				<button class="button-primary" @click="openSubmitModal">
					<text>提交作业</text>
				</button>
				
				<button class="button-secondary">
					<uni-icons type="chatbubble-filled" size="20" color="#FFFFFF"></uni-icons>
					<text>AI 助教答疑</text>
				</button>
			</view>
		</scroll-view>
	</view>
</template>

<script setup>
const goBack = () => {
	uni.navigateBack();
};

const openSubmitModal = () => {
	console.log('Open submit modal');
	// (US21) 导航到提交页面
	uni.navigateTo({
		url: '/pages/task/Submission?taskId=T4-1'
	});
};
</script>

<style lang="scss" scoped>
// 假设 $theme-color: #4C8AF2; 定义在 uni.scss
$bg-color: #F4F7FA;
$card-bg: #FFFFFF;
$text-color: #333333;
$text-light: #888888;
$border-color: #EAEAEA;
$shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

.task-detail-page {
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

.task-header-card {
	background: linear-gradient(135deg, #4C8AF2, #6C5BFF);
	border-radius: 24rpx;
	padding: 40rpx;
	color: white;
	box-shadow: 0 10rpx 30rpx rgba(76, 138, 242, 0.3);
	margin-bottom: 30rpx;

	.header-top {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 30rpx;
	}
	.header-left {
		flex: 1;
	}
	.task-title {
		font-size: 40rpx;
		font-weight: bold;
		line-height: 1.4;
		margin-bottom: 20rpx;
	}
	.meta-row {
		display: flex;
		gap: 24rpx;
	}
	.meta-tag {
		display: flex;
		align-items: center;
		gap: 8rpx;
		font-size: 24rpx;
		color: #E0E7FF;
	}
	.header-right {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		flex-shrink: 0;
		margin-left: 20rpx;
	}
	.rating-badge {
		background: rgba(255, 255, 255, 0.2);
		backdrop-filter: blur(10px);
		border-radius: 12rpx;
		padding: 10rpx 16rpx;
		font-size: 24rpx;
		font-weight: 500;
		margin-bottom: 10rpx;
	}
	.meta-text {
		font-size: 24rpx;
		color: #E0E7FF;
	}
	
	.deadline-card {
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10px);
		border-radius: 16rpx;
		padding: 30rpx;
		display: flex;
		justify-content: space-between;
	}
	.deadline-label {
		font-size: 24rpx;
		color: #E0E7FF;
		margin-bottom: 8rpx;
	}
	.deadline-value {
		font-size: 30rpx;
		font-weight: 600;
	}
}

.card-box {
	background: $card-bg;
	border-radius: 24rpx;
	box-shadow: $shadow;
	padding: 40rpx;
	margin-bottom: 30rpx;
}

.info-grid {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 30rpx;
}
.info-item {
	.info-label {
		font-size: 26rpx;
		color: $text-light;
		margin-bottom: 8rpx;
		display: block;
	}
	.info-value {
		font-size: 28rpx;
		font-weight: 500;
		color: $text-color;
	}
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

.req-list {
	display: flex;
	flex-direction: column;
	gap: 30rpx;
}
.req-item {
	display: flex;
	align-items: flex-start;
	gap: 20rpx;
	.req-number {
		flex-shrink: 0;
		width: 44rpx;
		height: 44rpx;
		background: #EBF0F6;
		color: #4C8AF2; // $theme-color
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 22rpx;
		font-weight: bold;
	}
	.req-text {
		font-size: 26rpx;
		color: $text-color;
		line-height: 1.6;
	}
}

.material-list {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}
.material-item {
	display: flex;
	align-items: center;
	padding: 24rpx;
	background: $bg-color;
	border-radius: 16rpx;
	transition: background 0.2s;
	&:active {
		background: #E0E0E0;
	}
	
	.material-icon-bg {
		width: 80rpx;
		height: 80rpx;
		background: #EBF0F6;
		border-radius: 16rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 24rpx;
	}
	.material-info {
		flex: 1;
	}
	.material-name {
		font-size: 28rpx;
		font-weight: 500;
		color: $text-color;
		display: block;
	}
	.material-size {
		font-size: 24rpx;
		color: $text-light;
		margin-top: 4rpx;
	}
	.material-arrow {
		flex-shrink: 0;
	}
}

.button-group {
	display: flex;
	flex-direction: column;
	gap: 24rpx;
	
	.button-primary, .button-secondary {
		width: 100%;
		height: 96rpx;
		border-radius: 20rpx;
		font-size: 30rpx;
		font-weight: 600;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 16rpx;
		transition: opacity 0.2s;
		&:active {
			opacity: 0.8;
		}
	}
	
	.button-primary {
		background: linear-gradient(135deg, #4C8AF2, #6C5BFF);
		color: white;
		box-shadow: 0 8rpx 20rpx rgba(76, 138, 242, 0.3);
	}
	
	.button-secondary {
		background: linear-gradient(135deg, #A855F7, #EC4899);
		color: white;
		box-shadow: 0 8rpx 20rpx rgba(168, 85, 247, 0.3);
	}
}
</style>