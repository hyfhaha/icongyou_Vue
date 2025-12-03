<template>
  <view class="team-action-page">
    <view class="header-sticky">
      <view class="header-content">
        <view class="icon-button" @click="goBack">
          <uni-icons type="left" size="24" color="#555555"></uni-icons>
        </view>
        <text class="header-title">{{ mode === 'create' ? '创建团队' : '加入团队' }}</text>
        <view class="icon-button"></view> </view>
    </view>

    <view class="content">
      <view v-if="mode === 'create'" class="form-card">
        <view class="form-item">
          <text class="label">团队名称</text>
          <input 
            class="input" 
            v-model="formData.name" 
            placeholder="给团队起个响亮的名字" 
            maxlength="20"
          />
        </view>
        <view class="form-item">
          <text class="label">最大人数</text>
          <view class="stepper">
            <view class="step-btn" @click="changeSize(-1)">-</view>
            <text class="step-val">{{ formData.maxSize }}</text>
            <view class="step-btn" @click="changeSize(1)">+</view>
          </view>
          <text class="hint">建议 4-6 人</text>
        </view>
        <button class="submit-btn" @click="submitCreate">确认创建</button>
      </view>

      <view v-else class="form-card">
        <view class="form-item">
          <text class="label">团队邀请码</text>
          <input 
            class="input code-input" 
            v-model="formData.code" 
            placeholder="请输入 6 位邀请码" 
            maxlength="8"
          />
        </view>
        <view class="tips-box">
          <uni-icons type="info" size="16" color="#888"></uni-icons>
          <text class="tips-text">请向队长索要邀请码 (如: ABC123)</text>
        </view>
        <button class="submit-btn join" @click="submitJoin">立即加入</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { createTeam, joinTeamByCode } from '@/api/team';
import { useCourseContextStore } from '@/store/courseContextStore';

const contextStore = useCourseContextStore();
const mode = ref('create'); // create | join
const courseId = ref(null);

const formData = ref({
  name: '',
  maxSize: 5,
  code: ''
});

onLoad((options) => {
  mode.value = options.mode || 'create';
  courseId.value = options.courseId;
});

const goBack = () => uni.navigateBack();

const changeSize = (delta) => {
  const newVal = formData.value.maxSize + delta;
  if (newVal >= 2 && newVal <= 10) {
    formData.value.maxSize = newVal;
  }
};

// 提交创建
const submitCreate = async () => {
  if (!formData.value.name.trim()) return uni.showToast({ title: '请输入团队名称', icon: 'none' });
  if (!courseId.value) return uni.showToast({ title: '课程ID丢失', icon: 'none' });

  uni.showLoading({ title: '创建中...' });
  try {
    // 调用 API
    await createTeam(courseId.value, {
      groupName: formData.value.name,
      maxSize: formData.value.maxSize
    });
    
    // 刷新 Store 中的团队数据
    await contextStore.fetchTeamInfo(courseId.value);
    
    uni.hideLoading();
    uni.showToast({ title: '创建成功', icon: 'success' });
    
    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
  } catch (err) {
    uni.hideLoading();
    // 错误信息处理 (后端返回的 message)
    const msg = err.response?.data?.message || err.message || '创建失败';
    uni.showToast({ title: msg, icon: 'none' });
  }
};

// 提交加入
const submitJoin = async () => {
  if (!formData.value.code.trim()) return uni.showToast({ title: '请输入邀请码', icon: 'none' });

  uni.showLoading({ title: '加入中...' });
  try {
    // 调用新 API: joinTeamByCode
    const res = await joinTeamByCode(formData.value.code);
    
    // 如果加入成功，刷新数据
    // 注意：加入的可能是别的课程的团队，如果刚好是当前课程，刷新才有意义
    // 但通常是在当前课程上下文操作，所以直接刷新没问题
    if (contextStore.currentCourseId) {
        await contextStore.fetchTeamInfo(contextStore.currentCourseId);
    }
    
    uni.hideLoading();
    uni.showToast({ title: '加入成功', icon: 'success' });
    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
  } catch (err) {
    uni.hideLoading();
    const msg = err.response?.data?.message || err.message || '加入失败，请检查邀请码';
    uni.showToast({ title: msg, icon: 'none' });
  }
};
</script>

<style lang="scss" scoped>
.team-action-page { min-height: 100vh; background: #F4F7FA; display: flex; flex-direction: column; }

.header-sticky {
  position: sticky;
  top: 0;
  z-index: 50;
  background: #FFFFFF;
  padding-top: var(--status-bar-height);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}
.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24rpx;
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
  font-size: 34rpx;
  font-weight: bold;
  color: #333;
}

.content { padding: 40rpx; }
.form-card { background: #fff; border-radius: 24rpx; padding: 40rpx; box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05); }

.form-item { margin-bottom: 40rpx; }
.label { display: block; font-size: 28rpx; color: #666; margin-bottom: 20rpx; font-weight: 500; }
.input {
  height: 88rpx; background: #F8F9FA; border-radius: 16rpx; padding: 0 24rpx; font-size: 30rpx;
  &.code-input { letter-spacing: 4rpx; font-weight: bold; text-align: center; font-size: 36rpx; color: #4C8AF2; }
}

.stepper { display: flex; align-items: center; gap: 30rpx; }
.step-btn { width: 80rpx; height: 80rpx; background: #F0F0F0; border-radius: 16rpx; display: flex; align-items: center; justify-content: center; font-size: 40rpx; font-weight: bold; color: #4C8AF2; &:active{opacity:0.7;} }
.step-val { font-size: 40rpx; font-weight: bold; min-width: 60rpx; text-align: center; }
.hint { font-size: 24rpx; color: #999; margin-left: 20rpx; }

.tips-box { display: flex; align-items: center; gap: 10rpx; justify-content: center; margin-bottom: 40rpx; }
.tips-text { font-size: 24rpx; color: #888; }

.submit-btn {
  height: 96rpx; background: linear-gradient(135deg, #4C8AF2, #6C5BFF); color: white; border-radius: 48rpx;
  font-size: 32rpx; font-weight: bold; display: flex; align-items: center; justify-content: center;
  box-shadow: 0 8rpx 20rpx rgba(76, 138, 242, 0.3);
  &.join { background: linear-gradient(135deg, #2ECC71, #27AE60); box-shadow: 0 8rpx 20rpx rgba(46, 204, 113, 0.3); }
  &:active { opacity: 0.9; transform: scale(0.98); }
}
</style>