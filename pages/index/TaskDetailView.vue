<template>
	<view class="task-detail-page">
		<view class="header-sticky">
			<view class="header-content">
				<view class="icon-button" @click="goBack">
					<uni-icons type="left" size="24" color="#555555"></uni-icons>
				</view>
				<text class="header-title">任务详情</text>
				<view class="icon-button">
					<uni-icons type="more-filled" size="24" color="#555555"></uni-icons>
				</view>
			</view>
		</view>

		<scroll-view scroll-y="true" class="page-scroll">
			<!-- 加载中提示 -->
			<view v-if="loading" class="loading-container">
				<text>加载中...</text>
			</view>
			
			<!-- 任务详情内容 -->
			<template v-else>
			<view class="task-header-card">
				<view class="header-top">
					<view class="header-left">
						<text class="task-title">{{ currentTask.storyName }}</text>
						<view class="meta-row">
							<view class="meta-tag">
								<uni-icons type="staff-filled" size="14" color="#FFFFFF"></uni-icons>
								<text>{{ getTaskTypeLabel(currentTask.storyType) }}</text>
							</view>
							<view class="meta-tag">
								<uni-icons type="paperplane-filled" size="14" color="#FFFFFF"></uni-icons>
								<text>{{ currentTask.totalScore }}分</text>
							</view>
						</view>
					</view>
				<view class="header-right">
					<view class="rating-badge" :class="getStatusBadgeClass(currentTask.status)">
						<text>{{ getStatusLabel(currentTask.status) }}</text>
					</view>
				</view>
			</view>
			
			<view class="deadline-card">
				<view class="deadline-item">
					<view class="deadline-label">
						<uni-icons type="calendar" size="16" color="#FFFFFF" style="opacity: 0.9;"></uni-icons>
						<text>截止时间</text>
					</view>
					<text class="deadline-value">{{ formatDeadline(currentTask.deadline) }}</text>
				</view>
				<view class="deadline-item deadline-item-right">
					<view class="deadline-label">
						<uni-icons type="flag" size="16" color="#FFFFFF" style="opacity: 0.9;"></uni-icons>
						<text>任务状态</text>
					</view>
					<text class="deadline-value" :style="{ color: getStatusColor(currentTask.status) }">{{ getStatusLabel(currentTask.status) }}</text>
				</view>
			</view>
			</view>

			<view class="card-box">
				<view class="info-grid">
					<view class="info-item">
						<text class="info-label">任务名称</text>
						<text class="info-value">{{ currentTask.storyName }}</text>
					</view>
					<view class="info-item">
						<text class="info-label">任务类型</text>
						<text class="info-value">{{ getTaskTypeLabel(currentTask.storyType) }}</text>
					</view>
					<view class="info-item">
						<text class="info-label">任务总分</text>
						<text class="info-value">{{ currentTask.totalScore }}</text>
					</view>
					<view class="info-item">
						<text class="info-label">提交限制</text>
						<text class="info-value">1次</text>
					</view>
					<view class="info-item">
						<text class="info-label">是否必做</text>
						<text class="info-value" style="color: #2ECC71;">是</text>
					</view>
					<view class="info-item">
						<text class="info-label">作业性质</text>
						<text class="info-value">任务剧团队内提交</text>
					</view>
					<view class="info-item">
						<text class="info-label">开始时间</text>
						<text class="info-value">未设定</text>
					</view>
					<view class="info-item">
						<text class="info-label">任务解锁</text>
						<text class="info-value">不上锁</text>
					</view>
				</view>
			</view>

			<view class="card-box">
				<view class="card-title-row">
					<uni-icons type="info-filled" size="20" color="#4C8AF2"></uni-icons>
					<text class="card-title">要求事项</text>
				</view>
				<view class="req-list">
					<view class="req-item">
						<view class="req-number"><text>1</text></view>
						<text class="req-text">{{ currentTask.storyDesc }}</text>
					</view>
				</view>
			</view>

			<view class="card-box">
				<view class="card-title-row">
					<uni-icons type="paperclip" size="20" color="#2ECC71"></uni-icons>
					<text class="card-title">任务资料 (1)</text>
				</view>
				<view class="material-list">
					<view class="material-item">
						<view class="material-icon-bg">
							<uni-icons type="download-filled" size="24" color="#4C8AF2"></uni-icons>
						</view>
						<view class="material-info">
							<text class="material-name">项目需求文档.pdf</text>
							<text class="material-size">2.3 MB</text>
						</view>
						<uni-icons type="right" size="16" color="#AAAAAA" class="material-arrow"></uni-icons>
					</view>
				</view>
			</view>

			<view class="button-group">
				<button 
					class="button-primary" 
					:disabled="!permission.allowed" 
					:class="{ disabled: !permission.allowed }"
					@click="openSubmitModal"
				>
					<text>{{ permission.allowed ? '提交作业' : permission.reason }}</text>
				</button>
				
				<button class="button-secondary" @click="goAIHelper">
					<uni-icons type="chatbubble-filled" size="20" color="#FFFFFF"></uni-icons>
					<text>AI 助教答疑</text>
				</button>
				
				<button class="button-outline" @click="goExcellentWorks">
					<uni-icons type="heart" size="20" color="#4C8AF2"></uni-icons>
					<text>查看优秀作业</text>
				</button>
				
				<button class="button-outline" @click="showHistoryModal">
					<uni-icons type="clock" size="20" color="#4C8AF2"></uni-icons>
					<text>历史提交</text>
				</button>
			</view>
			
			<!-- 历史提交悬浮窗 -->
			<view v-if="showHistory" class="history-modal-overlay" @click="closeHistoryModal">
				<view class="history-modal" @click.stop>
					<view class="history-modal-header">
						<text class="history-modal-title">历史提交</text>
						<view class="icon-button" @click="closeHistoryModal">
							<uni-icons type="close" size="24" color="#555555"></uni-icons>
						</view>
					</view>
					
					<scroll-view scroll-y="true" class="history-modal-content">
						<view v-if="historyLoading" class="loading-container">
							<text>加载中...</text>
						</view>
						<view v-else-if="submissionHistory.length === 0" class="empty-state">
							<uni-icons type="inbox" size="48" color="#CCCCCC"></uni-icons>
							<text class="empty-text">暂无提交记录</text>
						</view>
						<view v-else class="history-list">
							<view 
								v-for="(submission, index) in submissionHistory" 
								:key="submission.id || index"
								class="history-item"
							>
								<view class="history-item-header">
									<view class="history-item-left">
										<text class="history-round">第 {{ submission.round }} 次提交</text>
										<text class="history-time">{{ formatTime(submission.create_time) }}</text>
									</view>
									<view class="history-item-right">
										<view v-if="submission.status === 1 || submission.status === '1'" class="status-badge reviewed">
											<text>已点评</text>
										</view>
										<view v-else class="status-badge pending">
											<text>未点评</text>
										</view>
									</view>
								</view>
								
								<view v-if="submission.file_name" class="history-files">
									<view 
										v-for="(fileName, fileIndex) in getFileList(submission.file_name)" 
										:key="fileIndex"
										class="file-item-small"
									>
										<uni-icons type="paperclip" size="16" color="#4C8AF2"></uni-icons>
										<text class="file-name-small">{{ fileName }}</text>
										<text class="file-size-small">{{ getFileSize(submission.file_url, fileIndex) }}</text>
									</view>
								</view>
								
								<view v-if="submission.contribution != null && currentTask.storyType !== 1" class="history-contribution">
									<text class="contribution-label">贡献度：</text>
									<text class="contribution-value">{{ formatContribution(submission.contribution) }}</text>
								</view>
								
								<view v-if="submission.score != null && submission.score > 0" class="history-score">
									<text class="score-label">得分：</text>
									<text class="score-value">{{ submission.score }}分</text>
								</view>
								
								<view v-if="submission.content" class="history-content">
									<text class="content-label">备注：</text>
									<text class="content-text">{{ submission.content }}</text>
								</view>
							</view>
						</view>
					</scroll-view>
				</view>
			</view>
			</template>
		</scroll-view>
	</view>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { onLoad, onShow } from '@dcloudio/uni-app';
