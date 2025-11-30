<template>
	<view class="page-container">
		<view class="header">
			<uni-icons type="left" size="24" @click="goBack"></uni-icons>
			<text class="title">帮助中心</text>
			<view style="width: 24px;"></view>
		</view>
		<view class="content">
			<view class="qa-item">
				<text class="q">Q: 如何提交作业？</text>
				<text class="a">A: 进入课程 -> 任务地图 -> 点击具体任务 -> 点击“提交作业”按钮上传文件。</text>
			</view>
			<view class="qa-item">
				<text class="q">Q: 为什么我看不到“提交”按钮？</text>
				<text class="a">A: 部分团队任务仅限队长提交。如果您是组员，请联系队长进行提交。</text>
			</view>
			<view class="qa-item">
				<text class="q">Q: 如何修改个人信息？</text>
				<text class="a">A: 目前暂不支持移动端修改，请登录网页端或联系管理员。</text>
			</view>
		</view>
	</view>
</template>

<script setup>
const goBack = () => uni.navigateBack();
</script>

<style scoped>
.page-container { height: 100vh; background: #F4F7FA; display: flex; flex-direction: column; }
.header { background: #fff; padding: 20rpx; display: flex; justify-content: space-between; align-items: center; height: 88rpx; }
.title { font-weight: bold; font-size: 32rpx; }
.content { padding: 30rpx; }
.qa-item { background: #fff; padding: 30rpx; border-radius: 16rpx; margin-bottom: 20rpx; }
.q { display: block; font-weight: bold; font-size: 30rpx; margin-bottom: 10rpx; color: #333; }
.a { display: block; font-size: 26rpx; color: #666; line-height: 1.5; }
</style>