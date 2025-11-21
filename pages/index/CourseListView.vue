<template>
	<view class="course-list-page">
		<view class="header-sticky">
			<view class="header-content">
				<view class="header-left">
					<view class="logo-bg">
						<uni-icons type="pyq" size="24" color="#FFFFFF"></uni-icons>
					</view>
					<view>
						<text class="header-title">我的课程</text>
						<text class="header-subtitle">{{ courseList.length }} 门课程</text>
					</view>
				</view>
				
				<view class="header-right">
					<view class="icon-button">
						<uni-icons type="notification" size="24" color="#555555"></uni-icons>
						<view class="dot"></view>
					</view>
					<view class="profile-avatar">
						<text class="profile-initial">张</text>
					</view>
				</view>
			</view>
		</view>

		<view class="filter-container">
			<view class="search-bar">
				<uni-icons type="search" size="20" color="#999" class="search-icon"></uni-icons>
				<input
					v-model="searchQuery"
					type="text"
					placeholder="搜索课程名称..."
					class="search-input"
				/>
			</view>
			
			<scroll-view scroll-x="true" class="filter-scroll" :show-scrollbar="false">
				<view
					v-for="filter in filters"
					:key="filter.value"
					@click="activeFilter = filter.value"
					class="filter-tag"
					:class="{ active: activeFilter === filter.value }"
				>
					<text>{{ filter.label }}</text>
				</view>
			</scroll-view>
		</view>

		<view class="course-grid">
			<view
				v-for="course in filteredCourses"
				:key="course.courseId"
				@click="handleEnterCourse(course.courseId)"
				class="course-card"
			>
				<view class="card-image-wrapper">
					<view class="placeholder-img"></view>
					
					<view class="tag-top-left">
						<text class="tag-text">{{ getCourseTypeLabel(course.courseType) }}</text>
					</view>
					
					<view v-if="course.courseType === 3" class="tag-top-right">
						<text class="tag-text" style="background-color: #E74C3C;">必修</text>
					</view>
				</view>

				<view class="card-content">
					<text class="card-title">{{ course.courseName }}</text>
					
					<view class="card-meta">
						<uni-icons type="person" size="14" color="#888"></uni-icons>
						<text class="card-teacher">{{ course.teacher }}</text>
						<text class="card-semester"> · {{ course.semester }}</text>
					</view>

					<view class="card-stats">
						<view class="stat-item">
							<uni-icons type="staff" size="14" color="#888"></uni-icons>
							<text>{{ course.studentCount }}</text>
						</view>
						<view class="stat-item">
							<uni-icons type="list" size="14" color="#888"></uni-icons>
							<text>{{ course.taskCount }}个任务</text>
						</view>
					</view>

					<view class="progress-section">
						<view class="progress-info">
							<text class="progress-label">完成进度</text>
							<text class="progress-value">{{ course.progress }}%</text>
						</view>
						<view class="progress-bar-bg">
							<view
								class="progress-bar-fill"
								:style="{ width: course.progress + '%', background: getProgressColor(course.progress) }"
							></view>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useCourseContextStore } from '@/store/courseContextStore';

const contextStore = useCourseContextStore();
const { courseList } = storeToRefs(contextStore);

const searchQuery = ref('');
const activeFilter = ref(0); // 0=全部

// 对应数据库 course_type 定义
const filters = [
  { value: 0, label: '全部' },
  { value: 1, label: '实训' },
  { value: 2, label: '活动' },
  { value: 3, label: '必修' },
  { value: 4, label: '选修' },
  { value: 5, label: '公共基础' }
];

onMounted(() => {
	contextStore.fetchCourseList();
});

// 辅助函数：类型转文本
const getCourseTypeLabel = (typeId) => {
  const map = { 1: '实训', 2: '活动', 3: '必修', 4: '选修', 5: '公共基础' };
  return map[typeId] || '课程';
};

// 辅助函数：进度颜色
const getProgressColor = (progress) => {
  if (progress >= 80) return '#2ECC71';
  if (progress >= 50) return '#4C8AF2';
  return '#F39C12';
};

// 筛选计算属性
const filteredCourses = computed(() => {
  let res = courseList.value || [];
  
  // 1. 类型筛选
  if (activeFilter.value !== 0) {
    res = res.filter(c => c.courseType === activeFilter.value);
  }
  
  // 2. 搜索筛选
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    res = res.filter(c => c.courseName.toLowerCase().includes(q));
  }
  return res;
});

const handleEnterCourse = (courseId) => {
  console.log('进入课程:', courseId);
  // 1. 初始化上下文
  contextStore.initCourseContext(courseId);
  // 2. 跳转
  uni.navigateTo({ url: '/pages/index/CourseHomeView' });
};
</script>

<style lang="scss" scoped>
/* SCSS 样式定义 */
$bg-color: #F4F7FA;
$card-bg: #FFFFFF;
$text-color: #333333;
$text-light: #888888;
$border-color: #EAEAEA;
$theme-color: #4C8AF2;
$shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

