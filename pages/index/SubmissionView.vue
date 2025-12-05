<template>
	<view class="submission-page">
		<view class="header-sticky">
			<view class="header-content">
				<view class="icon-button" @click="goBack">
					<uni-icons type="left" size="24" color="#555555"></uni-icons>
				</view>
				<text class="header-title">提交作业</text>
				<view class="icon-button"></view>
			</view>
		</view>

		<scroll-view scroll-y="true" class="page-scroll">
			<view class="countdown-card">
				<text class="countdown-label">距离任务完成还剩</text>
				<text class="countdown-timer">{{ countdownTimer }}</text>
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

			<!-- 只在团队任务时显示贡献度分配 -->
			<view class="card-box" v-if="currentTask.storyType !== 1 && teamMembers && teamMembers.length > 0">
				<view class="card-title-row">
					<uni-icons type="staff-filled" size="20" color="#6C5BFF"></uni-icons>
					<text class="card-title">团队成员贡献度</text>
				</view>

				<view class="charts-box">
					<qiun-data-charts 
						type="pie"
						:opts="pieChartOpts"
						:chartData="pieChartData"
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
								<view class="ctrl-btn" @click="updateMemberContribution(member.id, -1, true)">
									<uni-icons type="minus" size="14" color="#555"></uni-icons>
								</view>
								<input 
									class="contribution-input"
									type="number"
									:value="member.contribution || 0"
									@input="(e) => updateMemberContribution(member.id, Number(e.detail?.value || e.target?.value || 0), false)"
									@blur="(e) => updateMemberContribution(member.id, Number(e.detail?.value || e.target?.value || 0), false)"
									min="0"
									max="100"
									step="1"
								/>
								<view class="ctrl-btn" @click="updateMemberContribution(member.id, 1, true)">
									<uni-icons type="plus" size="14" color="#555"></uni-icons>
								</view>
								<text class="percent-text">%</text>
							</view>
						</view>
						
						<view class="progress-track">
							<view 
								class="progress-bar" 
								:style="{ width: (member.contribution || 0) + '%' }"
							></view>
						</view>
					</view>
					
					<!-- 未分配贡献度显示 -->
					<view v-if="unassignedContribution > 0" class="unassigned-row">
						<view class="member-info">
							<view class="avatar-circle unassigned">
								<text>?</text>
							</view>
							<text class="member-name">未分配</text>
						</view>
						<text class="unassigned-text">{{ unassignedContribution }}%</text>
						<view class="progress-track">
							<view 
								class="progress-bar unassigned-bar" 
								:style="{ width: unassignedContribution + '%' }"
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
					{{ isSubmitting ? '提交中...' : '提交作业' }}
				</button>
			</view>
		</scroll-view>
	</view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { onPullDownRefresh } from '@dcloudio/uni-app';
import { useCourseContextStore } from '@/store/courseContextStore';
import { useSubmissionStore } from '@/store/submissionStore';

const contextStore = useCourseContextStore();
const subStore = useSubmissionStore();
import { useAuthStore } from '@/store/authStore';

const authStore = useAuthStore();
const { teamMembers, currentTask } = storeToRefs(contextStore);
const { uploadedFiles, isSubmitting, taskInfo } = storeToRefs(subStore);

// 倒计时相关
const countdownTimer = ref('00 : 00 : 00 : 00');
let countdownInterval = null;

// 计算倒计时
const calculateCountdown = () => {
	if (!currentTask.value?.deadline) {
		countdownTimer.value = '-- : -- : -- : --';
		return;
	}
	
	try {
		const deadline = new Date(currentTask.value.deadline);
		const now = new Date();
		const diff = deadline.getTime() - now.getTime();
		
		if (diff <= 0) {
			countdownTimer.value = '00 : 00 : 00 : 00';
			return;
		}
		
		const days = Math.floor(diff / (1000 * 60 * 60 * 24));
		const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
		const seconds = Math.floor((diff % (1000 * 60)) / 1000);
		
		countdownTimer.value = `${String(days).padStart(2, '0')} : ${String(hours).padStart(2, '0')} : ${String(minutes).padStart(2, '0')} : ${String(seconds).padStart(2, '0')}`;
	} catch (e) {
		console.error('计算倒计时失败:', e);
		countdownTimer.value = '-- : -- : -- : --';
	}
};