import { useCourseContextStore } from '@/store/courseContextStore';
import { useAuthStore } from '@/store/authStore';
import { getMySubmissions } from '@/api/task';

const contextStore = useCourseContextStore();
const authStore = useAuthStore();
const { currentTask, currentCourseId, myTeam, teamMembers } = storeToRefs(contextStore);

// 任务ID（从URL参数获取）
const taskId = ref(null);
const loading = ref(false);

// 历史提交相关
const showHistory = ref(false);
const submissionHistory = ref([]);
const historyLoading = ref(false);

// [新增] 计算权限
const permission = computed(() => {
    return contextStore.checkSubmissionPermission();
});

// [新增] 任务类型标签转换
const getTaskTypeLabel = (type) => {
    const map = { 1: '个人任务', 2: '团队(队长)', 3: '团队(全员)' };
    return map[type] || '普通任务';
};

// 格式化截止时间
const formatDeadline = (deadline) => {
	if (!deadline) return '未设置';
	try {
		const date = new Date(deadline);
		if (isNaN(date.getTime())) return deadline; // 如果无法解析，返回原始值
		
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		const hours = String(date.getHours()).padStart(2, '0');
		const minutes = String(date.getMinutes()).padStart(2, '0');
		return `${year}-${month}-${day} ${hours}:${minutes}`;
	} catch (e) {
		return deadline;
	}
};