.course-list-page {
	min-height: 100vh;
	background: linear-gradient(180deg, #FFFFFF 0%, $bg-color 30%);
}

.header-sticky {
	position: sticky;
	top: 0;
	z-index: 50;
	background: rgba(255, 255, 255, 0.85);
	backdrop-filter: blur(10px);
	border-bottom: 1rpx solid $border-color;
}
.header-content {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 24rpx 30rpx;
	height: 100rpx;
}
.header-left {
	display: flex;
	align-items: center;
	gap: 24rpx;
	.logo-bg {
		width: 80rpx;
		height: 80rpx;
		background: linear-gradient(135deg, #4C8AF2, #6C5BFF);
		border-radius: 20rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4rpx 10rpx rgba(76, 138, 242, 0.3);
	}
	.header-title {
		font-size: 36rpx;
		font-weight: bold;
		color: $text-color;
		display: block;
	}
	.header-subtitle {
		font-size: 24rpx;
		color: $text-light;
	}
}
.header-right {
	display: flex;
	align-items: center;
	gap: 24rpx;
	.icon-button {
		position: relative;
		width: 70rpx;
		height: 70rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #f0f0f0;
		border-radius: 20rpx;
		.dot {
			position: absolute;
			top: 15rpx;
			right: 15rpx;
			width: 12rpx;
			height: 12rpx;
			background: #E74C3C;
			border-radius: 50%;
		}
	}
	.profile-avatar {
		width: 70rpx;
		height: 70rpx;
		background: linear-gradient(135deg, #4C8AF2, #9B59B6);
		border-radius: 20rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		.profile-initial {
			color: white;
			font-size: 32rpx;
			font-weight: bold;
		}
	}
}

.filter-container {
	padding: 30rpx;
}
.search-bar {
	position: relative;
	margin-bottom: 30rpx;
	.search-icon {
		position: absolute;
		left: 24rpx;
		top: 50%;
		transform: translateY(-50%);
	}
	.search-input {
		width: 100%;
		height: 88rpx;
		padding-left: 72rpx;
		padding-right: 24rpx;
		background: $card-bg;
		border: 1rpx solid $border-color;
		border-radius: 20rpx;
		font-size: 28rpx;
		box-shadow: $shadow;
		box-sizing: border-box;
	}
}
.filter-scroll {
	width: 100%;
	white-space: nowrap;
	.filter-tag {
		display: inline-block;
		padding: 16rpx 28rpx;
		border-radius: 30rpx;
		font-size: 26rpx;
		font-weight: 500;
		margin-right: 20rpx;
		background: $card-bg;
		color: $text-light;
		transition: all 0.2s;
		&.active {
			background: $theme-color;
			color: white;
			box-shadow: 0 4rpx 10rpx rgba(76, 138, 242, 0.3);
		}
	}
}

.course-grid {
	padding: 0 30rpx 30rpx 30rpx;
	display: flex;
	flex-direction: column;
	gap: 30rpx;
}
.course-card {
	background: $card-bg;
	border-radius: 24rpx;
	overflow: hidden;
	box-shadow: $shadow;
	border: 1rpx solid $border-color;
	transition: all 0.2s;
	&:active {
		transform: scale(0.98);
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
	}
}
.card-image-wrapper {
	position: relative;
	height: 300rpx;
	background: #eee;
	.card-image {
		width: 100%;
		height: 100%;
	}
	.placeholder-img {
		width: 100%;
		height: 100%;
		background: #E0E7FF;
	}
	.tag-base {
		position: absolute;
		padding: 8rpx 16rpx;
		border-radius: 20rpx;
		.tag-text {
			font-size: 22rpx;
			font-weight: 500;
			color: white;
		}
	}
	.tag-top-left {
		@extend .tag-base;
		top: 20rpx;
		left: 20rpx;
		background-color: #2ECC71;
	}
	.tag-top-right {
		@extend .tag-base;
		top: 20rpx;
		right: 20rpx;
	}
}
.card-content {
	padding: 30rpx;
}
.card-title {
	font-size: 34rpx;
	font-weight: bold;
	color: $text-color;
	margin-bottom: 10rpx;
	display: block;
	overflow: hidden;
	text-overflow: ellipsis;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
}
.card-meta {
	display: flex;
	align-items: center;
	margin-bottom: 20rpx;
	.card-teacher {
		font-size: 26rpx;
		color: $text-light;
		margin-left: 10rpx;
	}
	.card-semester {
		font-size: 26rpx;
		color: $text-light;
	}
}
.card-stats {
	display: flex;
	align-items: center;
	justify-content: space-between;
	font-size: 26rpx;
	color: $text-light;
	margin-bottom: 24rpx;
	.stat-item {
		display: flex;
		align-items: center;
		gap: 8rpx;
	}
}
.progress-section {
	.progress-info {
		display: flex;
		justify-content: space-between;
		font-size: 24rpx;
		color: $text-light;
		margin-bottom: 8rpx;
		.progress-value {
			font-weight: 500;
			color: $text-color;
		}
	}
	.progress-bar-bg {
		width: 100%;
		height: 16rpx;
		background: #EAEAEA;
		border-radius: 8rpx;
		overflow: hidden;
		.progress-bar-fill {
			height: 100%;
			border-radius: 8rpx;
			transition: all 0.5s;
		}
	}
}
</style>