const initTeamContribution = () => {
  const storyType = currentTask.value?.storyType;
  // 仅团队任务(2/3)需要初始化贡献度
  if (storyType !== 2 && storyType !== 3) return;
  const members = teamMembers.value || [];
  if (!members.length) return;
  // 无论之前是否有提交记录，每次进入页面都重新平分 100%
  const base = Math.floor(100 / members.length);
  let remainder = 100 - base * members.length;
  members.forEach((member) => {
    member.contribution = base + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder -= 1;
  });
};

onMounted(() => {
    const permission = contextStore.checkSubmissionPermission();
    if (!permission.allowed) {
        uni.showToast({ 
            title: '无权访问: ' + permission.reason, 
            icon: 'none',
            duration: 2000
        });
        setTimeout(() => uni.navigateBack(), 1500);
        return;
    }
    
    // 初始化团队贡献度均分
    initTeamContribution();
    
    // 初始化倒计时
    calculateCountdown();
    // 每秒更新一次倒计时
    countdownInterval = setInterval(calculateCountdown, 1000);
});

// 下拉刷新：重新计算倒计时和贡献度分配
onPullDownRefresh(() => {
  try {
    initTeamContribution();
    calculateCountdown();
  } finally {
    uni.stopPullDownRefresh();
  }
});

// [新增] 页面卸载时，清空已选择的文件，防止带到其他任务
onUnmounted(() => {
    subStore.clearFiles();
    // 清除倒计时定时器
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
});

const totalContribution = computed(() => {
  const total = teamMembers.value.reduce((sum, m) => sum + (m.contribution || 0), 0);
  return total;
});

const unassignedContribution = computed(() => {
  return Math.max(0, 100 - totalContribution.value);
});

// 更新成员贡献度（支持直接输入和增量调整）
const updateMemberContribution = (memberId, value, isIncrement = false) => {
  const member = teamMembers.value.find(m => m.id === memberId);
  if (!member) return;
  
  const current = member.contribution || 0;
  let newValue;
  
  if (isIncrement) {
    // 增量调整（点击加减号时）
    newValue = Math.max(0, Math.min(100, current + value));
  } else {
    // 直接设置值（输入框输入时）
    newValue = Math.max(0, Math.min(100, value));
  }
  
  // 检查总和是否超过100
  const otherTotal = teamMembers.value
    .filter(m => m.id !== memberId)
    .reduce((sum, m) => sum + (m.contribution || 0), 0);
  
  if (otherTotal + newValue > 100) {
    newValue = Math.max(0, 100 - otherTotal);
    if (isIncrement) {
      uni.showToast({ title: '贡献度总和不能超过100%', icon: 'none' });
    }
  }
  
  // 更新store中的贡献度
  contextStore.updateMemberContribution(memberId, newValue - current);
};

// 扇形图（饼图）数据
const pieChartData = computed(() => {
  const series = [];
  const colors = ['#4C8AF2', '#6C5BFF', '#2ECC71', '#F39C12', '#E74C3C', '#9B59B6', '#1ABC9C', '#3498DB'];
  
  // 添加团队成员数据
  teamMembers.value.forEach((member, index) => {
    if (member.contribution > 0) {
      series.push({
        name: member.name,
        value: member.contribution,
        color: colors[index % colors.length]
      });
    }
  });
  
  // 添加未分配部分（灰色）
  if (unassignedContribution.value > 0) {
    series.push({
      name: '未分配',
      value: unassignedContribution.value,
      color: '#95A5A6'
    });
  }
  
  return {
  series: [{
      data: series
  }]
  };
});

