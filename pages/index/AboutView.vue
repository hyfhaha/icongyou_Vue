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
const goBack = () => uni.navigateBack();
</script>

<style scoped>
.page-container { height: 100vh; background: #fff; display: flex; flex-direction: column; }
.header { padding: 20rpx; display: flex; justify-content: space-between; align-items: center; height: 88rpx; }
.title { font-weight: bold; font-size: 32rpx; }
.content { flex: 1; display: flex; flex-direction: column; align-items: center; padding: 60rpx 40rpx; }
.logo-box { display: flex; flex-direction: column; align-items: center; margin-bottom: 60rpx; }
.app-name { font-size: 40rpx; font-weight: bold; margin-top: 20rpx; color: #333; }
.version { font-size: 24rpx; color: #999; margin-top: 10rpx; }
.info-box { width: 100%; }
.desc { font-size: 28rpx; color: #666; line-height: 1.8; text-align: justify; }
.footer { margin-top: auto; font-size: 22rpx; color: #ccc; }
</style>