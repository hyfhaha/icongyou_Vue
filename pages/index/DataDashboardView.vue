<template>
	<view class="data-dashboard-page">
		<view class="header-sticky">
			<view class="header-content">
				<view class="icon-button" @click="goBack">
					<uni-icons type="left" size="24" color="#555555"></uni-icons>
				</view>
				<view class="tab-control">
					<view class="tab-item" :class="{ active: activeTab === 'personal' }" @click="activeTab = 'personal'">个人数据</view>
					<view class="tab-item" :class="{ active: activeTab === 'team' }" @click="activeTab = 'team'">团队数据</view>
				</view>
				<view class="icon-button"></view>
			</view>
		</view>

		<scroll-view scroll-y="true" class="page-scroll">
			
			<view v-if="activeTab === 'personal'" class="tab-content fade-in">
				<view class="summary-card">
					<view class="score-block">
						<text class="block-label">课程总得分</text>
						<text class="block-value">{{ personalData.totalScore }}</text>
						<text class="block-sub">班级均分 {{ personalData.avgScore }}</text>
					</view>
					<view class="divider"></view>
					<view class="rank-block">
						<text class="block-label">当前排名</text>
						<text class="block-value highlight">#{{ personalData.rank }}</text>
						<text class="block-sub">Top {{ personalData.rankPercent }}%</text>
					</view>
				</view>

				<view class="card-box">
					<view class="card-title-row">
						<uni-icons type="pyq" size="20" color="#4C8AF2"></uni-icons>
						<text class="card-title">工程认证能力维度达成度</text>
					</view>
					<view class="dimension-list">
						<view v-for="dim in abilityDimensions" :key="dim.id" class="dimension-item">
							<view class="dim-header">
								<text class="dim-name">{{ dim.label }}</text>
								<text class="dim-val">{{ dim.value }}%</text>
							</view>
							<view class="progress-bg">
								<view class="progress-fill" :style="{ width: dim.value + '%', background: dim.color }"></view>
							</view>
						</view>
					</view>
				</view>
			</view>

			<view v-if="activeTab === 'team'" class="tab-content fade-in">
				<view class="team-header-card">
					<view class="team-top">
						<text class="team-name">追梦小队</text>
						<view class="team-score-badge">
							<text>总分 85</text>
						</view>
					</view>
					<view class="team-stats-row">
						<view class="t-stat"><text class="ts-val">{{ teamMembers.length }}</text><text class="ts-lbl">成员</text></view>
						<view class="t-stat"><text class="ts-val">#3</text><text class="ts-lbl">排名</text></view>
						<view class="t-stat"><text class="ts-val">12</text><text class="ts-lbl">完成任务</text></view>
					</view>
				</view>

				<view class="card-box">
					<view class="card-title-row">
						<uni-icons type="staff-filled" size="20" color="#6C5BFF"></uni-icons>
						<text class="card-title">团队成员与贡献</text>
					</view>
					<view class="member-list">
						<view v-for="m in teamMembers" :key="m.id" class="member-item">
							<view class="m-avatar" :class="{ leader: m.isLeader }">
								<text>{{ m.name.charAt(0) }}</text>
							</view>
							<view class="m-info">
								<text class="m-name">{{ m.name }} <text v-if="m.isLeader" class="leader-tag">队长</text></text>
								<text class="m-id">{{ m.studentId }}</text>
							</view>
							<view class="m-contribution">
								<text class="c-val">{{ m.contribution }}%</text>
								<text class="c-lbl">贡献度</text>
							</view>
						</view>
					</view>
				</view>
			</view>
			
		</scroll-view>
	</view>
</template>

<script setup>
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
// [关键] 引入 userStore，注意路径是 store
import { useUserStore } from '@/store/userStore';

const activeTab = ref('personal');

// 初始化 Store
const userStore = useUserStore();

// [关键] 使用 storeToRefs 解构数据，保持响应式
const { personalData, abilityDimensions, teamMembers } = storeToRefs(userStore);

const goBack = () => {
	uni.navigateBack();
};
</script>

<style lang="scss" scoped>
$bg-color: #F4F7FA;
$card-bg: #FFFFFF;
$text-color: #333333;
$theme-color: #4C8AF2;

.data-dashboard-page {
	height: 100vh; display: flex; flex-direction: column; background: $bg-color;
}