const pieChartOpts = computed(() => {
  const colors = pieChartData.value.series[0]?.data.map(item => item.color) || [];
  return {
    color: colors,
    padding: [10, 10, 10, 10],
    dataLabel: true,
    legend: {
      show: true,
      position: 'bottom',
      lineHeight: 25,
      itemGap: 10
    },
  extra: {
      pie: {
        activeOpacity: 0.5,
        activeRadius: 10,
        offsetAngle: 0,
        labelWidth: 15,
        border: true,
        borderWidth: 3,
        borderColor: '#FFFFFF'
    }
  }
  };
});

// [修改] 实现真实文件选择
// 修改 SubmissionView.vue 中的 handleFileSelect

const handleFileSelect = () => {
  // #ifdef H5
  // H5 端继续使用 uni.chooseFile (因为它支持选 PDF/Doc)
  uni.chooseFile({
    count: 1,
    success: (res) => {
      const tempFile = res.tempFiles[0];
      processSelectedFile(tempFile); // 抽离处理逻辑
    },
    fail: (err) => console.log('H5选择失败', err)
  });
  // #endif

  // #ifndef H5
  // 非 H5 端 (App/小程序)
  // 尝试调用 uni.chooseMessageFile (微信小程序) 或 uni.chooseImage (App兜底)
  
  // 微信小程序
  // #ifdef MP-WEIXIN
  uni.chooseMessageFile({
    count: 1,
    type: 'file',
    success: (res) => {
      processSelectedFile(res.tempFiles[0]);
    }
  });
  // #endif

  // App 端 (手机真机)
  // 由于 uni.chooseFile 在部分基座不可用，先用 chooseImage 兜底
  // 如果你需要选 PDF，必须引入插件 (如 LFile)
  // 这里暂时演示用 chooseImage，至少能让你点得动
  // #ifdef APP-PLUS
  uni.chooseImage({
    count: 1,
    sourceType: ['album'], // 从相册选
    success: (res) => {
      // 图片也是文件，构造一个 file 对象
      const tempFile = {
        name: `image_${Date.now()}.jpg`, // 自动生成文件名
        path: res.tempFilePaths[0],
        size: res.tempFiles[0].size
      };
      processSelectedFile(tempFile);
    },
    fail: (err) => {
        // 如果想尝试强行调用 chooseFile (万一基座支持)
        try {
            uni.chooseFile({
                count: 1,
                success: (r) => processSelectedFile(r.tempFiles[0]),
                fail: (e) => uni.showToast({ title: '当前环境不支持选文件', icon: 'none' })
            });
        } catch (e) {
            uni.showToast({ title: '仅支持上传图片', icon: 'none' });
        }
    }
  });
  // #endif
  // #endif
};

