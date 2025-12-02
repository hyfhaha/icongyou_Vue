<template>
	<view class="page-container">
		<view class="header">
			<uni-icons type="left" size="24" color="#333" @click="goBack"></uni-icons>
			<text class="title">帮助中心</text>
			<view style="width: 24px;"></view>
		</view>

		<scroll-view scroll-y class="content-scroll">
			<view class="content">
				<view class="qa-item">
					<view class="q-row">
						<uni-icons type="help-filled" size="20" color="#4C8AF2"></uni-icons>
						<text class="q-text">如何提交作业？</text>
					</view>
					<text class="a-text">进入课程 -> 任务地图 -> 点击具体任务 -> 点击“提交作业”按钮上传文件。</text>
				</view>

				<view class="qa-item">
					<view class="q-row">
						<uni-icons type="help-filled" size="20" color="#4C8AF2"></uni-icons>
						<text class="q-text">为什么我看不到“提交”按钮？</text>
					</view>
					<text class="a-text">部分团队任务仅限队长提交。如果您是组员，请联系队长进行提交；或者检查任务是否已过截止时间。</text>
				</view>

				<view class="qa-item">
					<view class="q-row">
						<uni-icons type="help-filled" size="20" color="#4C8AF2"></uni-icons>
						<text class="q-text">如何修改个人信息？</text>
					</view>
					<text class="a-text">目前暂不支持移动端修改，请登录网页端或联系管理员进行修改。</text>
				</view>
				
				<view class="qa-item">
					<view class="q-row">
						<uni-icons type="help-filled" size="20" color="#4C8AF2"></uni-icons>
						<text class="q-text">忘记密码怎么办？</text>
					</view>
					<text class="a-text">请联系您的辅导员或课程管理员重置密码。</text>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script setup>
const goBack = () => uni.navigateBack();
</script>

<style scoped>
.page-container { 
	height: 100vh; 
	background: #F4F7FA; 
	display: flex; 
	flex-direction: column; 
}

/* [关键修改] Header 适配状态栏 */
.header { 
	background: #fff; 
	
	/* 1. 顶部增加状态栏高度 */
	padding-top: var(--status-bar-height);
	/* 2. 左右保持 padding */
	padding-left: 20rpx;
	padding-right: 20rpx;
	
	/* 3. 固定内容高度 */
	height: 88rpx;
	
	/* 4. [重要] 确保 padding 不挤压 height */
	box-sizing: content-box;
	
	display: flex; 
	justify-content: space-between; 
	align-items: center; 
	
	/* 增加一个小阴影，让它和背景区分开 */
	box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.05);
	z-index: 10;
}

.title { 
	font-weight: bold; 
	font-size: 32rpx; 
	color: #333;
}

.content-scroll {
	flex: 1;
	height: 0;
}

.content { 
	padding: 30rpx; 
	/* 底部增加安全区，防止贴底 */
	padding-bottom: calc(30rpx + constant(safe-area-inset-bottom));
	padding-bottom: calc(30rpx + env(safe-area-inset-bottom));
}

.qa-item { 
	background: #fff; 
	padding: 36rpx; 
	border-radius: 20rpx; 
	margin-bottom: 24rpx; 
	box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.03);
}

.q-row {
	display: flex;
	align-items: center;
	gap: 12rpx;
	margin-bottom: 16rpx;
}

.q-text { 
	font-weight: bold; 
	font-size: 30rpx; 
	color: #333; 
}

.a-text { 
	display: block; 
	font-size: 28rpx; 
	color: #666; 
	line-height: 1.6; 
	padding-left: 52rpx; /* 让回答跟标题文字对齐，避开图标 */
}
</style>