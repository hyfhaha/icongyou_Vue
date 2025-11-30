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
				<text class="section-title">显示与隐私</text>
				
				<view class="setting-item">
					<view>
						<text class="setting-label">显示学期标签</text>
						<text class="setting-desc">在课程列表中显示学期分类</text>
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
						<text class="setting-label">隐私保护模式</text>
						<text class="setting-desc">隐藏所有分数显示，防止窥屏</text>
					</view>
					<switch 
						:checked="preferences.privacyMode" 
						color="#4C8AF2" 
						@change="handleToggle('privacyMode')"
						style="transform:scale(0.8)"
					></switch>
				</view>
			</view>

			<view class="section-card">
				<text class="section-title">通用</text>
				<view class="setting-list">
                    <view class="setting-row" @click="handleClearCache">
						<view>
							<text class="setting-label-row">清除缓存</text>
							<text class="setting-desc">释放本地存储空间 ({{ cacheSize }})</text>
						</view>
						<uni-icons type="right" size="16" color="#AAAAAA"></uni-icons>
					</view>
                    
                    <view class="setting-row" @click="checkVersion">
						<text class="setting-label-row">检查更新</text>
						<view class="version-info">
							<text class="version-text">v1.0.2</text>
							<uni-icons type="right" size="16" color="#AAAAAA"></uni-icons>
						</view>
					</view>
				</view>
			</view>

			<view class="section-card danger">
				<button class="button-danger" @click="handleLogout">退出当前账号</button>
			</view>
		</scroll-view>
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useSettingsStore } from '@/store/settingsStore';
import { useAuthStore } from '@/store/authStore';

const settingsStore = useSettingsStore();
const authStore = useAuthStore();
const { preferences } = storeToRefs(settingsStore);
const cacheSize = ref('0KB');

onMounted(() => {
	settingsStore.loadSettings();
    calculateCache();
});

const goBack = () => uni.navigateBack();

const handleToggle = (key) => {
  settingsStore.toggleSetting(key);
};

// 计算缓存大小 (模拟)
const calculateCache = () => {
    try {
        const res = uni.getStorageInfoSync();
        // 简单换算一下 KB
        cacheSize.value = (res.currentSize > 1024) 
            ? (res.currentSize / 1024).toFixed(1) + 'MB' 
            : res.currentSize + 'KB';
    } catch (e) {
        cacheSize.value = '0KB';
    }
};

// 真实功能：清除缓存
const handleClearCache = () => {
    uni.showModal({
        title: '清除缓存',
        content: '确定要清除本地缓存吗？这不会删除您的账号数据。',
        success: (res) => {
            if (res.confirm) {
                // 保留 token 和设置，清除其他无关紧要的
                const token = uni.getStorageSync('token');
                const settings = uni.getStorageSync('app_settings');
                
                uni.clearStorageSync();
                
                // 恢复关键数据
                if(token) uni.setStorageSync('token', token);
                if(settings) uni.setStorageSync('app_settings', settings);
                
                uni.showToast({ title: '清理完成', icon: 'success' });
                calculateCache(); // 刷新显示
            }
        }
    });
};

// 模拟功能：检查更新
const checkVersion = () => {
    uni.showLoading({ title: '检查中...' });
    setTimeout(() => {
        uni.hideLoading();
        uni.showToast({ title: '当前已是最新版本', icon: 'none' });
    }, 1000);
};

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