<template>
	<view class="submission-page">
		<view class="header-sticky">
			<view class="header-content">
				<view class="icon-button" @click="goBack">
					<uni-icons type="left" size="24" color="#555555"></uni-icons>
				</view>
				<text class="header-title">提交团队作业</text>
				<view class="icon-button"></view>
			</view>
		</view>

		<scroll-view scroll-y="true" class="page-scroll">
			<view class="countdown-card">
				<text class="countdown-label">距离任务完成还剩</text>
				<text class="countdown-timer">{{ taskInfo.deadlineStr }}</text>
				<text class="countdown-unit">天 : 时 : 分 : 秒</text>
			</view>

			<view class="card-box">
				<view class="card-title-row">
					<uni-icons type="cloud-upload-filled" size="20" color="#4C8AF2"></uni-icons>
					<text class="card-title">上传文件</text>
				</view>
				
				<view class="upload-tips">
					<text>单文件大小不超过 <text class="highlight-red">{{ taskInfo.maxFileSize }}MB</text> 且支持 <text class="highlight-bold">{{ taskInfo.allowedTypes.join('/') }}</text> 格式</text>
				</view>

				<view class="upload-area" @click="handleFileSelect">
					<uni-icons type="folder-add" size="48" color="#CCCCCC"></uni-icons>
					<text class="upload-text">点击选择文件上传</text>
					<text class="upload-subtext" v-if="taskInfo.allowedTypes.length">支持 {{ taskInfo.allowedTypes.join(', ') }}</text>
				</view>

				<view v-if="uploadedFiles.length > 0" class="file-list">
					<view v-for="(file, index) in uploadedFiles" :key="index" class="file-item">
						<view class="file-info-left">
							<view class="file-icon">
								<uni-icons type="paperclip" size="20" color="#4C8AF2"></uni-icons>
							</view>
							<view class="file-meta">
								<text class="file-name">{{ file.name }}</text>
								<text class="file-size">{{ formatFileSize(file.size) }}</text>
							</view>
						</view>
						<view class="delete-btn" @click="subStore.removeFile(index)">
							<uni-icons type="trash" size="20" color="#E74C3C"></uni-icons>
						</view>
					</view>
				</view>
			</view>

			<view class="card-box" v-if="teamMembers && teamMembers.length > 0">
				<view class="card-title-row">
					<uni-icons type="staff-filled" size="20" color="#6C5BFF"></uni-icons>
					<text class="card-title">团队成员贡献度</text>
				</view>

				<view class="charts-box">
					<qiun-data-charts 
						type="radar"
						:opts="chartOpts"
						:chartData="radarChartData"
					/>
				</view>

				<view class="member-list">
					<view v-for="member in teamMembers" :key="member.id" class="member-row">
						<view class="member-header">
							<view class="member-info">
								<view class="avatar-circle">
									<text>{{ member.name.charAt(0) }}</text>
								</view>
								<text class="member-name">{{ member.name }}</text>
							</view>
							
							<view class="contribution-control">
								<view class="ctrl-btn" @click="contextStore.updateMemberContribution(member.id, -1)">
									<uni-icons type="minus" size="14" color="#555"></uni-icons>
								</view>
								<text class="score-text">{{ member.contribution }}</text>
								<view class="ctrl-btn" @click="contextStore.updateMemberContribution(member.id, 1)">
									<uni-icons type="plus" size="14" color="#555"></uni-icons>
								</view>
							</view>
						</view>
						
						<view class="progress-track">
							<view 
								class="progress-bar" 
								:style="{ width: (member.contribution / totalContribution * 100) + '%' }"
							></view>
						</view>
					</view>
				</view>
			</view>

			<view class="footer-action">
				<button 
					class="submit-button" 
					:disabled="uploadedFiles.length === 0 || isSubmitting"
					:class="{ disabled: uploadedFiles.length === 0 || isSubmitting }"
					@click="handleSubmit"
				>
					{{ isSubmitting ? '提交中...' : '提交团队作业' }}
				</button>
			</view>
		</scroll-view>
	</view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useCourseContextStore } from '@/store/courseContextStore';
import { useSubmissionStore } from '@/store/submissionStore';

const contextStore = useCourseContextStore();
const subStore = useSubmissionStore();

