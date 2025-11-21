<template>
	<view class="settings-page">
		<view class="header-sticky">
			<view class="header-content">
				<view class="icon-button" @click="goBack">
					<uni-icons type="left" size="22" color="#555555"></uni-icons>
				</view>
				<text class="header-title">设置</text>
				<view class="icon-button"></view>
			</view>
		</view>

		<scroll-view scroll-y class="page-scroll">
			<view class="section-card">
				<text class="section-title">个性化偏好</text>
				
				<view class="setting-item">
					<view>
						<text class="setting-label">显示学期标签</text>
						<text class="setting-desc">在课程列表页显示学期分类标签</text>
					</view>
					<switch 
						:checked="preferences.showTags" 
						color="#4C8AF2" 
						@change="handleToggle('showTags')"
						style="transform:scale(0.8)"
					></switch>
				</view>
				
				<view class="setting-item">
					<view>
						<text class="setting-label">学习提醒</text>
						<text class="setting-desc">距离任务截止前 24 小时推送提醒</text>
					</view>
					<switch 
						:checked="preferences.reminder" 
						color="#4C8AF2" 
						@change="handleToggle('reminder')"
						style="transform:scale(0.8)"
					></switch>
				</view>
				
				<view class="setting-item">
					<view>
						<text class="setting-label">夜间主题</text>
						<text class="setting-desc">低亮度配色，适合夜间学习</text>
					</view>
					<switch 
						:checked="preferences.darkMode" 
						color="#4C8AF2" 
						@change="handleToggle('darkMode')"
						style="transform:scale(0.8)"
					></switch>
				</view>
			</view>

			<view class="section-card">
				<text class="section-title">账号与安全</text>
				<view class="setting-list">
					<view class="setting-row" @click="onNavigate('profile')">
						<text>个人资料</text>
						<uni-icons type="right" size="16" color="#AAAAAA"></uni-icons>
					</view>
					<view class="setting-row" @click="onNavigate('password')">
						<text>修改密码</text>
						<uni-icons type="right" size="16" color="#AAAAAA"></uni-icons>
					</view>
					<view class="setting-row">
						<text>隐私与授权</text>
						<uni-icons type="right" size="16" color="#AAAAAA"></uni-icons>
					</view>
				</view>
			</view>

			<view class="section-card">
				<text class="section-title">数据管理</text>
				<view class="export-card">
					<text class="export-desc">导出本学期课程成绩与任务佐证材料 (Excel/PDF)。</text>
					<button class="button-primary" @click="exportData">导出数据</button>
				</view>
			</view>

			<view class="section-card danger">
				<button class="button-danger" @click="handleLogout">退出当前账号</button>
			</view>
		</scroll-view>
	</view>
</template>

<script setup>
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
// 引入两个 Store
import { useSettingsStore } from '@/store/settingsStore';
import { useAuthStore } from '@/store/authStore';

const settingsStore = useSettingsStore();
const authStore = useAuthStore();

const { preferences } = storeToRefs(settingsStore);

// 初始化加载配置
onMounted(() => {
	settingsStore.loadSettings();
});

const goBack = () => {
  uni.navigateBack();
};

// 切换开关
const handleToggle = (key) => {
  settingsStore.toggleSetting(key);
};

const onNavigate = (type) => {
  if (type === 'profile') {
    uni.switchTab({ url: '/pages/index/ProfileView' });
  } else {
    uni.showToast({ title: '功能开发中', icon: 'none' });
  }
};

const exportData = () => {
  uni.showLoading({ title: '正在生成...' });
  setTimeout(() => {
    uni.hideLoading();
    uni.showToast({
      title: '导出成功，已发送至邮箱',
      icon: 'success'
    });
  }, 1500);
};

// 退出登录 (复用 authStore 的逻辑)
const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确认退出当前登录吗？',
    success: (res) => {
      if (res.confirm) {
        authStore.logout();
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
	gap: 30rpx;
}

.section-card {
	background: $card-bg;
	border-radius: 24rpx;
	padding: 32rpx;
	box-shadow: $shadow;
}
.section-card.danger {
	background: transparent;
	box-shadow: none;
	padding: 0;
}
.section-title {
	font-size: 28rpx;
	font-weight: 600;
	color: $text-color;
	display: block;
	margin-bottom: 24rpx;
	padding-left: 8rpx;
	border-left: 6rpx solid #4C8AF2;
	line-height: 1;
}

.setting-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 24rpx 0;
	border-bottom: 1rpx solid $border-color;
	&:last-child {
		border-bottom: none;
	}
}
.setting-label {
	font-size: 30rpx;
	color: $text-color;
	display: block;
}
.setting-desc {
	font-size: 24rpx;
	color: $text-light;
	margin-top: 6rpx;
	display: block;
}

.setting-list {
	display: flex;
	flex-direction: column;
}
.setting-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 28rpx 0;
	border-bottom: 1rpx solid $border-color;
	&:last-child {
		border-bottom: none;
	}
	font-size: 30rpx;
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
	background: #FFFFFF;
	color: #EF4444;
	border: 2rpx solid #FCA5A5;
	font-size: 30rpx;
	font-weight: 600;
}
</style>