<template>
	<view class="user-profile-page">
		<view class="header-sticky">
			<view class="header-content">
				<view class="icon-button" @click="goBack">
					<uni-icons type="left" size="24" color="#555"></uni-icons>
				</view>
				<text class="header-title">个人资料</text>
				<view class="icon-button"></view>
			</view>
		</view>

		<view class="info-list">
			<view class="info-item">
				<text class="label">头像</text>
				<view class="avatar-box">
					<image 
						v-if="userInfo.avatarUrl" 
						:src="userInfo.avatarUrl" 
						class="avatar-img" 
						mode="aspectFill"
					/>
					<view v-else class="avatar-text">
						{{ userInfo.nickname ? userInfo.nickname.charAt(0) : '未' }}
					</view>
				</view>
			</view>
			
			<view class="info-item">
				<text class="label">昵称</text>
				<text class="value">{{ userInfo.nickname }}</text>
			</view>
			
			<view class="info-item">
				<text class="label">账号</text>
				<text class="value">{{ userInfo.username }}</text>
			</view>
			
			<view class="info-item">
				<text class="label">学号</text>
				<text class="value">{{ jobNumberDisplay }}</text>
			</view>
			
			<view class="info-item">
				<text class="label">手机号</text>
				<text class="value">{{ phoneDisplay }}</text>
			</view>
			
			<view class="info-item">
				<text class="label">邮箱</text>
				<text class="value">{{ emailDisplay }}</text>
			</view>
			
			<view class="info-item">
				<text class="label">所属班级</text>
				<text class="value">{{ userInfo.deptName || '暂无信息' }}</text>
			</view>
			
			<view class="info-item">
				<text class="label">角色</text>
				<text class="value">{{ userInfo.userRole === 1 ? '教师' : '学生' }}</text>
			</view>
		</view>
		
		<view class="tips">
			<text>如需修改个人信息，请联系教务管理员。</text>
		</view>
	</view>
</template>

<script setup>
import { computed } from 'vue';
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/store/authStore';

const authStore = useAuthStore();
const { userInfo } = storeToRefs(authStore);

const jobNumberDisplay = computed(() => userInfo.value.jobNumber || userInfo.value.job_number || '--');
const phoneDisplay = computed(() => userInfo.value.phoneNumber || userInfo.value.phone_number || userInfo.value.mobile || '未提供');
const emailDisplay = computed(() => userInfo.value.email || userInfo.value.mail || '未提供');

const loadProfile = async (showLoading = false) => {
  if (showLoading) {
    uni.showLoading({ title: '加载中...' });
  }
  try {
    await authStore.checkLoginStatus();
  } catch (err) {
    console.warn('刷新个人资料失败', err);
    uni.showToast({ title: '获取资料失败', icon: 'none' });
  } finally {
    if (showLoading) {
      uni.hideLoading();
    }
  }
};

onShow(() => {
  loadProfile();
});

onPullDownRefresh(async () => {
  await loadProfile();
  uni.stopPullDownRefresh();
});

const goBack = () => {
	uni.navigateBack();
};
</script>

<style lang="scss" scoped>
$bg-color: #F4F7FA;
$card-bg: #FFFFFF;
.user-profile-page { height: 100vh; background: $bg-color; }
.header-sticky { background: #fff; padding: 20rpx; padding-top: var(--status-bar-height);}
.header-content { display: flex; justify-content: space-between; align-items: center; height: 88rpx; }
.header-title { font-weight: bold; font-size: 32rpx; }
.icon-button { width: 80rpx; height: 80rpx; display: flex; align-items: center; justify-content: center; }

.info-list { margin-top: 20rpx; background: #fff; }
.info-item {
	display: flex; justify-content: space-between; align-items: center;
	padding: 30rpx; border-bottom: 1rpx solid #eee;
	&:last-child { border-bottom: none; }
}
.label { font-size: 30rpx; color: #333; }
.value { font-size: 30rpx; color: #666; }

.avatar-box {
	width: 100rpx; height: 100rpx;
	.avatar-img { width: 100%; height: 100%; border-radius: 50%; }
	.avatar-text { width: 100%; height: 100%; background: #4C8AF2; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 40rpx; font-weight: bold; }
}

.tips { padding: 30rpx; text-align: center; font-size: 24rpx; color: #999; }
</style>