// 获取状态标签
const getStatusLabel = (status) => {
	const map = {
		'completed': '已完成',
		'submitted': '已提交',
		'in-progress': '进行中',
		'upcoming': '未开始',
		'overdue': '已逾期'
	};
	return map[status] || '未知';
};

// 获取状态颜色
const getStatusColor = (status) => {
	const map = {
		'completed': '#2ECC71', // 绿色 - 已点评
		'submitted': '#F39C12', // 橙色 - 已提交未点评
		'in-progress': '#4C8AF2', // 蓝色 - 进行中
		'upcoming': '#95A5A6', // 灰色 - 未开始
		'overdue': '#E74C3C' // 红色 - 已逾期
	};
	return map[status] || '#95A5A6';
};

// 获取状态徽章样式类
const getStatusBadgeClass = (status) => {
	const map = {
		'completed': 'badge-completed',
		'submitted': 'badge-submitted',
		'in-progress': 'badge-in-progress',
		'upcoming': 'badge-upcoming',
		'overdue': 'badge-overdue'
	};
	return map[status] || 'badge-default';
};

// 加载任务详情
const loadTaskDetail = async (id) => {
    if (!id) {
        console.warn('⚠️ 任务ID为空');
        return;
    }
    
    loading.value = true;
    try {
        console.log('🔄 开始加载任务详情，任务ID:', id);
        
        // 确保课程上下文已初始化
        if (!currentCourseId.value) {
            const storedCourseId = uni.getStorageSync('currentCourseId');
            if (storedCourseId) {
                console.log('📚 从本地存储恢复课程ID:', storedCourseId);
                await contextStore.initCourseContext(storedCourseId);
            }
        }
        
        // 确保团队信息已加载
        if (currentCourseId.value && (!myTeam.value.id || teamMembers.value.length === 0)) {
            console.log('👥 加载团队信息...');
            await contextStore.fetchTeamInfo(currentCourseId.value);
        }
        
        // 加载任务详情
        await contextStore.selectTask(id);
        console.log('✅ 任务详情加载完成:', contextStore.currentTask);
        
    } catch (error) {
        console.error('❌ 加载任务详情失败:', error);
        uni.showToast({ title: '加载任务详情失败', icon: 'none' });
    } finally {
        loading.value = false;
    }
};

// 页面加载时获取任务ID并加载详情
onLoad((options) => {
    console.log('📄 任务详情页面加载，参数:', options);
    // 尝试从多个可能的参数名获取任务ID
    const id = options.taskId || options.id || options.storyId || options.task_id;
    if (id) {
        taskId.value = Number(id) || id; // 尝试转换为数字，如果失败则使用原始值
        console.log('✅ 从URL参数获取任务ID:', taskId.value);
        loadTaskDetail(taskId.value);
    } else {
        console.warn('⚠️ 未找到任务ID参数，将在 onMounted 中尝试从 currentTask 获取');
        // 不显示错误提示，等待 onMounted 从 currentTask 获取
    }
});

// 页面显示时刷新数据
onShow(() => {
    if (taskId.value) {
        loadTaskDetail(taskId.value);
    }
});

onMounted(() => {
    // 如果 onLoad 没有获取到 taskId，尝试从 currentTask 获取
    if (!taskId.value && currentTask.value?.id) {
        taskId.value = currentTask.value.id;
        console.log('📄 从 currentTask 获取任务ID:', taskId.value);
        // 获取到任务ID后，立即加载任务详情
        loadTaskDetail(taskId.value);
    }
});

const goBack = () => {
	uni.navigateBack();
};

