<template>
	<view class="profile-page">
		<view class="header-bg">
			<view class="profile-header">
				<view class="avatar-wrapper">
					<image 
						v-if="userInfo.avatarUrl" 
						:src="userInfo.avatarUrl" 
						class="avatar-img" 
						mode="aspectFill" 
					/>
					<view v-else class="avatar">
						<text>{{ userInfo.nickname ? userInfo.nickname.charAt(0) : '未' }}</text>
					</view>
					
					<view class="edit-button" @click="handleMenuClick('profile')">
						<uni-icons type="compose" size="14" color="#666"></uni-icons>
					</view>
				</view>
				<view class="profile-info">
					<text class="profile-name">{{ userInfo.nickname }}</text>
					<text class="profile-meta">学号: {{ userInfo.jobNumber }}</text>
					<text class="profile-meta">{{ userInfo.deptName }}</text>
				</view>
			</view>
		</view>

<view class="stats-card">
        <view class="stat-item">
            <text class="stat-value" style="color: #4C8AF2;">{{ userStats.courseCount }}</text>
            <text class="stat-label">课程数</text>
        </view>
        <view class="stat-item">
            <text class="stat-value" style="color: #2ECC71;">{{ userStats.completedTasks }}</text>
            <text class="stat-label">已完成</text>
        </view>
        <view class="stat-item">
            <text class="stat-value" style="color: #9B59B6;">
                {{ settingsStore.preferences.privacyMode ? '***' : userStats.avgScore }}
            </text>
            <text class="stat-label">平均分</text>
        </view>
    </view>

		<scroll-view scroll-y="true" class="menu-scroll">
			<view class="menu-group">
				<text class="group-title">账户设置</text>
				<view class="menu-list">
					<view
						v-for="item in accountMenu"
						:key="item.id"
						@click="handleMenuClick(item.id)"
						class="menu-item"
					>
						<view class="menu-item-left">
							<view class="menu-icon" :style="{ background: item.color }">
								<uni-icons :type="item.icon" size="20" color="#FFFFFF"></uni-icons>
							</view>
							<text class="menu-label">{{ item.label }}</text>
						</view>
						<uni-icons type="right" size="16" color="#AAAAAA"></uni-icons>
					</view>
				</view>
			</view>

			<view class="menu-group">
				<text class="group-title">学习中心</text>
				<view class="menu-list">
					<view
						v-for="item in learningMenu"
						:key="item.id"
						@click="handleMenuClick(item.id)"
						class="menu-item"
					>
						<view class="menu-item-left">
							<view class="menu-icon" :style="{ background: item.color }">
								<uni-icons :type="item.icon" size="20" color="#FFFFFF"></uni-icons>
							</view>
							<text class="menu-label">{{ item.label }}</text>
						</view>
						<uni-icons type="right" size="16" color="#AAAAAA"></uni-icons>
					</view>
				</view>
			</view>
			
			<view class="menu-group">
				<text class="group-title">其他</text>
				<view class="menu-list">
					<view
						v-for="item in settingsMenu"
						:key="item.id"
						@click="handleMenuClick(item.id)"
						class="menu-item"
					>
						<view class="menu-item-left">
							<view class="menu-icon" :style="{ background: item.color }">
								<uni-icons :type="item.icon" size="20" color="#FFFFFF"></uni-icons>
							</view>
							<text class="menu-label">{{ item.label }}</text>
						</view>
						<uni-icons type="right" size="16" color="#AAAAAA"></uni-icons>
					</view>
				</view>
			</view>

			<view class="button-wrapper">
				<button class="logout-button" @click="handleLogout">
					退出登录
				</button>
			</view>
		</scroll-view>
	</view>
</template>

<script setup>
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';

const settingsStore = useSettingsStore();
const authStore = useAuthStore();
const { userInfo, userStats } = storeToRefs(authStore);

const ensureAuthAndStats = async () => {
  try {
    // 先尝试恢复登录状态（应对刷新后 store 为空的情况）
    if (!authStore.token) {
      await authStore.checkLoginStatus();
    }
    if (!authStore.token) {
      // 未登录或会话失效，返回登录页
      uni.reLaunch({ url: '/pages/index/LoginView' });
      return;
    }
    // 刷新统计数据
    await authStore.fetchGlobalStats();
  } catch (err) {
    console.warn('ProfileView 加载用户数据失败', err);
    uni.showToast({ title: '加载用户信息失败', icon: 'none' });
  }
};

// 每次进入页面时确保登录状态和统计数据最新
onShow(() => {
  ensureAuthAndStats();
});

// 下拉刷新：重新拉取用户信息与统计数据
onPullDownRefresh(async () => {
  await ensureAuthAndStats();
  uni.stopPullDownRefresh();
});

// [修改] 移除 '修改密码'
const accountMenu = [
  { id: 'profile', label: '个人资料', icon: 'person', color: '#4C8AF2' },
  { id: 'settings', label: '系统设置', icon: 'gear', color: '#60A5FA' }
];

const learningMenu = [
  { id: 'my-courses', label: '我的课程', icon: 'pyq', color: '#2ECC71' },
  //{ id: 'my-tasks', label: '我的任务', icon: 'list', color: '#9B59B6' },
  { id: 'achievements', label: '我的成就', icon: 'map-filled', color: '#F39C12' }
  //{ id: 'favorites', label: '我的收藏', icon: 'heart', color: '#E74C3C' }
];

