<template>
	<view class="check-page">
		<view class="header">
			<text class="title">前后端连通性自检</text>
			<text class="subtitle">用于快速排查网络、API、鉴权问题</text>
		</view>

		<!-- Auto Test Section -->
		<view class="card-box">
			<text class="section-title">自动全流程检测</text>
			<view class="input-section">
				<input class="input-field" v-model="testCredentials.username" placeholder="请输入测试用户名" />
				<input class="input-field" v-model="testCredentials.password" type="password" placeholder="请输入测试密码" />
			</view>
			<button class="check-button" @click="runAllTests" :loading="loading">
				{{ loading ? '正在检测...' : '1. 开始自动检测' }}
			</button>
		</view>

		<!-- Manual Token Test Section -->
		<view class="card-box">
			<text class="section-title">手动 Token 测试</text>
			<view class="input-section">
				<textarea class="textarea-field" v-model="manualToken" placeholder="如果自动登录失败，请从后端获取一个有效Token并粘贴于此"></textarea>
			</view>
			<button class="check-button manual" @click="runManualTokenTest" :loading="manualLoading">
				{{ manualLoading ? '正在测试...' : '2. 使用此Token测试课程接口' }}
			</button>
		</view>

		<view class="results-container" v-if="testResults.length > 0">
			<view v-for="(result, index) in testResults" :key="index" class="result-item">
				<view class="result-status" :class="result.status">
					<uni-icons :type="getIcon(result.status)" size="18" color="#FFFFFF"></uni-icons>
				</view>
				<view class="result-info">
					<text class="result-label">{{ result.label }}</text>
					<text class="result-message">{{ result.message }}</text>
				</view>
			</view>
		</view>
		
		<view class="card-box summary" v-if="!loading && testResults.length > 0">
			<text class="summary-title">检测总结</text>
			<text class="summary-text">{{ finalConclusion }}</text>
		</view>
	</view>
</template>

<script setup>
import { ref, computed } from 'vue';
import request from '@/utils/request';
import { login } from '@/api/auth';
import { getCourseList } from '@/api/course';
import { useAuthStore } from '@/store/authStore';

const loading = ref(false);
const manualLoading = ref(false);
const testResults = ref([]);
const authStore = useAuthStore();

const testCredentials = ref({
  username: 'student01',
  password: '123456'
});
const manualToken = ref('');

const addResult = (label, status, message) => {
  testResults.value.push({ label, status, message });
};

const runAllTests = async () => {
  loading.value = true;
  testResults.value = [];
  authStore.logout();

  // 1. 检查后端服务
  addResult('1. 检查后端服务', 'pending', `正在连接 ${request.baseUrl}...`);
  try {
    await uni.request({ url: request.baseUrl, timeout: 3000 });
    testResults.value[0].status = 'success';
    testResults.value[0].message = `成功连接到 ${request.baseUrl}`;
  } catch (e) {
    testResults.value[0].status = 'error';
    testResults.value[0].message = `无法连接到 ${request.baseUrl}，请检查后端服务是否启动及网络配置。`;
    loading.value = false;
    return;
  }
  
  // 2. 测试无效登录
  addResult('2. 测试登录接口', 'pending', '尝试无效登录...');
  try {
    await login({ username: 'invalid_user', password: 'invalid_password' });
    testResults.value[1].status = 'error';
    testResults.value[1].message = '预期应失败但意外成功，请检查后端逻辑。';
  } catch (error) {
    if (error.statusCode >= 400 && error.statusCode < 500) {
      testResults.value[1].status = 'success';
      testResults.value[1].message = `成功收到后端拒绝响应 (${error.statusCode})，接口正常。`;
    } else {
      testResults.value[1].status = 'error';
      testResults.value[1].message = `接口异常: ${error.errMsg || JSON.stringify(error)}。`;
    }
  }

  // 3. 测试有效登录
  addResult('3. 测试有效登录', 'pending', '尝试有效登录...');
  try {
    await authStore.login(testCredentials.value);
    if (authStore.token) {
      testResults.value[2].status = 'success';
      testResults.value[2].message = `登录成功，已获取 Token: ${authStore.token.substring(0, 20)}...`;
    } else {
      throw new Error('登录成功但未返回 Token');
    }
  } catch (error) {
    testResults.value[2].status = 'error';
    testResults.value[2].message = `登录失败: ${error.message}。请检查账号密码。`;
    loading.value = false;
    return;
  }

  // 4. 测试带 Token 的接口
  addResult('4. 测试需鉴权的接口', 'pending', '尝试获取课程列表...');
  try {
    const courseData = await getCourseList();
    const list = courseData?.list || [];
    testResults.value[3].status = 'success';
    testResults.value[3].message = `成功获取到 ${list.length} 门课程，Token 验证通过。`;
  } catch (error) {
    const msg = error.statusCode === 401 ? 'Token 无效或已过期。' : `请求失败: ${error.message}`;
    testResults.value[3].status = 'error';
    testResults.value[3].message = `获取课程列表失败。${msg}`;
  }

  loading.value = false;
};