const openSubmitModal = () => {
	// [新增] 再次防守逻辑，防止绕过 UI 禁用点击
	if (!permission.value.allowed) {
		uni.showToast({ title: permission.value.reason, icon: 'none' });
		return;
	}
	
	uni.navigateTo({
		url: '/pages/index/SubmissionView?taskId=T4-1'
	});
};

const goAIHelper = () => {
	uni.navigateTo({
		url: '/pages/index/AITutorView?taskId=T4-1'
	});
};

const goExcellentWorks = () => {
	uni.navigateTo({
		url: '/pages/index/ExcellentWorksView?taskId=T4-1'
	});
};

// 显示历史提交悬浮窗
const showHistoryModal = async () => {
	showHistory.value = true;
	await loadSubmissionHistory();
};

// 关闭历史提交悬浮窗
const closeHistoryModal = () => {
	showHistory.value = false;
};

// 加载历史提交记录
const loadSubmissionHistory = async () => {
	if (!currentTask.value?.id) {
		console.warn('⚠️ 任务ID为空，无法加载历史提交');
		return;
	}
	
	historyLoading.value = true;
	try {
		const data = await getMySubmissions(currentTask.value.id);
		submissionHistory.value = (data?.submissions || []).map(sub => {
			// 处理 status 字段：如果是 Buffer 对象，转换为数字；如果是数字或字符串，也转换为数字
			let statusValue = null;
			if (sub.status != null) {
				if (sub.status.type === 'Buffer' && Array.isArray(sub.status.data)) {
					// Buffer 对象：取第一个字节
					statusValue = sub.status.data[0] || 0;
				} else {
					// 数字或字符串：转换为数字
					statusValue = Number(sub.status);
					if (isNaN(statusValue)) statusValue = null;
				}
			}
			
			return {
				id: sub.id,
				round: sub.round || 0,
				file_name: sub.file_name || '',
				file_url: sub.file_url || '',
				contribution: sub.contribution != null ? Number(sub.contribution) : null,
				score: sub.score != null ? Number(sub.score) : null,
				status: statusValue,
				content: sub.content || '',
				create_time: sub.create_time,
				submit_name: sub.submit_name || ''
			};
		});
		console.log('✅ 历史提交记录加载完成:', submissionHistory.value);
	} catch (error) {
		console.error('❌ 加载历史提交失败:', error);
		uni.showToast({ title: '加载历史提交失败', icon: 'none' });
	} finally {
		historyLoading.value = false;
	}
};

// 格式化时间
const formatTime = (timeStr) => {
	if (!timeStr) return '';
	const date = new Date(timeStr);
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	const hours = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');
	return `${year}-${month}-${day} ${hours}:${minutes}`;
};

// 解析文件名列表（多个文件用 | 分隔）
const getFileList = (fileNames) => {
	if (!fileNames) return [];
	return fileNames.split('|').filter(name => name.trim());
};

// 获取文件大小（从URL推断，或显示默认值）
const getFileSize = (fileUrls, index) => {
	if (!fileUrls) return '';
	const urls = fileUrls.split('|');
	// 这里无法直接获取文件大小，可以尝试从文件名推断或显示默认值
	// 实际项目中可以通过HEAD请求获取文件大小，这里简化处理
	return '--';
};

// 格式化贡献度（0-1的小数转为百分比）
const formatContribution = (contribution) => {
	if (contribution == null) return '--';
	const percent = contribution >= 1 ? contribution : contribution * 100;
	return `${Math.round(percent)}%`;
};
</script>

<style lang="scss" scoped>
$bg-color: #F4F7FA;
$card-bg: #FFFFFF;
$text-color: #333333;
$text-light: #888888;
$border-color: #EAEAEA;
$shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

.task-detail-page {
	display: flex;
	flex-direction: column;
	height: 100vh;
	background-color: $bg-color;
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
	padding: 0 16rpx;
	height: 88rpx;
}
.icon-button {
	width: 80rpx;
	height: 80rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}
.header-title {
	font-size: 32rpx;
	font-weight: bold;
	color: $text-color;
}

.page-scroll {
	flex: 1;
	height: 0;
	padding: 30rpx;
	box-sizing: border-box;
}

