<template>
	<view class="login-container">
		<!-- 动态背景 -->
		<view class="bg-blur-shapes">
			<view class="shape s1"></view>
			<view class="shape s2"></view>
			<view class="shape s3"></view>
		</view>

		<view class="content-wrapper">
			<!-- Logo 区 -->
			<view class="logo-section">
				<view class="logo-bg">
					<!-- 这里使用简单的图标占位 -->
					<uni-icons type="person-filled" size="40" color="#FFFFFF"></uni-icons>
				</view>
				<text class="title">爱从游</text>
				<text class="subtitle">学生学习管理平台</text>
			</view>

			<!-- 登录卡片 -->
			<view class="login-card">
				<text class="card-title">登录账户</text>
				
				<view class="form-item">
					<text class="form-label">学号</text>
					<input
						v-model="loginForm.studentId"
						type="text"
						placeholder="请输入学号"
						class="form-input"
					/>
				</view>
				
				<view class="form-item">
					<text class="form-label">密码</text>
					<view class="password-wrapper">
						<input
							v-model="loginForm.password"
							:password="!showPassword"
							placeholder="请输入密码"
							class="form-input"
						/>
						<text 
							class="eye-icon"
							@click="showPassword = !showPassword">
							<!-- 模拟眼睛图标 -->
							{{ showPassword ? '🙈' : '👁️' }}
						</text>
					</view>
				</view>
				
				<view class="options-row">
					<label class="remember-me">
						<checkbox :checked="loginForm.remember" @click="loginForm.remember = !loginForm.remember" style="transform:scale(0.7)" color="#4C8AF2" />
						<text class="remember-text">记住我</text>
					</label>
					<text class="forgot-password">忘记密码？</text>
				</view>

				<!-- 登录按钮 -->
				<button 
					class="login-button" 
					:loading="loading" 
					:disabled="loading" 
					@click="handleLogin"
				>
					{{ loading ? '登录中...' : '登录' }}
				</button>

				<!-- [新增] 直接进入/游客访问入口 -->
				<button 
					class="guest-button" 
					@click="handleGuestLogin"
				>
					游客直接体验 &rarr;
				</button>
			</view>
			
			<!-- Footer -->
			<text class="footer-text">© 2025 爱从游. 保留所有权利</text>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue';

const loginForm = ref({
  studentId: '',
  password: '',
  remember: false
});

const showPassword = ref(false);
const loading = ref(false);

// 标准登录逻辑
const handleLogin = async () => {
  if (!loginForm.value.studentId || !loginForm.value.password) {
    uni.showToast({
      title: '请输入账号密码',
      icon: 'none'
    });
    return;
  }

  loading.value = true;
  
  // 模拟 API 调用
  setTimeout(() => {
    loading.value = false;
    console.log('Login success:', loginForm.value);
    
    // 登录成功跳转 (因为是 TabBar 页面，必须用 switchTab)
    uni.switchTab({
      url: '/pages/index/CourseListView'
    });
    
  }, 1000);
};

// [新增] 游客/直接进入逻辑
const handleGuestLogin = () => {
  uni.showToast({
    title: '欢迎进入体验模式',
    icon: 'none'
  });
  
  // 直接跳转到主页 (TabBar)
  setTimeout(() => {
    uni.switchTab({
      url: '/pages/index/CourseListView'
    });
  }, 500);
};
</script>

<style lang="scss" scoped>
/* 引用全局变量 (假设在 uni.scss 中定义) */
$theme-color: #4C8AF2;

/* 主容器 */
.login-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	min-height: 100vh;
	width: 100%;
	background: linear-gradient(135deg, #F0F5FF, #FFFFFF, #E6F0FF);
	padding: 20rpx;
	box-sizing: border-box;
	position: relative;
	overflow: hidden;
}