// 抽离公共处理逻辑
const processSelectedFile = (tempFile) => {
    if (tempFile) {
        if (taskInfo.value.maxFileSize && tempFile.size > taskInfo.value.maxFileSize * 1024 * 1024) {
            uni.showToast({ title: `文件大小不能超过 ${taskInfo.value.maxFileSize}MB`, icon: 'none' });
            return;
        }
        subStore.addFile({
            name: tempFile.name,
            size: tempFile.size,
            tempFilePath: tempFile.path
        });
    }
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
    // 1. 组装贡献度数据
    let contributions = [];
    
    // 如果是个人任务，默认贡献度100%
    if (currentTask.value.storyType === 1) {
      contributions = [{
        studentId: authStore.userInfo?.id || null,
        student_id: authStore.userInfo?.id || null,
        percent: 1.0 // 个人任务默认100%
      }];
    } else {
      // 团队任务：检查贡献度总和
      const totalContrib = teamMembers.value.reduce((sum, m) => sum + (m.contribution || 0), 0);
      if (totalContrib > 100) {
        uni.showToast({ title: '贡献度总和不能超过100%', icon: 'none' });
        return;
      }
      
      contributions = (teamMembers.value || []).map(member => {
        // 确保传递正确的用户ID
        // member.userId 是用户ID（user.id），member.id 是 course_student.id
        const userId = member.userId || member.id; // 优先使用 userId，如果没有则使用 id（兼容）
        const contributionData = {
          student_id: userId, // 用户ID（必需，用于后端匹配）
          studentId: member.studentId || userId, // 学号或用户ID（兼容字段）
        // 后端需要的是0-1的小数，前端显示的是百分比整数
          percent: (member.contribution || 0) / 100 
        };
        console.log('📤 发送贡献度数据:', {
          memberName: member.name,
          userId: userId,
          memberId: member.id, // course_student.id
          studentId: member.studentId, // 学号
          contribution: member.contribution,
          percent: contributionData.percent
        });
        return contributionData;
      });
    }

    // 2. 执行提交 (store的submitWork会处理上传和接口调用)
    await subStore.submitWork({ contributions });
    
    // 3. 更新本地任务状态为已提交（未点评）
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
	padding-top: var(--status-bar-height);
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
.charts-box { 
	width: 100%; 
	height: 600rpx; 
	margin-bottom: 20rpx; 
	display: flex;
	align-items: center;
	justify-content: center;
}

/* 成员列表 */
.member-list { display: flex; flex-direction: column; gap: 30rpx; }
.member-row { display: flex; flex-direction: column; gap: 16rpx; }
.member-header { display: flex; justify-content: space-between; align-items: center; }
.member-info { display: flex; align-items: center; gap: 16rpx; }
.avatar-circle { width: 60rpx; height: 60rpx; border-radius: 50%; background: linear-gradient(135deg, #4C8AF2, #6C5BFF); color: white; font-size: 24rpx; display: flex; align-items: center; justify-content: center; font-weight: bold; }
.member-name { font-size: 28rpx; font-weight: 500; color: $text-color; }

.contribution-control { display: flex; align-items: center; gap: 12rpx; }
.ctrl-btn { width: 44rpx; height: 44rpx; background: #F0F0F0; border-radius: 8rpx; display: flex; align-items: center; justify-content: center; &:active { background: #E0E0E0; } }
.contribution-input {
  width: 80rpx;
  height: 60rpx;
  font-size: 28rpx;
  font-weight: bold;
  color: $theme-color;
  text-align: center;
  border: 2rpx solid #E0E0E0;
  border-radius: 8rpx;
  background: #FAFAFA;
  &:focus {
    border-color: $theme-color;
    background: #FFFFFF;
  }
}
.percent-text {
  font-size: 24rpx;
  color: $text-light;
  margin-left: -8rpx;
}
.unassigned-row {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  padding: 20rpx;
  background: #FFF9E6;
  border-radius: 16rpx;
  margin-top: 20rpx;
  border: 2rpx dashed #FFD700;
}
.unassigned {
  background: linear-gradient(135deg, #FFD700, #FFA500) !important;
}
.unassigned-text {
  font-size: 28rpx;
  font-weight: bold;
  color: #F39C12;
  text-align: right;
}
.unassigned-bar {
  background: linear-gradient(90deg, #FFD700, #FFA500) !important;
}

.progress-track { height: 12rpx; background: #F0F0F0; border-radius: 6rpx; overflow: hidden; }
.progress-bar { height: 100%; background: linear-gradient(90deg, #4C8AF2, #6C5BFF); border-radius: 6rpx; transition: width 0.3s ease; }

.footer-action { margin-top: 20rpx; }
.submit-button {
	height: 96rpx; line-height: 96rpx; background: $theme-gradient; color: white; font-size: 32rpx; font-weight: bold; border-radius: 24rpx; box-shadow: 0 8rpx 20rpx rgba(76, 138, 242, 0.3);
	&.disabled { background: #CCCCCC; box-shadow: none; color: #EEEEEE; }
}
</style>