.task-header-card {
	background: linear-gradient(135deg, #4C8AF2, #6C5BFF);
	border-radius: 24rpx;
	padding: 40rpx;
	color: white;
	box-shadow: 0 10rpx 30rpx rgba(76, 138, 242, 0.3);
	margin-bottom: 30rpx;

	.header-top {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 30rpx;
	}
	.header-left {
		flex: 1;
	}
	.task-title {
		font-size: 40rpx;
		font-weight: bold;
		line-height: 1.4;
		margin-bottom: 20rpx;
	}
	.meta-row {
		display: flex;
		gap: 24rpx;
	}
	.meta-tag {
		display: flex;
		align-items: center;
		gap: 8rpx;
		font-size: 24rpx;
		color: #E0E7FF;
	}
	.header-right {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		flex-shrink: 0;
		margin-left: 20rpx;
	}
	.rating-badge {
		background: rgba(255, 255, 255, 0.2);
		backdrop-filter: blur(10px);
		border-radius: 12rpx;
		padding: 10rpx 16rpx;
		font-size: 24rpx;
		font-weight: 500;
		margin-bottom: 10rpx;
	}
	.meta-text {
		font-size: 24rpx;
		color: #E0E7FF;
	}
	
	.deadline-card {
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10px);
		border-radius: 16rpx;
		padding: 30rpx;
		display: flex;
		justify-content: space-between;
		gap: 20rpx;
	}
	.deadline-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 8rpx;
	}
	.deadline-item:first-child {
		border-right: 1rpx solid rgba(255, 255, 255, 0.2);
		padding-right: 20rpx;
	}
	.deadline-item-right {
		text-align: right;
		align-items: flex-end;
		padding-left: 20rpx;
	}
	.deadline-label {
		font-size: 22rpx;
		color: #E0E7FF;
		opacity: 0.8;
		display: flex;
		align-items: center;
		gap: 8rpx;
	}
	.deadline-item-right .deadline-label {
		justify-content: flex-end;
	}
	.deadline-value {
		font-size: 26rpx;
		font-weight: 600;
		line-height: 1.3;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.rating-badge {
		background: rgba(255, 255, 255, 0.2);
		backdrop-filter: blur(10px);
		border-radius: 12rpx;
		padding: 10rpx 16rpx;
		font-size: 24rpx;
		font-weight: 500;
		margin-bottom: 10rpx;
		
		&.badge-completed {
			background: rgba(46, 204, 113, 0.3); // 绿色 - 已完成
		}
		&.badge-submitted {
			background: rgba(243, 156, 18, 0.3); // 橙色 - 已提交
		}
		&.badge-in-progress {
			background: rgba(76, 138, 242, 0.3); // 蓝色 - 进行中
		}
		&.badge-upcoming {
			background: rgba(149, 165, 166, 0.3); // 灰色 - 未开始
		}
		&.badge-overdue {
			background: rgba(231, 76, 60, 0.3); // 红色 - 已逾期
		}
	}
}

.card-box {
	background: $card-bg;
	border-radius: 24rpx;
	box-shadow: $shadow;
	padding: 40rpx;
	margin-bottom: 30rpx;
}

.info-grid {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 30rpx;
}
.info-item {
	.info-label {
		font-size: 26rpx;
		color: $text-light;
		margin-bottom: 8rpx;
		display: block;
	}
	.info-value {
		font-size: 28rpx;
		font-weight: 500;
		color: $text-color;
	}
}

.card-title-row {
	display: flex;
	align-items: center;
	gap: 16rpx;
	margin-bottom: 30rpx;
	.card-title {
		font-size: 32rpx;
		font-weight: bold;
		color: $text-color;
	}
}

.req-list {
	display: flex;
	flex-direction: column;
	gap: 30rpx;
}
.req-item {
	display: flex;
	align-items: flex-start;
	gap: 20rpx;
	.req-number {
		flex-shrink: 0;
		width: 44rpx;
		height: 44rpx;
		background: #EBF0F6;
		color: #4C8AF2;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 22rpx;
		font-weight: bold;
	}
	.req-text {
		font-size: 26rpx;
		color: $text-color;
		line-height: 1.6;
	}
}

.material-list {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}
.material-item {
	display: flex;
	align-items: center;
	padding: 24rpx;
	background: $bg-color;
	border-radius: 16rpx;
	transition: background 0.2s;
	&:active {
		background: #E0E0E0;
	}
	
	.material-icon-bg {
		width: 80rpx;
		height: 80rpx;
		background: #EBF0F6;
		border-radius: 16rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 24rpx;
	}
	.material-info {
		flex: 1;
	}
	.material-name {
		font-size: 28rpx;
		font-weight: 500;
		color: $text-color;
		display: block;
	}
	.material-size {
		font-size: 24rpx;
		color: $text-light;
		margin-top: 4rpx;
	}
	.material-arrow {
		flex-shrink: 0;
	}
}