const runManualTokenTest = async () => {
  if (!manualToken.value.trim()) {
    uni.showToast({ title: '请先粘贴Token', icon: 'none' });
    return;
  }
  manualLoading.value = true;
  testResults.value = []; // 清空之前的测试结果
  
  // 直接设置Token，绕过登录
  authStore.token = manualToken.value.trim();
  
  addResult('手动测试: 需鉴权的接口', 'pending', '正在使用您提供的Token获取课程列表...');
  try {
    const courseData = await getCourseList();
    const list = courseData?.list || [];
    const result = testResults.value[0];
    result.status = 'success';
    result.message = `成功获取到 ${list.length} 门课程，说明Token有效，鉴权接口正常。`;
  } catch (error) {
    const result = testResults.value[0];
    const msg = error.statusCode === 401 ? '后端拒绝了此Token，无效或已过期。' : `请求失败: ${error.message}`;
    result.status = 'error';
    result.message = `获取课程列表失败。${msg}`;
  }
  manualLoading.value = false;
};

const getIcon = (status) => {
  const map = {
    pending: 'spinner-cycle',
    success: 'checkmark-filled',
    error: 'close-filled'
  };
  return map[status] || 'help';
};

const finalConclusion = computed(() => {
  if (testResults.value.some(r => r.status === 'error')) {
    return '检测发现问题，请根据上方红色提示进行排查。常见问题包括：后端未启动、BaseURL配置错误、账号密码不正确或数据库无数据。';
  }
  if (testResults.value.length > 0 && testResults.value.every(r => r.status === 'success')) {
    return '所有检测项均已通过，前后端基础通信与鉴权正常！';
  }
  return '';
});

</script>

<style lang="scss" scoped>
$theme-color: #4C8AF2;
$success-color: #2ECC71;
$error-color: #E74C3C;
$pending-color: #F39C12;

.check-page {
	padding: 40rpx;
	background-color: #F4F7FA;
	min-height: 100vh;
}

.header {
	text-align: center;
	margin-bottom: 40rpx;
	.title { font-size: 44rpx; font-weight: bold; color: #333; display: block; }
	.subtitle { font-size: 26rpx; color: #888; }
}

.card-box {
	background: #fff;
	border-radius: 24rpx;
	padding: 32rpx;
	box-shadow: 0 4px 12px rgba(0,0,0,0.05);
	margin-bottom: 40rpx;
}

.section-title {
	display: block;
	font-size: 32rpx;
	font-weight: bold;
	margin-bottom: 24rpx;
	padding-left: 12rpx;
	border-left: 8rpx solid $theme-color;
}

.input-section {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
	margin-bottom: 30rpx;
	.input-field { height: 90rpx; padding: 0 30rpx; background-color: #F9FAFB; border-radius: 16rpx; border: 1rpx solid #EAEAEA; font-size: 28rpx; }
	.textarea-field {
		width: 100%;
		height: 150rpx;
		padding: 20rpx 30rpx;
		background-color: #F9FAFB;
		border-radius: 16rpx;
		border: 1rpx solid #EAEAEA;
		font-size: 26rpx;
		box-sizing: border-box;
	}
}

.check-button {
	background: $theme-color;
	color: white;
	font-weight: bold;
	border-radius: 16rpx;
	height: 96rpx;
	line-height: 96rpx;
	&.manual {
		background: #6C5BFF;
	}
}

.results-container {
	display: flex;
	flex-direction: column;
	gap: 24rpx;
	margin-top: 50rpx;
}

.result-item { display: flex; align-items: flex-start; gap: 24rpx; padding: 24rpx; background-color: #fff; border-radius: 16rpx; border: 1rpx solid #EAEAEA; }

.result-status {
	width: 60rpx; height: 60rpx; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
	&.pending { background-color: $pending-color; }
	&.success { background-color: $success-color; }
	&.error { background-color: $error-color; }
}

.result-info {
	display: flex; flex-direction: column;
	.result-label { font-size: 28rpx; font-weight: bold; color: #333; }
	.result-message { font-size: 24rpx; color: #666; line-height: 1.5; margin-top: 4rpx; word-break: break-all; }
}

.summary.card-box {
	margin-top: 40rpx;
	.summary-title { font-size: 32rpx; font-weight: bold; margin-bottom: 16rpx; }
	.summary-text { font-size: 26rpx; color: #555; line-height: 1.6; }
}
</style>