const { teamMembers, currentTask } = storeToRefs(contextStore);
const { uploadedFiles, isSubmitting, taskInfo } = storeToRefs(subStore);

onMounted(() => {
    const permission = contextStore.checkSubmissionPermission();
    if (!permission.allowed) {
        uni.showToast({ 
            title: '无权访问: ' + permission.reason, 
            icon: 'none',
            duration: 2000
        });
        setTimeout(() => uni.navigateBack(), 1500);
    }
});

// [新增] 页面卸载时，清空已选择的文件，防止带到其他任务
onUnmounted(() => {
    subStore.clearFiles();
});

const totalContribution = computed(() => {
  const total = teamMembers.value.reduce((sum, m) => sum + m.contribution, 0);
  return total === 0 ? 1 : total;
});

const radarChartData = computed(() => ({
  categories: teamMembers.value.map(m => m.name),
  series: [{
    name: "贡献度",
    data: teamMembers.value.map(m => m.contribution)
  }]
}));

const chartOpts = ref({
  color: ["#4C8AF2"],
  padding: [5, 5, 5, 5],
  dataLabel: false,
  legend: { show: false },
  extra: {
    radar: {
      gridType: "circle",
      gridColor: "#EAEAEA",
      max: 100,
      labelColor: "#666666",
      border: true
    }
  }
});