const settingsMenu = [
  { id: 'notifications', label: '消息通知', icon: 'notification', color: '#F97316' },
  { id: 'help', label: '帮助中心', icon: 'help', color: '#06B6D4' },
  { id: 'about', label: '关于我们', icon: 'info', color: '#888888' }
];

const handleMenuClick = (id) => {
  switch (id) {
    case 'profile':
      // 个人资料详情页 (只读)
      uni.navigateTo({ url: '/pages/index/UserProfileView' });
      break;
      
    case 'settings':
      uni.navigateTo({ url: '/pages/index/SettingsView' });
      break;
      
    case 'my-courses':
      uni.switchTab({ url: '/pages/index/CourseListView' });
      break;
      
    case 'my-tasks':
      // [修改] Plan A: 跳转课程列表并提示
      uni.switchTab({ url: '/pages/index/CourseListView' });
      setTimeout(() => {
          uni.showToast({ title: '请进入具体课程查看任务地图', icon: 'none', duration: 2000 });
      }, 300);
      break;
      
    case 'help':
      uni.navigateTo({ url: '/pages/index/HelpView' });
      break;
      
    case 'about':
      uni.navigateTo({ url: '/pages/index/AboutView' });
      break;
      
    // 暂缓的功能
    case 'achievements':
          // [修改] 现在可以跳转了
          uni.navigateTo({ url: '/pages/index/AchievementsView' });
          break;
    //case 'favorites':
    case 'notifications':
      uni.navigateTo({ url: '/pages/index/MessageListView' });
      break;
      
    default:
      break;
  }
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

.profile-page {
	height: 100vh;
	background-color: $bg-color;
	display: flex;
	flex-direction: column;
}

.header-bg {
	background: linear-gradient(135deg, #4C8AF2, #6C5BFF);
	padding: 60rpx 40rpx 140rpx 40rpx;
	border-bottom-left-radius: 40rpx;
	border-bottom-right-radius: 40rpx;
}
.profile-header {
	display: flex;
	align-items: center;
	gap: 30rpx;
}
.avatar-wrapper {
	position: relative;
	flex-shrink: 0;
	.avatar {
		width: 160rpx;
		height: 160rpx;
		background: $card-bg;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4rpx 10rpx rgba(0,0,0,0.1);
		text {
			font-size: 60rpx;
			font-weight: bold;
			color: #4C8AF2; 
		}
	}
    .avatar-img {
        width: 160rpx;
        height: 160rpx;
        border-radius: 50%;
        background: $card-bg;
        box-shadow: 0 4rpx 10rpx rgba(0,0,0,0.1);
    }
	.edit-button {
		position: absolute;
		bottom: 0;
		right: 0;
		width: 50rpx;
		height: 50rpx;
		background: $card-bg;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 2rpx 6rpx rgba(0,0,0,0.2);
	}
}
.profile-info {
	color: white;
	.profile-name {
		font-size: 44rpx;
		font-weight: bold;
		margin-bottom: 12rpx;
        display: block;
	}
	.profile-meta {
		font-size: 26rpx;
		color: #E0E7FF;
		display: block;
        margin-top: 4rpx;
	}
}

.stats-card {
	display: grid;
	grid-template-columns: 1fr 1fr 1fr;
	gap: 20rpx;
	background: $card-bg;
	border-radius: 24rpx;
	padding: 30rpx;
	box-shadow: $shadow;
	margin: -80rpx 30rpx 30rpx 30rpx;
	z-index: 10;
	
	.stat-item {
		text-align: center;
	}
	.stat-value {
		font-size: 48rpx;
		font-weight: bold;
		margin-bottom: 4rpx;
        display: block;
	}
	.stat-label {
		font-size: 24rpx;
		color: $text-light;
	}
}

.menu-scroll {
	flex: 1;
	height: 0;
	padding: 0 30rpx 30rpx 30rpx;
	box-sizing: border-box;
}

.menu-group {
	margin-bottom: 30rpx;
	.group-title {
		font-size: 26rpx;
		color: $text-light;
		font-weight: 500;
		margin-bottom: 16rpx;
		padding: 0 20rpx;
        display: block;
	}
}
.menu-list {
	background: $card-bg;
	border-radius: 24rpx;
	box-shadow: $shadow;
	overflow: hidden;
}
.menu-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 24rpx 30rpx;
	transition: background 0.2s;
	border-bottom: 1rpx solid $border-color;
	&:last-child {
		border-bottom: none;
	}
	&:active {
		background-color: #F0F0F0;
	}
}
.menu-item-left {
	display: flex;
	align-items: center;
	gap: 24rpx;
}
.menu-icon {
	width: 72rpx;
	height: 72rpx;
	border-radius: 16rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}
.menu-label {
	font-size: 30rpx;
	font-weight: 500;
	color: $text-color;
}

.button-wrapper {
	padding-top: 20rpx;
    padding-bottom: 40rpx;
}
.logout-button {
	width: 100%;
	height: 96rpx;
	line-height: 96rpx;
	background: #E74C3C;
	color: white;
	font-size: 30rpx;
	font-weight: 500;
	border-radius: 20rpx;
	box-shadow: 0 8rpx 20rpx rgba(231, 76, 60, 0.3);
	&:active {
		opacity: 0.8;
	}
}
</style>