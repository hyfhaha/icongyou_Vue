<template>
	<view class="page-container">
		<view class="header">
			<uni-icons type="left" size="24" @click="goBack"></uni-icons>
			<text class="title">关于我们</text>
			<view style="width: 24px;"></view>
		</view>
		<view class="content">
			<view class="logo-box">
				<uni-icons type="pyq" size="80" color="#4C8AF2"></uni-icons>
				<text class="app-name">爱从游</text>
				<text class="version">Version 1.0.0</text>
			</view>
			<view class="info-box">
				<text class="desc">爱从游是一款专注于高校实训课程管理的移动端应用，致力于通过游戏化教学提升学生的实践能力与团队协作水平。</text>
			</view>
			<view class="footer">
				<text>© 2025 爱从游团队. All Rights Reserved.</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { onPullDownRefresh } from '@dcloudio/uni-app';

const goBack = () => uni.navigateBack();

// 下拉刷新：静态页面，仅结束刷新动画
onPullDownRefresh(() => {
  uni.stopPullDownRefresh();
});
</script>

<style scoped>
.page-container { 
    height: 100vh; 
    background: #fff; 
    display: flex; 
    flex-direction: column; 
}

/* [关键修改] Header 适配状态栏 */
.header { 
    /* 1. 顶部增加状态栏高度 */
    padding-top: var(--status-bar-height);
    /* 2. 左右保持原有的 20rpx */
    padding-left: 20rpx;
    padding-right: 20rpx;
    
    /* 3. 高度保持 88rpx (这是内容高度) */
    height: 88rpx;
    
    /* 4. [重要] 使用 content-box，确保 padding 不会占用 height 的空间 */
    /* 这样总高度 = 88rpx + status-bar-height，不会挤压内容 */
    box-sizing: content-box; 
    
    display: flex; 
    justify-content: space-between; 
    align-items: center; 
    background-color: #fff; /* 确保背景色覆盖状态栏 */
}

.title { 
    font-weight: bold; 
    font-size: 32rpx; 
    color: #333;
}

.content { 
    flex: 1; 
    display: flex; 
    flex-direction: column; 
    align-items: center; 
    padding: 60rpx 40rpx; 
}

.logo-box { 
    display: flex; 
    flex-direction: column; 
    align-items: center; 
    margin-bottom: 60rpx; 
}

.app-name { 
    font-size: 40rpx; 
    font-weight: bold; 
    margin-top: 20rpx; 
    color: #333; 
}

.version { 
    font-size: 24rpx; 
    color: #999; 
    margin-top: 10rpx; 
}

.info-box { 
    width: 100%; 
}

.desc { 
    font-size: 28rpx; 
    color: #666; 
    line-height: 1.8; 
    text-align: justify; 
}

.footer { 
    margin-top: auto; 
    font-size: 22rpx; 
    color: #ccc; 
    /* 增加底部安全区适配，防止 footer 贴底被横条遮挡 */
    padding-bottom: calc(20rpx + constant(safe-area-inset-bottom));
    padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
}
</style>