// [修改] 实现真实文件选择
const handleFileSelect = () => {
  uni.chooseFile({
    count: 1, // 暂时只支持单文件上传
    // extension: taskInfo.value.allowedTypes, // H5端不支持此参数，为保证兼容性，暂时注释
    success: (res) => {
      const tempFile = res.tempFiles[0];
      if (tempFile) {
        // 检查文件大小
        if (taskInfo.value.maxFileSize && tempFile.size > taskInfo.value.maxFileSize * 1024 * 1024) {
            uni.showToast({ title: `文件大小不能超过 ${taskInfo.value.maxFileSize}MB`, icon: 'none' });
            return;
        }
        subStore.addFile({
          name: tempFile.name,
          size: tempFile.size,
          tempFilePath: tempFile.path // uni-app 编译时会处理平台差异，H5用path，原生用tempFilePath
        });
      }
    },
    fail: (err) => {
        console.log('选择文件失败', err);
    }
  });
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

// [修改] 提交处理，组装真实数据并调用store
const handleSubmit = async () => {
  try {
    // 1. 组装贡献度数据 (如果是团队任务)
    const contributions = (teamMembers.value || []).map(member => ({
        studentId: member.studentId,
        // 后端需要的是0-1的小数，前端显示的是百分比整数
        percent: member.contribution / 100 
    }));

    // 2. 执行提交 (store的submitWork会处理上传和接口调用)
    await subStore.submitWork({ contributions });
    
    // 3. 更新本地任务状态
    if (currentTask.value && currentTask.value.id) {
        contextStore.updateTaskStatus(currentTask.value.id, 'submitted');
    }

    uni.showToast({ title: '提交成功', icon: 'success' });
    setTimeout(() => uni.navigateBack(), 1500);

  } catch (e) {
    // store中抛出的错误会在这里被捕获
    uni.showToast({ title: e.message || '提交失败', icon: 'none', duration: 2000 });
  }
};

const goBack = () => uni.navigateBack();
</script>

<style lang="scss" scoped>
$bg-color: #F4F7FA;
$card-bg: #FFFFFF;
$text-color: #333333;
$text-light: #888888;
$theme-color: #4C8AF2;
$theme-gradient: linear-gradient(135deg, #4C8AF2, #6C5BFF);
$shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
$border-color: #EAEAEA;

.submission-page {
	display: flex; flex-direction: column; height: 100vh; background-color: $bg-color;
}
.header-sticky {
	position: sticky; top: 0; z-index: 20; background: #FFFFFF; box-shadow: $shadow; padding: 20rpx;
}
.header-content {
	display: flex; align-items: center; justify-content: space-between; height: 88rpx;
}
.icon-button { width: 80rpx; height: 80rpx; display: flex; align-items: center; justify-content: center; }
.header-title { font-size: 34rpx; font-weight: bold; color: $text-color; }

.page-scroll { flex: 1; height: 0; padding: 30rpx; box-sizing: border-box; padding-bottom: 60rpx; }

/* 倒计时 */
.countdown-card {
	background: linear-gradient(135deg, #F97316, #EF4444); border-radius: 24rpx; padding: 40rpx; color: white; text-align: center; box-shadow: 0 10rpx 30rpx rgba(249, 115, 22, 0.3);
}
.countdown-label { font-size: 26rpx; opacity: 0.9; margin-bottom: 10rpx; display: block; }
.countdown-timer { font-size: 52rpx; font-weight: bold; margin: 10rpx 0; font-family: monospace; display: block; }
.countdown-unit { font-size: 24rpx; opacity: 0.8; }

/* 通用卡片 */
.card-box { background: $card-bg; border-radius: 24rpx; padding: 30rpx; box-shadow: $shadow; margin-top: 30rpx; }
.card-title-row { display: flex; align-items: center; gap: 16rpx; margin-bottom: 30rpx; }
.card-title { font-size: 32rpx; font-weight: bold; color: $text-color; }

/* 上传 */
.upload-tips { font-size: 24rpx; color: $text-light; margin-bottom: 20rpx; }
.highlight-red { color: #E74C3C; font-weight: bold; }
.highlight-bold { font-weight: bold; color: $text-color; }

.upload-area {
	background: #FAFAFA; border: 2rpx dashed $border-color; border-radius: 20rpx; padding: 50rpx; display: flex; flex-direction: column; align-items: center; gap: 16rpx; transition: all 0.2s;
	&:active { background: #F0F0F0; border-color: $theme-color; }
}
.upload-text { font-size: 28rpx; color: $text-color; font-weight: 500; }
.upload-subtext { font-size: 24rpx; color: #AAAAAA; }

/* 文件列表 */
.file-list { margin-top: 30rpx; display: flex; flex-direction: column; gap: 20rpx; }
.file-item { display: flex; align-items: center; justify-content: space-between; padding: 20rpx; background: #F5F7FA; border-radius: 16rpx; }
.file-info-left { display: flex; align-items: center; gap: 20rpx; flex: 1; overflow: hidden; }
.file-icon { width: 72rpx; height: 72rpx; background: #EBF0FF; border-radius: 12rpx; display: flex; align-items: center; justify-content: center; }
.file-meta { display: flex; flex-direction: column; }
.file-name { font-size: 28rpx; color: $text-color; margin-bottom: 4rpx; }
.file-size { font-size: 22rpx; color: $text-light; }
.delete-btn { padding: 16rpx; }

/* 图表容器 */
.charts-box { width: 100%; height: 500rpx; margin-bottom: 20rpx; }

/* 成员列表 */
.member-list { display: flex; flex-direction: column; gap: 30rpx; }
.member-row { display: flex; flex-direction: column; gap: 16rpx; }
.member-header { display: flex; justify-content: space-between; align-items: center; }
.member-info { display: flex; align-items: center; gap: 16rpx; }
.avatar-circle { width: 60rpx; height: 60rpx; border-radius: 50%; background: linear-gradient(135deg, #4C8AF2, #6C5BFF); color: white; font-size: 24rpx; display: flex; align-items: center; justify-content: center; font-weight: bold; }
.member-name { font-size: 28rpx; font-weight: 500; color: $text-color; }

.contribution-control { display: flex; align-items: center; gap: 16rpx; }
.ctrl-btn { width: 44rpx; height: 44rpx; background: #F0F0F0; border-radius: 8rpx; display: flex; align-items: center; justify-content: center; &:active { background: #E0E0E0; } }
.score-text { font-size: 28rpx; font-weight: bold; color: $theme-color; width: 50rpx; text-align: center; }

.progress-track { height: 12rpx; background: #F0F0F0; border-radius: 6rpx; overflow: hidden; }
.progress-bar { height: 100%; background: linear-gradient(90deg, #4C8AF2, #6C5BFF); border-radius: 6rpx; transition: width 0.3s ease; }

.footer-action { margin-top: 20rpx; }
.submit-button {
	height: 96rpx; line-height: 96rpx; background: $theme-gradient; color: white; font-size: 32rpx; font-weight: bold; border-radius: 24rpx; box-shadow: 0 8rpx 20rpx rgba(76, 138, 242, 0.3);
	&.disabled { background: #CCCCCC; box-shadow: none; color: #EEEEEE; }
}
</style>