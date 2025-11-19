<template>
	<view class="excellent-page">
		<view class="header-sticky">
			<view class="header-content">
				<view class="icon-button" @click="goBack">
					<uni-icons type="left" size="22" color="#555555"></uni-icons>
				</view>
				<text class="header-title">优秀作业展示</text>
				<view class="icon-button">
					<uni-icons type="heart" size="22" color="#E74C3C"></uni-icons>
				</view>
			</view>
		</view>

		<scroll-view scroll-y class="page-scroll">
			<view class="task-banner">
				<text class="task-title">T4-1 爱从游（学生移动端）</text>
				<text class="task-desc">教师推荐优秀作业 · 可点赞收藏 · 支持下载附件</text>
			</view>

			<view class="work-card" v-for="work in works" :key="work.id">
				<view class="work-header">
					<view class="author-info">
						<view class="avatar">{{ work.author.charAt(0) }}</view>
						<view>
							<text class="author-name">{{ work.author }}</text>
							<text class="author-meta">{{ work.team }}</text>
						</view>
					</view>
					<view class="score-chip">
						<text>{{ work.score }}分</text>
					</view>
				</view>

				<view class="work-body">
					<text class="work-title">{{ work.title }}</text>
					<text class="work-summary">{{ work.summary }}</text>
				</view>

				<view class="comment-box">
					<text class="comment-label">教师评语</text>
					<text class="comment-text">{{ work.comment }}</text>
				</view>

				<view class="work-footer">
					<view class="attachment" v-for="file in work.attachments" :key="file">
						<uni-icons type="paperclip" size="18" color="#4C8AF2"></uni-icons>
						<text>{{ file }}</text>
					</view>
					<view class="action-buttons">
						<button class="icon-button small" @click="toggleLike(work.id)">
							<uni-icons :type="work.liked ? 'heart-filled' : 'heart'" size="18" :color="work.liked ? '#E74C3C' : '#555'"></uni-icons>
							<text>{{ work.likes }}</text>
						</button>
						<button class="icon-button small" @click="toggleCollect(work.id)">
							<uni-icons :type="work.collected ? 'star-filled' : 'star'" size="18" :color="work.collected ? '#FACC15' : '#555'"></uni-icons>
							<text>{{ work.collected ? '已收藏' : '收藏' }}</text>
						</button>
					</view>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script setup>
import { ref } from 'vue';

const works = ref([
  {
    id: 1,
    title: '多课程导览交互稿',
    summary: '通过卡片式导览设计实现课程概要、进度与热度的统一呈现，搭配学期标签支持快速筛选。',
    author: '张晓雨',
    team: '追梦小队',
    score: 198,
    comment: '清晰突出核心指标，交互逻辑符合工程认证的能力维度拆解，推荐同学参考落地实现。',
    attachments: ['交互稿.fig', '说明文档.pdf'],
    likes: 32,
    liked: false,
    collected: false
  },
  {
    id: 2,
    title: '任务数据可视化方案',
    summary: '构建提交率、讨论热度双指标体系，并提供 AI 答疑入口，支持与优秀作业关联。',
    author: '李晨',
    team: '凌云队',
    score: 194,
    comment: '指标拆解完整，颜色体系突出重要程度，建议按照该方案完善 mobile 端图表。',
    attachments: ['数据设计.xlsx'],
    likes: 26,
    liked: true,
    collected: true
  }
]);

const goBack = () => {
  uni.navigateBack();
};

const toggleLike = (id) => {
  works.value = works.value.map(work => {
    if (work.id === id) {
      const liked = !work.liked;
      return { ...work, liked, likes: liked ? work.likes + 1 : work.likes - 1 };
    }
    return work;
  });
};

const toggleCollect = (id) => {
  works.value = works.value.map(work => work.id === id ? { ...work, collected: !work.collected } : work);
};
</script>

<style lang="scss" scoped>
$bg-color: #F4F7FA;
$card-bg: #FFFFFF;
$text-color: #333333;
$text-light: #888888;
$shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

.excellent-page {
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

.task-banner {
	background: linear-gradient(135deg, #F472B6, #EC4899);
	padding: 40rpx;
	border-radius: 24rpx;
	color: white;
	box-shadow: 0 12rpx 30rpx rgba(236, 72, 153, 0.35);
}
.task-title {
	font-size: 36rpx;
	font-weight: bold;
	display: block;
	margin-bottom: 10rpx;
}
.task-desc {
	font-size: 26rpx;
	color: rgba(255,255,255,0.9);
}

.work-card {
	background: $card-bg;
	border-radius: 24rpx;
	padding: 34rpx;
	box-shadow: $shadow;
	display: flex;
	flex-direction: column;
	gap: 26rpx;
}
.work-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
}
.author-info {
	display: flex;
	align-items: center;
	gap: 18rpx;
}
.avatar {
	width: 80rpx;
	height: 80rpx;
	border-radius: 50%;
	background: linear-gradient(135deg, #4C8AF2, #6C5BFF);
	color: white;
	font-size: 32rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-weight: bold;
}
.author-name {
	font-size: 30rpx;
	font-weight: 600;
	color: $text-color;
	display: block;
}
.author-meta {
	font-size: 24rpx;
	color: $text-light;
}
.score-chip {
	padding: 12rpx 24rpx;
	border-radius: 16rpx;
	background: #EAFBF4;
	color: #2ECC71;
	font-weight: 600;
}

.work-title {
	font-size: 32rpx;
	font-weight: bold;
	margin-bottom: 12rpx;
	color: $text-color;
}
.work-summary {
	font-size: 26rpx;
	color: $text-light;
	line-height: 1.6;
}

.comment-box {
	background: #F9FAFB;
	border-radius: 20rpx;
	padding: 24rpx;
}
.comment-label {
	font-size: 24rpx;
	color: #4C8AF2;
	display: block;
	margin-bottom: 8rpx;
}
.comment-text {
	font-size: 26rpx;
	color: $text-color;
	line-height: 1.5;
}

.work-footer {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}
.attachment {
	display: inline-flex;
	align-items: center;
	gap: 10rpx;
	padding: 10rpx 18rpx;
	background: #EEF2FF;
	color: #4C8AF2;
	border-radius: 12rpx;
	font-size: 24rpx;
	margin-right: 16rpx;
}
.action-buttons {
	display: flex;
	gap: 20rpx;
}
.icon-button.small {
	flex: 1;
	height: 72rpx;
	border-radius: 18rpx;
	background: #FFFFFF;
	border: 1rpx solid #E0E0E0;
	font-size: 26rpx;
	color: $text-color;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 10rpx;
}
</style>