.header-sticky {
	background: #fff; padding: 0 24rpx; height: 88rpx; display: flex; align-items: center;
	position: sticky; top: 0; z-index: 50; box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.05);
}
.header-content { width: 100%; display: flex; justify-content: space-between; align-items: center; }
.icon-button { width: 80rpx; height: 80rpx; display: flex; align-items: center; justify-content: center; }

.tab-control {
	display: flex; background: #F5F5F5; border-radius: 32rpx; padding: 6rpx;
}
.tab-item {
	padding: 10rpx 30rpx; border-radius: 28rpx; font-size: 26rpx; color: #666;
	transition: all 0.2s;
	&.active { background: #fff; color: $theme-color; font-weight: bold; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1); }
}

.page-scroll { flex: 1; padding: 30rpx; box-sizing: border-box; }
.fade-in { animation: fadeIn 0.3s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10rpx); } to { opacity: 1; transform: translateY(0); } }

/* 个人数据样式 */
.summary-card {
	background: linear-gradient(135deg, #4C8AF2, #6C5BFF); border-radius: 24rpx; padding: 40rpx;
	color: white; display: flex; justify-content: space-between; margin-bottom: 30rpx;
	box-shadow: 0 10rpx 30rpx rgba(76, 138, 242, 0.3);
}
.score-block, .rank-block { flex: 1; display: flex; flex-direction: column; align-items: center; }
.divider { width: 1rpx; background: rgba(255,255,255,0.3); }
.block-value { font-size: 56rpx; font-weight: bold; margin: 10rpx 0; }
.block-value.highlight { color: #F9D423; }
.block-sub { font-size: 22rpx; opacity: 0.8; }

/* 维度进度条 */
.dimension-list { display: flex; flex-direction: column; gap: 24rpx; }
.dim-header { display: flex; justify-content: space-between; margin-bottom: 8rpx; font-size: 26rpx; }
.progress-bg { height: 16rpx; background: #F0F0F0; border-radius: 8rpx; overflow: hidden; }
.progress-fill { height: 100%; border-radius: 8rpx; transition: width 0.5s ease; }

/* 团队数据样式 */
.team-header-card {
	background: linear-gradient(135deg, #8B5CF6, #6366F1); border-radius: 24rpx; padding: 40rpx;
	color: white; margin-bottom: 30rpx;
	box-shadow: 0 10rpx 30rpx rgba(139, 92, 246, 0.3);
}
.team-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30rpx; }
.team-name { font-size: 40rpx; font-weight: bold; }
.team-score-badge { background: rgba(255,255,255,0.2); padding: 8rpx 20rpx; border-radius: 20rpx; font-size: 24rpx; font-weight: bold; }
.team-stats-row { display: flex; justify-content: space-around; }
.t-stat { display: flex; flex-direction: column; align-items: center; }
.ts-val { font-size: 36rpx; font-weight: bold; }
.ts-lbl { font-size: 22rpx; opacity: 0.8; }

/* 成员列表 */
.member-item {
	display: flex; align-items: center; padding: 20rpx 0; border-bottom: 1rpx solid #F0F0F0;
}
.m-avatar {
	width: 80rpx; height: 80rpx; background: #E0E7FF; color: $theme-color; border-radius: 50%;
	display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 20rpx;
	&.leader { background: linear-gradient(135deg, #F9D423, #F97316); color: white; }
}
.m-info { flex: 1; }
.m-name { font-size: 28rpx; font-weight: 500; }
.leader-tag { font-size: 20rpx; background: #FEF3C7; color: #D97706; padding: 2rpx 8rpx; border-radius: 4rpx; margin-left: 8rpx; }
.m-id { font-size: 22rpx; color: #888; display: block; }
.m-contribution { text-align: right; }
.c-val { font-size: 30rpx; font-weight: bold; color: $theme-color; }
.c-lbl { font-size: 20rpx; color: #888; display: block; }

.card-box { background: #fff; border-radius: 24rpx; padding: 30rpx; margin-bottom: 30rpx; box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05); }
.card-title-row { display: flex; gap: 16rpx; margin-bottom: 20rpx; align-items: center; }
.card-title { font-size: 32rpx; font-weight: bold; color: $text-color; }
</style>