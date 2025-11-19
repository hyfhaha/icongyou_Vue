<template>
	<view class="course-list-page">
		<!-- 头部 -->
		<view class="header-sticky">
			<view class="header-content">
				<view class="header-left">
					<view class="logo-bg">
						<!-- 
							注意: SVG 已替换为 uni-icons
							您需要在 HBuilderX 中通过 DCloud 插件市场安装 uni-icons
						-->
						<uni-icons type="pyq" size="24" color="#FFFFFF"></uni-icons>
					</view>
					<view>
						<text class="header-title">我的课程</text>
						<text class="header-subtitle">{{ courses.length }} 门课程</text>
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

		<!-- 筛选 -->
		<view class="filter-container">
			<!-- 搜索框 -->
			<view class="search-bar">
				<uni-icons type="search" size="20" color="#999" class="search-icon"></uni-icons>
				<input
					v-model="searchQuery"
					type="text"
					placeholder="搜索课程名称..."
					class="search-input"
				/>
			</view>
			
			<!-- 学期滚动筛选 -->
			<scroll-view scroll-x="true" class="filter-scroll" :show-scrollbar="false">
				<view
					v-for="filter in filters"
					:key="filter.id"
					@click="activeFilter = filter.id"
					class="filter-tag"
					:class="{ active: activeFilter === filter.id }"
				>
					<text>{{ filter.label }}</text>
				</view>
			</scroll-view>
		</view>

		<!-- 课程网格 -->
		<view class="course-grid">
			<view
				v-for="course in filteredCourses"
				:key="course.id"
				@click="goToCourse(course.id)"
				class="course-card"
			>
				<!-- 课程封面 -->
				<view class="card-image-wrapper">
					<image
						:src="course.cover"
						:alt="course.name"
						class="card-image"
						mode="aspectFill"
					/>
					<view class="tag-top-left">
						<text class="tag-text" :style="{ backgroundColor: course.type === '实训课程' ? '#2ECC71' : '#3498DB' }">
							{{ course.type }}
						</text>
					</view>
					<view v-if="course.isRequired" class="tag-top-right">
						<text class="tag-text" style="background-color: #E74C3C;">
							必修
						</text>
					</view>
				</view>

				<!-- 课程信息 -->
				<view class="card-content">
					<text class="card-title">{{ course.name }}</text>
					
					<view class="card-meta">
						<uni-icons type="person" size="14" color="#888"></uni-icons>
						<text class="card-teacher">{{ course.teacher }}</text>
					</view>

					<!-- 统计 -->
					<view class="card-stats">
						<view class="stat-item">
							<uni-icons type="staff" size="14" color="#888"></uni-icons>
							<text>{{ course.students }}</text>
						</view>
						<view class="stat-item">
							<uni-icons type="list" size="14" color="#888"></uni-icons>
							<text>{{ course.tasks }}个任务</text>
						</view>
					</view>

					<!-- 进度条 -->
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
import { ref, computed } from 'vue';

const activeFilter = ref('all');
const searchQuery = ref('');

const filters = [
  { id: 'all', label: '全部' },
  { id: '2025-1', label: '2025春季' },
  { id: '2024-2', label: '2024秋季' },
  { id: 'required', label: '必修课' }
];

const courses = ref([
  {
    id: 1,
    name: '软件产品构建实训（2025）',
    teacher: '张老师',
    cover: 'https://placehold.co/600x300/4C8AF2/FFFFFF?text=课程封面',
    type: '实训课程',
    isRequired: true,
    students: 32,
    tasks: 14,
    progress: 45,
    semester: '2025-1'
  },
  {
    id: 2,
    name: '软件项目管理 2025',
    teacher: '李老师',
    cover: 'https://placehold.co/600x300/2ECC71/FFFFFF?text=课程封面',
    type: '实训课程',
    isRequired: true,
    students: 32,
    tasks: 24,
    progress: 68,
    semester: '2025-1'
  },
  {
    id: 4,
    name: '嵌入式软件开发技术',
    teacher: '赵老师',
    cover: 'https://placehold.co/600x300/E74C3C/FFFFFF?text=课程封面',
    type: '理论课程',
    isRequired: true,
    students: 32,
    tasks: 17,
    progress: 85,
    semester: '2024-2'
  }
]);

const filteredCourses = computed(() => {
  let filtered = courses.value;
  if (activeFilter.value !== 'all') {
    filtered = filtered.filter(c => c.semester === activeFilter.value || (activeFilter.value === 'required' && c.isRequired));
  }
  if (searchQuery.value) {
    filtered = filtered.filter(c => c.name.toLowerCase().includes(searchQuery.value.toLowerCase()));
  }
  return filtered;
});

const getProgressColor = (progress) => {
  if (progress >= 80) return '#2ECC71'; // 绿色
  if (progress >= 50) return '#4C8AF2'; // 主题蓝
  return '#F39C12'; // 黄色
};

const goToCourse = (courseId) => {
  console.log('Navigate to course:', courseId);
  uni.navigateTo({
    url: `/pages/index/CourseHomeView?courseId=${courseId}`
  });
};
</script>

<style lang="scss" scoped>
// 假设 $theme-color: #4C8AF2; 定义在 uni.scss [cite: css_placement_guide.md]
$bg-color: #F4F7FA;
$card-bg: #FFFFFF;
$text-color: #333333;
$text-light: #888888;
$border-color: #EAEAEA;
$shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

.course-list-page {
	min-height: 100vh;
	background: linear-gradient(180deg, #FFFFFF 0%, $bg-color 30%);
}

/* 头部 */
.header-sticky {
	position: sticky;
	top: 0;
	z-index: 50;
	background: rgba(255, 255, 255, 0.85); // 玻璃拟态
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

/* 筛选 */
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
			background: #4C8AF2; // $theme-color
			color: white;
			box-shadow: 0 4rpx 10rpx rgba(76, 138, 242, 0.3);
		}
	}
}

/* 课程网格 */
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
	.card-image {
		width: 100%;
		height: 100%;
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
	// line-clamp
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