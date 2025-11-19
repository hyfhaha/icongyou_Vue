<template>
	<view class="settings-page">
		<view class="header-sticky">
			<view class="header-content">
				<view class="icon-button" @click="goBack">
					<uni-icons type="left" size="22" color="#555555"></uni-icons>
				</view>
				<text class="header-title">设置</text>
				<view class="icon-button">
					<uni-icons type="gear" size="22" color="#555555"></uni-icons>
				</view>
			</view>
		</view>

		<scroll-view scroll-y class="page-scroll">
			<view class="section-card">
				<text class="section-title">个性化偏好</text>
				<view class="setting-item">
					<view>
						<text class="setting-label">显示学期标签</text>
						<text class="setting-desc">在课程导览页显示更多筛选标签</text>
					</view>
					<switch :checked="preferences.showTags" color="#4C8AF2" @change="toggleSwitch('showTags', $event.detail.value)"></switch>
				</view>
				<view class="setting-item">
					<view>
						<text class="setting-label">学习提醒</text>
						<text class="setting-desc">距离截止前 24 小时推送提醒</text>
					</view>
					<switch :checked="preferences.reminder" color="#4C8AF2" @change="toggleSwitch('reminder', $event.detail.value)"></switch>
				</view>
				<view class="setting-item">
					<view>
						<text class="setting-label">夜间主题</text>
						<text class="setting-desc">低亮度配色，适合夜间学习</text>
					</view>
					<switch :checked="preferences.darkMode" color="#4C8AF2" @change="toggleSwitch('darkMode', $event.detail.value)"></switch>
				</view>
			</view>

			<view class="section-card">
				<text class="section-title">账号与安全</text>
				<view class="setting-list">
					<view class="setting-row" @click="onNavigate('account')">
						<text>账号信息</text>
						<uni-icons type="right" size="18" color="#AAAAAA"></uni-icons>
					</view>
					<view class="setting-row" @click="onNavigate('password')">
						<text>修改密码</text>
						<uni-icons type="right" size="18" color="#AAAAAA"></uni-icons>
					</view>
					<view class="setting-row" @click="onNavigate('privacy')">
						<text>隐私与授权</text>
						<uni-icons type="right" size="18" color="#AAAAAA"></uni-icons>
					</view>
				</view>
			</view>

			<view class="section-card">
				<text class="section-title">数据导出</text>
				<view class="export-card">
					<text class="export-desc">可将本学期课程成绩、任务完成情况导出为 Excel，用于工程认证佐证材料。</text>
					<button class="button-primary" @click="exportData">导出数据</button>
				</view>
			</view>

			<view class="section-card danger">
				<button class="button-danger" @click="logout">退出当前账号</button>
			</view>
		</scroll-view>
	</view>
</template>

<script setup>
import { reactive } from 'vue';

const preferences = reactive({
  showTags: true,
  reminder: true,
  darkMode: false
});

const goBack = () => {
  uni.navigateBack();
};

const toggleSwitch = (key, value) => {
  preferences[key] = value;
};

const onNavigate = (type) => {
  console.log('navigate to', type);
  if (type === 'account') {
    uni.navigateTo({ url: '/pages/index/ProfileView' });
  }
};

const exportData = () => {
  uni.showToast({
    title: '已开始导出',
    icon: 'success'
  });
};

const logout = () => {
  uni.showModal({
    title: '提示',
    content: '确认退出当前登录吗？',
    success: (res) => {
      if (res.confirm) {
        uni.reLaunch({ url: '/pages/index/LoginView' });
      }
    }
  });
};
</script>

<style lang="scss" scoped>
$bg-color: #F4F7FA;
$card-bg: #FFFFFF;
$text-color: #333333;
$text-light: #888888;
$border-color: #EAEAEA;
$shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

.settings-page {
	height: 100vh;
	display: flex;
	flex-direction: column;
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
	padding: 0 24rpx;
	height: 100rpx;
}
.icon-button {
	width: 80rpx;
	height: 80rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}
.header-title {
	font-size: 34rpx;
	font-weight: bold;
	color: $text-color;
}

.page-scroll {
	flex: 1;
	height: 0;
	padding: 30rpx;
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	gap: 24rpx;
}

.section-card {
	background: $card-bg;
	border-radius: 24rpx;
	padding: 32rpx;
	box-shadow: $shadow;
}
.section-card.danger {
	background: #FFF5F5;
}
.section-title {
	font-size: 28rpx;
	font-weight: 600;
	color: $text-color;
	display: block;
	margin-bottom: 24rpx;
}

.setting-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20rpx 0;
	border-bottom: 1rpx solid $border-color;
	&:last-child {
		border-bottom: none;
	}
}
.setting-label {
	font-size: 28rpx;
	color: $text-color;
	display: block;
}
.setting-desc {
	font-size: 24rpx;
	color: $text-light;
	margin-top: 6rpx;
}

.setting-list {
	display: flex;
	flex-direction: column;
}
.setting-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20rpx 0;
	border-bottom: 1rpx solid $border-color;
	&:last-child {
		border-bottom: none;
	}
	font-size: 28rpx;
	color: $text-color;
}

.export-card {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}
.export-desc {
	font-size: 26rpx;
	color: $text-light;
	line-height: 1.5;
}

.button-primary {
	height: 90rpx;
	border-radius: 20rpx;
	background: linear-gradient(135deg, #4C8AF2, #6C5BFF);
	color: white;
	font-size: 30rpx;
	font-weight: 600;
}
.button-danger {
	width: 100%;
	height: 96rpx;
	border-radius: 20rpx;
	background: linear-gradient(135deg, #F87171, #EF4444);
	color: white;
	font-size: 30rpx;
	font-weight: 600;
}
</style>