.button-group {
	display: flex;
	flex-direction: column;
	gap: 24rpx;
	
	.button-primary, .button-secondary, .button-outline {
		width: 100%;
		height: 96rpx;
		border-radius: 20rpx;
		font-size: 30rpx;
		font-weight: 600;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 16rpx;
		transition: opacity 0.2s;
		&:active {
			opacity: 0.8;
		}
	}
	
	.button-primary {
		background: linear-gradient(135deg, #4C8AF2, #6C5BFF);
		color: white;
		box-shadow: 0 8rpx 20rpx rgba(76, 138, 242, 0.3);
	}
	
	/* [新增] 禁用状态样式 */
	.button-primary.disabled {
		background: #E0E0E0;
		color: #999;
		box-shadow: none;
	}
	
	.button-secondary {
		background: linear-gradient(135deg, #A855F7, #EC4899);
		color: white;
		box-shadow: 0 8rpx 20rpx rgba(168, 85, 247, 0.3);
	}

	.button-outline {
		border: 2rpx solid #4C8AF2;
		color: #4C8AF2;
		background: transparent;
	}
}

.loading-container {
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 100rpx 0;
	font-size: 28rpx;
	color: $text-light;
}

/* 历史提交悬浮窗 */
.history-modal-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
	z-index: 1000;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 40rpx;
}

.history-modal {
	background: #FFFFFF;
	border-radius: 24rpx;
	width: 100%;
	max-width: 700rpx;
	max-height: 80vh;
	display: flex;
	flex-direction: column;
	box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.3);
}

.history-modal-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 30rpx 40rpx;
	border-bottom: 2rpx solid $border-color;
}

.history-modal-title {
	font-size: 36rpx;
	font-weight: bold;
	color: $text-color;
}

.history-modal-content {
	flex: 1;
	height: 0;
	padding: 30rpx 40rpx;
}

.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 100rpx 0;
	gap: 20rpx;
}

.empty-text {
	font-size: 28rpx;
	color: $text-light;
}

.history-list {
	display: flex;
	flex-direction: column;
	gap: 30rpx;
}

.history-item {
	padding: 24rpx;
	background: #F8F9FA;
	border-radius: 16rpx;
	border-left: 4rpx solid #4C8AF2;
	box-sizing: border-box;
	width: 100%;
	overflow: hidden;
}

.history-item-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: 20rpx;
}

.history-item-left {
	display: flex;
	flex-direction: column;
	gap: 8rpx;
}

.history-round {
	font-size: 30rpx;
	font-weight: bold;
	color: $text-color;
}

.history-time {
	font-size: 24rpx;
	color: $text-light;
}

.history-item-right {
	display: flex;
	align-items: center;
}

.status-badge {
	padding: 8rpx 16rpx;
	border-radius: 8rpx;
	font-size: 22rpx;
	&.reviewed {
		background: #E8F5E9;
		color: #2ECC71;
	}
	&.pending {
		background: #FFF3E0;
		color: #F39C12;
	}
}

.history-files {
	display: flex;
	flex-direction: column;
	gap: 12rpx;
	margin-bottom: 16rpx;
}

.file-item-small {
	display: flex;
	align-items: center;
	gap: 12rpx;
	padding: 12rpx;
	background: #FFFFFF;
	border-radius: 8rpx;
}

.file-name-small {
	font-size: 26rpx;
	color: $text-color;
	flex: 1;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.file-size-small {
	font-size: 22rpx;
	color: $text-light;
}

.history-contribution,
.history-score,
.history-content {
	display: flex;
	align-items: flex-start;
	gap: 12rpx;
	margin-top: 16rpx;
	font-size: 26rpx;
}

.contribution-label,
.score-label,
.content-label {
	color: $text-light;
	flex-shrink: 0;
}

.contribution-value {
	color: #4C8AF2;
	font-weight: 600;
}

.score-value {
	color: #2ECC71;
	font-weight: 600;
}

.content-text {
	color: $text-color;
	flex: 1;
	word-break: break-word;
	overflow-wrap: break-word;
	flex: 1;
	line-height: 1.6;
}
</style>