/* 动态背景形状 */
.bg-blur-shapes {
	position: absolute;
	inset: 0;
	pointer-events: none;
	overflow: hidden;
	
	.shape {
		position: absolute;
		border-radius: 50%;
		opacity: 0.15; 
	}
	.s1 {
		width: 400rpx;
		height: 400rpx;
		background: #4C8AF2;
		top: 10%;
		left: -50rpx;
	}
	.s2 {
		width: 500rpx;
		height: 500rpx;
		background: #6C5BFF;
		bottom: 10%;
		right: -100rpx;
	}
    .s3 {
        width: 600rpx;
        height: 600rpx;
        background: #89CFF0;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        opacity: 0.1;
    }
}

/* 内容层 */
.content-wrapper {
	width: 100%;
	max-width: 650rpx;
	padding: 0 20rpx;
	z-index: 10;
	display: flex;
	flex-direction: column;
	align-items: center;
}

/* Logo 区 */
.logo-section {
	text-align: center;
	margin-bottom: 60rpx;
	
	.logo-bg {
		width: 140rpx;
		height: 140rpx;
		background: linear-gradient(135deg, #4C8AF2, #6C5BFF);
		border-radius: 32rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto 30rpx;
		box-shadow: 0 10rpx 30rpx rgba(76, 138, 242, 0.3);
	}
	.title {
		font-size: 48rpx;
		font-weight: bold;
		color: #333;
		display: block;
		margin-bottom: 10rpx;
	}
	.subtitle {
		font-size: 28rpx;
		color: #666;
	}
}

/* 登录卡片 */
.login-card {
	width: 100%;
	background: rgba(255, 255, 255, 0.9);
	border: 1rpx solid rgba(255, 255, 255, 0.5);
	border-radius: 40rpx;
	padding: 50rpx;
	box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.08);
	box-sizing: border-box;
	
	.card-title {
		font-size: 36rpx;
		font-weight: 600;
		color: #333;
		text-align: center;
		display: block;
		margin-bottom: 50rpx;
	}
}

/* 表单 */
.form-item {
	margin-bottom: 30rpx;
	
	.form-label {
		font-size: 26rpx;
		font-weight: 500;
		color: #555;
		margin-bottom: 10rpx;
		display: block;
	}
	
	.form-input {
		width: 100%;
		height: 88rpx;
		padding: 0 30rpx;
		background: #F5F5F5;
		border: 1rpx solid #E0E0E0;
		border-radius: 20rpx;
		font-size: 28rpx;
		box-sizing: border-box;
	}
	
	.password-wrapper {
		position: relative;
		
		.eye-icon {
			position: absolute;
			right: 30rpx;
			top: 50%;
			transform: translateY(-50%);
			color: #999;
            font-size: 28rpx;
            cursor: pointer;
            padding: 10rpx;
		}
	}
}

.options-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	font-size: 26rpx;
	margin-bottom: 40rpx;
	
	.remember-me {
		display: flex;
		align-items: center;
		color: #666;
	}
	.remember-text {
		margin-left: 10rpx;
	}
	
	.forgot-password {
		color: #4C8AF2;
		font-weight: 500;
	}
}

.login-button {
	width: 100%;
	height: 90rpx;
	line-height: 90rpx;
	background: #4C8AF2;
	color: white;
	font-size: 30rpx;
	font-weight: 600;
	border-radius: 20rpx;
	box-shadow: 0 8rpx 20rpx rgba(76, 138, 242, 0.3);
	margin-bottom: 20rpx;
	
	&[disabled] {
		opacity: 0.7;
	}
    
    &:active {
        transform: scale(0.98);
    }
}

/* 游客按钮样式 */
.guest-button {
	width: 100%;
	height: 90rpx;
	line-height: 90rpx;
	background: transparent;
	color: #4C8AF2;
	font-size: 28rpx;
	font-weight: 500;
	border-radius: 20rpx;
    border: 2rpx solid #4C8AF2;
	box-sizing: border-box;
    
    &:active {
        background-color: rgba(76, 138, 242, 0.05);
    }
}

.footer-text {
	margin-top: 40rpx;
	font-size: 24rpx;
	color: #999;
	text-align: center;
	z-index: 10;
}
</style>