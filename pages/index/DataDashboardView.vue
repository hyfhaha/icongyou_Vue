<template>
	<view class="data-dashboard-page">
		<view class="header-sticky">
			<view class="header-content">
				<view class="icon-button" @click="goBack">
					<uni-icons type="left" size="24" color="#555555"></uni-icons>
				</view>
				<view class="tab-control">
					<view class="tab-item" :class="{ active: activeTab === 'personal' }" @click="handleTabChange('personal')">个人数据</view>
					<view class="tab-item" :class="{ active: activeTab === 'team' }" @click="handleTabChange('team')">团队数据</view>
				</view>
				<view class="icon-button"></view>
			</view>
		</view>

		<scroll-view scroll-y="true" class="page-scroll">
			
			<view v-if="activeTab === 'personal'" class="tab-content fade-in">
				<!-- 核心数据卡片 -->
				<view class="summary-card">
					<view class="score-block">
						<text class="block-label">课程总得分</text>
						<text class="block-value">{{ personalData.totalScore || 0 }}</text>
						<text class="block-sub">班级均分 {{ personalData.avgScore || 0 }}</text>
						<view class="score-trend" v-if="personalData.totalScore > personalData.avgScore">
							<uni-icons type="arrow-up" size="14" color="#2ECC71"></uni-icons>
							<text class="trend-text">高于均分</text>
						</view>
					</view>
					<view class="divider"></view>
					<view class="rank-block">
						<text class="block-label">当前排名</text>
						<text class="block-value highlight" v-if="personalData.rank">#{{ personalData.rank }}</text>
						<text class="block-value highlight" v-else>--</text>
						<text class="block-sub" v-if="personalData.rankPercent > 0">Top {{ Math.round(personalData.rankPercent) }}%</text>
						<text class="block-sub" v-else-if="personalData.studentCount">排名计算中</text>
						<text class="block-sub" v-if="personalData.studentCount">共 {{ personalData.studentCount }} 人</text>
					</view>
				</view>

				<!-- 任务完成情况统计 -->
				<view class="card-box">
					<view class="card-title-row">
						<uni-icons type="list" size="20" color="#2ECC71"></uni-icons>
						<text class="card-title">任务完成情况</text>
					</view>
					<view class="task-stats-grid">
						<view class="task-stat-item completed">
							<view class="task-stat-icon">
								<uni-icons type="checkmarkempty" size="24" color="#2ECC71"></uni-icons>
							</view>
							<text class="task-stat-value completed">{{ taskStats.completedTasks }}</text>
							<text class="task-stat-label">已完成</text>
						</view>
						<view class="task-stat-item in-progress">
							<view class="task-stat-icon">
								<uni-icons type="loop" size="24" color="#4C8AF2"></uni-icons>
							</view>
							<text class="task-stat-value in-progress">{{ taskStats.inProgressTasks }}</text>
							<text class="task-stat-label">进行中</text>
						</view>
						<view class="task-stat-item upcoming">
							<view class="task-stat-icon">
								<uni-icons type="calendar" size="24" color="#BDC3C7"></uni-icons>
							</view>
							<text class="task-stat-value upcoming">{{ taskStats.upcomingTasks }}</text>
							<text class="task-stat-label">未开始</text>
						</view>
					</view>
					<view class="completion-progress">
						<view class="progress-header">
							<text class="progress-label">总体完成度</text>
							<text class="progress-percent">{{ taskStats.completionRate }}%</text>
						</view>
						<view class="progress-bar-wrapper">
							<view class="progress-bar-bg">
								<view class="progress-bar-fill" :style="{ width: taskStats.completionRate + '%' }"></view>
							</view>
						</view>
					</view>
				</view>

				<!-- 个人信息 -->
				<view class="card-box">
					<view class="card-title-row">
						<uni-icons type="person-filled" size="20" color="#4C8AF2"></uni-icons>
						<text class="card-title">个人信息</text>
					</view>
					<view class="info-grid">
						<view class="info-item">
							<text class="info-icon">👤</text>
							<view class="info-content">
								<text class="info-label">姓名</text>
								<text class="info-val">{{ authStore.userInfo.nickname || '--' }}</text>
							</view>
						</view>
						<view class="info-item">
							<text class="info-icon">🎓</text>
							<view class="info-content">
								<text class="info-label">学号</text>
								<text class="info-val">{{ jobNumberDisplay }}</text>
							</view>
						</view>
						<view class="info-item" v-if="currentCourse.courseName">
							<text class="info-icon">📚</text>
							<view class="info-content">
								<text class="info-label">当前课程</text>
								<text class="info-val">{{ currentCourse.courseName }}</text>
					</view>
					</view>
					</view>
				</view>

				<!-- 能力维度 -->
				<view class="card-box" v-if="abilityDimensions.length > 0">
					<view class="card-title-row">
						<uni-icons type="pyq" size="20" color="#9B59B6"></uni-icons>
						<text class="card-title">工程认证能力维度</text>
					</view>
					<view class="dimension-list">
						<view v-for="dim in abilityDimensions" :key="dim.id" class="dimension-item">
							<view class="dim-header">
								<view class="dim-name-row">
								<text class="dim-name">{{ dim.label }}</text>
									<view v-if="dim.levelLabel" class="level-badge" :style="{ 
										background: dim.color + '20', 
										color: dim.color,
										borderColor: dim.color + '40'
									}">
										<text class="level-text">{{ dim.levelLabel }}级</text>
									</view>
								</view>
								<view class="dim-value-wrapper">
								<text class="dim-val">{{ dim.value }}%</text>
									<view class="dim-badge" :style="{ background: dim.color + '20', color: dim.color }">
										<text v-if="dim.value >= dim.threshold">合格</text>
										<text v-else>待提升</text>
									</view>
								</view>
							</view>
							<view class="progress-bg">
								<view class="progress-fill" :style="{ width: dim.value + '%', background: dim.color }"></view>
								<view v-if="dim.threshold" class="threshold-marker" :style="{ left: dim.threshold + '%', borderColor: dim.color }"></view>
							</view>
							<!-- 任务分布信息 -->
							<view class="dim-detail">
								<text class="detail-text">任务：{{ dim.finishedTasks }}/{{ dim.totalTasks }} | 得分：{{ dim.achievedScore }}/{{ dim.maxScore }}</text>
							</view>
						</view>
					</view>
				</view>
				<view v-else class="card-box">
					<view class="empty-state-small">
						<text class="empty-text-small">暂无能力维度数据</text>
					</view>
				</view>
			</view>

			<view v-if="activeTab === 'team'" class="tab-content fade-in">
				<!-- 未加入团队提示 -->
				<view v-if="!myTeam.id" class="empty-state">
					<uni-icons type="info" size="48" color="#999"></uni-icons>
					<text class="empty-text">您尚未加入任何团队</text>
					<text class="empty-hint">请先加入团队以查看团队数据</text>
				</view>

				<!-- 团队数据 -->
				<template v-else>
					<!-- 团队概览卡片 -->
				<view class="team-header-card">
					<view class="team-top">
							<view class="team-info-left">
								<text class="team-name">{{ myTeam.groupName || '未命名团队' }}</text>
								<text class="course-name" v-if="currentCourse.courseName">{{ currentCourse.courseName }}</text>
							</view>
						<view class="team-score-badge">
								<text class="score-number">{{ myTeam.totalScore || 0 }}</text>
								<text class="score-text">总分</text>
						</view>
					</view>
					<view class="team-stats-row">
							<view class="t-stat">
								<text class="ts-val">{{ teamMembers.length }}</text>
								<text class="ts-lbl">成员</text>
							</view>
							<view class="t-stat">
								<text class="ts-val">{{ myTeam.rank ? ('#' + myTeam.rank) : '--' }}</text>
								<view class="ts-lbl ts-lbl-row">
                  <text>排名</text>
                  <text v-if="myTeam.rankTotal" class="ts-sub">/ {{ myTeam.rankTotal }}</text>
                </view>
							</view>
							<view class="t-stat">
								<text class="ts-val">{{ completedTeamTasksCount }}</text>
								<text class="ts-lbl">完成任务</text>
							</view>
							<view class="t-stat">
								<text class="ts-val">{{ teamStats.completionRate }}%</text>
								<text class="ts-lbl">完成率</text>
							</view>
					</view>
				</view>

					<!-- 团队成员与贡献 -->
				<view class="card-box">
					<view class="card-title-row">
						<uni-icons type="staff-filled" size="20" color="#6C5BFF"></uni-icons>
						<text class="card-title">团队成员与贡献</text>
							<text class="card-subtitle">{{ teamMembers.length }} 人</text>
					</view>
						<view class="member-list" v-if="teamMembers.length > 0">
							<view v-for="(m, index) in sortedMembers" :key="m.id" class="member-item">
								<view class="member-rank">{{ index + 1 }}</view>
							<view class="m-avatar" :class="{ leader: m.isLeader }">
									<text>{{ (m.name || '').charAt(0) || '?' }}</text>
									<view v-if="m.isLeader" class="leader-crown">👑</view>
							</view>
							<view class="m-info">
									<view class="m-name-row">
										<text class="m-name">{{ m.name || '未知' }}</text>
										<text v-if="m.isLeader" class="leader-tag">队长</text>
                    <text v-else class="member-tag">队员</text>
									</view>
									<text class="m-id" v-if="m.studentId">学号: {{ m.studentId }}</text>
									<text class="m-id" v-else>学号: --</text>
									<view class="m-score" v-if="m.score !== undefined">
										<text class="score-text">个人得分: {{ m.score }}</text>
									</view>
							</view>
							<view class="m-contribution">
									<view class="contribution-circle" :style="{ background: getContributionColor(m.contribution) }">
										<text class="c-val">{{ m.contribution || 0 }}%</text>
									</view>
								<text class="c-lbl">贡献度</text>
							</view>
						</view>
					</view>
						<view v-else class="empty-state-small">
							<text class="empty-text-small">暂无成员数据</text>
				</view>
					</view>

					<!-- 团队统计数据 -->
					<view class="card-box">
						<view class="card-title-row">
							<uni-icons type="pyq" size="20" color="#9B59B6"></uni-icons>
							<text class="card-title">团队数据统计</text>
						</view>
						<view class="stats-grid">
							<view class="stat-card" style="background: linear-gradient(135deg, #EBF0FF, #E6F0FF);">
								<view class="stat-icon-wrapper">
									<uni-icons type="person" size="24" color="#4C8AF2"></uni-icons>
								</view>
								<text class="stat-card-label">平均贡献度</text>
								<text class="stat-card-value" style="color: #4C8AF2;">{{ teamStats.avgContribution }}%</text>
							</view>
							<view class="stat-card" style="background: linear-gradient(135deg, #EAFBF4, #E6FCEF);">
								<view class="stat-icon-wrapper">
									<uni-icons type="checkmarkempty" size="24" color="#2ECC71"></uni-icons>
								</view>
								<text class="stat-card-label">完成率</text>
								<text class="stat-card-value" style="color: #2ECC71;">{{ teamStats.completionRate }}%</text>
							</view>
							<view class="stat-card" style="background: linear-gradient(135deg, #F5F3FF, #F3EFFF);">
								<view class="stat-icon-wrapper">
									<uni-icons type="fire" size="24" color="#9B59B6"></uni-icons>
								</view>
								<text class="stat-card-label">团队活跃度</text>
								<text class="stat-card-value" style="color: #9B59B6;">{{ teamStats.activeRate }}%</text>
							</view>
							<view class="stat-card" style="background: linear-gradient(135deg, #FFF7ED, #FFFBEB);">
								<view class="stat-icon-wrapper">
									<uni-icons type="heart" size="24" color="#F97316"></uni-icons>
								</view>
								<text class="stat-card-label">协作指数</text>
								<text class="stat-card-value" style="color: #F97316;">{{ teamStats.collaborationIndex }}</text>
							</view>
						</view>
					</view>
				</template>
			</view>
			
		</scroll-view>
	</view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app';
// 引入两个 Store
import { useAuthStore } from '@/store/authStore';
import { useCourseContextStore } from '@/store/courseContextStore';

const activeTab = ref('personal');

const authStore = useAuthStore();
const contextStore = useCourseContextStore();

// 解构数据
const { personalData, abilityDimensions, myTeam, teamMembers, currentCourseId, taskNodes, currentCourse } = storeToRefs(contextStore);

/**
 * 数据页面运行逻辑说明：
 * 
 * 1. 数据来源：
 *    - 个人数据：从 courseContextStore.personalData 获取（在 initCourseContext 时加载）
 *    - 团队数据：从 courseContextStore.myTeam 和 teamMembers 获取（通过 fetchTeamInfo 加载）
 * 
 * 2. 数据加载流程：
 *    a) 用户进入课程主页 → 调用 initCourseContext(courseId)
 *       → 设置 currentCourseId
 *       → 自动调用 fetchTeamInfo(courseId) 获取团队数据
 * 
 *    b) 用户进入数据页面：
 *       - onMounted: 如果已登录，调用 loadTeamData()
 *       - onShow: 如果切换到团队标签页，调用 loadTeamData()
 *       - handleTabChange: 切换到团队标签页时，调用 loadTeamData()
 * 
 * 3. fetchTeamInfo 的请求流程：
 *    - 调用 getMyTeams() → GET /api/teams/user (获取用户所有团队)
 *    - 找到当前课程的团队 → 调用 getTeamDetail(teamId) → GET /api/teams/detail/{teamId} (获取团队详情)
 * 
 * 4. 可能的问题：
 *    - 如果 currentCourseId 为空：尝试从课程列表获取第一个课程并初始化
 *    - 如果课程列表为空：提示用户先进入课程
 */

// 根据页面参数设置默认 Tab（personal / team）
const applyTabFromParams = () => {
  try {
    const pages = getCurrentPages && getCurrentPages();
    if (pages && pages.length > 0) {
      const currentPage = pages[pages.length - 1];
      const options = currentPage.options || {};
      const tab = options.tab;
      if (tab === 'team' || tab === 'personal') {
        activeTab.value = tab;
        return;
      }
    }
  } catch (e) {
    console.warn('读取 tab 参数失败', e);
  }
  // 如果没有 tab 参数，尝试读取本地缓存
  try {
    const cachedTab = uni.getStorageSync('dashboardActiveTab');
    if (cachedTab === 'team' || cachedTab === 'personal') {
      activeTab.value = cachedTab;
    }
  } catch (e) {
    console.warn('读取本地缓存 tab 失败', e);
  }
};

const persistActiveTab = () => {
  try {
    uni.setStorageSync('dashboardActiveTab', activeTab.value);
  } catch (e) {
    console.warn('缓存 tab 失败', e);
  }
};

const jobNumberDisplay = computed(() => authStore.userInfo.jobNumber || authStore.userInfo.job_number || '--');

const ensureAuth = async () => {
  try {
    if (!authStore.token) {
      await authStore.checkLoginStatus();
    }
    if (!authStore.token) {
      uni.reLaunch({ url: '/pages/index/LoginView' });
      return false;
    }
    return true;
  } catch (e) {
    console.warn('DataDashboard 确认登录状态失败', e);
    uni.reLaunch({ url: '/pages/index/LoginView' });
    return false;
  }
};

// 任务统计数据
const taskStats = computed(() => {
  const tasks = taskNodes.value || [];
  const completed = tasks.filter(t => t.status === 'completed' || t.status === 'submitted').length;
  const inProgress = tasks.filter(t => t.status === 'in-progress').length;
  const upcoming = tasks.filter(t => !t.status || t.status === 'upcoming').length;
  const total = tasks.length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  return {
    completedTasks: completed,
    inProgressTasks: inProgress,
    upcomingTasks: upcoming,
    totalTasks: total,
    completionRate: completionRate
  };
});

const isTeamTask = (task) => {
  const storyType = Number(task.storyType ?? task.story_type ?? 0);
  return [2, 3].includes(storyType);
};

// 计算已完成团队任务数
const completedTeamTasksCount = computed(() => {
  const tasks = taskNodes.value || [];
  return tasks.filter(task => 
    isTeamTask(task) && 
    (task.status === 'completed' || task.status === 'submitted')
  ).length;
});

// 团队统计数据
const teamStats = computed(() => {
  const members = teamMembers.value || [];
  if (members.length === 0) {
    return {
      avgContribution: 0,
      completionRate: 0,
      activeRate: 0,
      collaborationIndex: 0
    };
  }

  const avgContribution = Math.round(
    members.reduce((sum, m) => sum + (m.contribution || 0), 0) / members.length
  );

  const tasks = taskNodes.value || [];
  const teamTasks = tasks.filter(isTeamTask);
  const completedCount = teamTasks.filter(t => t.status === 'completed' || t.status === 'submitted').length;
  const completionRate = teamTasks.length > 0 ? Math.round((completedCount / teamTasks.length) * 100) : 0;

  const activeMembers = members.filter(m => (m.contribution || 0) > 0).length;
  const activeRate = members.length > 0 ? Math.round((activeMembers / members.length) * 100) : 0;

  const contributions = members.map(m => m.contribution || 0);
  const avg = avgContribution;
  const variance = contributions.reduce((sum, c) => sum + Math.pow(c - avg, 2), 0) / members.length;
  const collaborationIndex = Math.max(0, Math.min(100, Math.round(100 - variance)));

  return {
    avgContribution,
    completionRate,
    activeRate,
    collaborationIndex
  };
});

// 按贡献度排序的成员列表
const sortedMembers = computed(() => {
  const members = [...(teamMembers.value || [])];
  return members.sort((a, b) => {
    // 队长优先
    if (a.isLeader && !b.isLeader) return -1;
    if (!a.isLeader && b.isLeader) return 1;
    // 然后按贡献度排序
    return (b.contribution || 0) - (a.contribution || 0);
  });
});

// 获取贡献度颜色
const getContributionColor = (contribution) => {
  if (contribution >= 30) return 'linear-gradient(135deg, #2ECC71, #27AE60)';
  if (contribution >= 20) return 'linear-gradient(135deg, #4C8AF2, #357ABD)';
  if (contribution >= 10) return 'linear-gradient(135deg, #F39C12, #E67E22)';
  return 'linear-gradient(135deg, #BDC3C7, #95A5A6)';
};


// 加载团队数据
const loadTeamData = async () => {
  console.log('--- 数据页面：开始加载团队数据 ---');
  console.log('当前课程ID:', currentCourseId.value);
  console.log('当前团队信息:', myTeam.value);
  console.log('当前团队成员数:', teamMembers.value.length);

  // 如果没有课程ID，尝试从课程列表中获取第一个课程
  if (!currentCourseId.value) {
    console.warn('⚠️ 未找到当前课程ID，尝试从课程列表获取...');
    const courseList = contextStore.courseList || [];
    if (courseList.length > 0) {
      const firstCourse = courseList[0];
      console.log('使用第一个课程:', firstCourse.courseId);
      await contextStore.initCourseContext(firstCourse.courseId);
      // 检查是否成功设置
      if (!currentCourseId.value) {
        console.error('❌ 初始化课程上下文失败');
        uni.showToast({ title: '请先选择课程', icon: 'none' });
        return;
      }
    } else {
      console.error('❌ 课程列表为空，无法加载团队数据');
      uni.showToast({ title: '请先进入课程', icon: 'none' });
      return;
    }
  }

  try {
    console.log('📡 开始调用 fetchTeamInfo...');
    // 强制刷新团队数据（移除条件判断，确保每次都会请求）
    await contextStore.fetchTeamInfo(currentCourseId.value);
    console.log('✅ 团队数据加载完成');
    console.log('更新后的团队信息:', myTeam.value);
    console.log('更新后的团队成员数:', teamMembers.value.length);
  } catch (error) {
    console.error('❌ 加载团队数据失败', error);
    uni.showToast({ title: '加载团队数据失败', icon: 'none' });
  }
};

// 从页面参数或本地存储获取课程ID
const getCourseIdFromParams = () => {
  // 方法1: 从页面参数获取（getCurrentPages 是 uni-app 全局函数）
  try {
    const pages = getCurrentPages();
    if (pages && pages.length > 0) {
      const currentPage = pages[pages.length - 1];
      const options = currentPage.options || {};
      if (options.courseId) {
        return Number(options.courseId);
      }
    }
  } catch (e) {
    console.warn('获取页面参数失败', e);
  }
  
  // 方法2: 从本地存储获取
  try {
    const storedCourseId = uni.getStorageSync('currentCourseId');
    if (storedCourseId) {
      return Number(storedCourseId);
    }
  } catch (e) {
    console.warn('读取本地存储失败', e);
  }
  
  return null;
};

// 初始化课程上下文（如果还没有设置）
const initCourseIfNeeded = async () => {
  // 如果已经有课程ID，直接返回
  if (currentCourseId.value) {
    console.log('✅ 已有课程ID:', currentCourseId.value);
    return true;
  }
  
  // 尝试从参数获取
  const courseId = getCourseIdFromParams();
  if (courseId) {
    console.log('📚 从参数获取到课程ID:', courseId);
    try {
      await contextStore.initCourseContext(courseId);
      return true;
    } catch (error) {
      console.error('❌ 初始化课程上下文失败:', error);
      return false;
    }
  }
  
  // 尝试从课程列表获取第一个课程
  const courseList = contextStore.courseList || [];
  if (courseList.length > 0) {
    const firstCourse = courseList[0];
    console.log('📚 使用课程列表第一个课程:', firstCourse.courseId);
    try {
      await contextStore.initCourseContext(firstCourse.courseId);
      return true;
    } catch (error) {
      console.error('❌ 初始化课程上下文失败:', error);
      return false;
    }
  }
  
  console.warn('⚠️ 无法获取课程ID，请先进入课程');
  return false;
};

onMounted(async () => {
  // 确保已登录
  const ok = await ensureAuth();
  if (!ok) return;

  // 先根据路由参数设置默认 tab
  applyTabFromParams();
  
  // 初始化课程上下文（如果需要）
  const success = await initCourseIfNeeded();
  if (!success) {
    console.warn('⚠️ 课程初始化失败，部分数据可能无法加载');
  }
  
  // 加载团队数据
  loadTeamData();
});

// 当切换到团队标签页时，确保数据已加载
const handleTabChange = (tab) => {
  activeTab.value = tab;
  persistActiveTab();
  if (tab === 'team') {
    loadTeamData();
  }
};

onShow(async () => {
  // 每次显示页面时，根据路由参数同步一次 tab（防止返回后状态不一致）
  applyTabFromParams();
  persistActiveTab();
  
  const ok = await ensureAuth();
  if (!ok) return;
  
  // 每次显示页面时，重新初始化课程上下文（防止刷新后丢失）
  const success = await initCourseIfNeeded();
  if (!success) {
    console.warn('⚠️ 课程初始化失败，部分数据可能无法加载');
  }
  
  if (activeTab.value === 'team') {
    loadTeamData();
    }
});

// 下拉刷新：根据当前 tab 重拉对应数据
onPullDownRefresh(async () => {
  const ok = await ensureAuth();
  if (!ok) {
    uni.stopPullDownRefresh();
    return;
  }

  const success = await initCourseIfNeeded();
  if (!success) {
    uni.stopPullDownRefresh();
    return;
  }

  if (activeTab.value === 'team') {
    await loadTeamData();
  } else {
    // 个人数据主要依赖 taskNodes/personalData，重新初始化课程上下文即可
    await contextStore.initCourseContext(currentCourseId.value || getCourseIdFromParams());
  }

  uni.stopPullDownRefresh();
});

const goBack = () => uni.navigateBack();
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
.score-trend {
	display: flex;
	align-items: center;
	gap: 4rpx;
	margin-top: 8rpx;
	.trend-text {
		font-size: 20rpx;
		color: #2ECC71;
	}
}

.card-box { background: #fff; border-radius: 24rpx; padding: 30rpx; margin-bottom: 30rpx; box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05); }
.card-title-row { display: flex; gap: 16rpx; margin-bottom: 20rpx; align-items: center; }
.card-title { font-size: 32rpx; font-weight: bold; color: $text-color; }

.info-row { display: flex; margin-bottom: 10rpx; font-size: 28rpx; }
.info-label { color: #888; width: 120rpx; }
.info-val { color: #333; font-weight: 500; }

.info-grid {
	display: grid;
	grid-template-columns: 1fr;
	gap: 20rpx;
}
.info-item {
	display: flex;
	align-items: center;
	gap: 20rpx;
	padding: 20rpx;
	background: #F8F9FA;
	border-radius: 16rpx;
	.info-icon {
		font-size: 40rpx;
		width: 60rpx;
		text-align: center;
	}
	.info-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 4rpx;
		.info-label {
			font-size: 22rpx;
			color: #888;
		}
		.info-val {
			font-size: 28rpx;
			color: #333;
			font-weight: 500;
		}
	}
}

.task-stats-grid {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 20rpx;
	margin-bottom: 30rpx;
}
.task-stat-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 24rpx;
	border-radius: 16rpx;
	background: #F8F9FA;
	&.completed { background: #EAFBF4; }
	&.in-progress { background: #EBF0FF; }
	&.upcoming { background: #F5F5F5; }
	.task-stat-icon {
		margin-bottom: 12rpx;
	}
	.task-stat-value {
		font-size: 40rpx;
		font-weight: bold;
		margin-bottom: 8rpx;
		&.completed { color: #2ECC71; }
		&.in-progress { color: #4C8AF2; }
		&.upcoming { color: #BDC3C7; }
	}
	.task-stat-label {
		font-size: 24rpx;
		color: #666;
	}
}
.completion-progress {
	margin-top: 20rpx;
	.progress-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 12rpx;
		.progress-label {
			font-size: 26rpx;
			color: #333;
			font-weight: 500;
		}
		.progress-percent {
			font-size: 28rpx;
			font-weight: bold;
			color: #4C8AF2;
		}
	}
	.progress-bar-wrapper {
		.progress-bar-bg {
			height: 20rpx;
			background: #F0F0F0;
			border-radius: 10rpx;
			overflow: hidden;
			.progress-bar-fill {
				height: 100%;
				background: linear-gradient(90deg, #4C8AF2, #6C5BFF);
				border-radius: 10rpx;
				transition: width 0.5s ease;
			}
		}
	}
}

.dimension-list { display: flex; flex-direction: column; gap: 24rpx; }
.dimension-item {
	padding: 20rpx;
	background: #F8F9FA;
	border-radius: 16rpx;
}
.dim-header { 
	display: flex; 
	justify-content: space-between; 
	align-items: flex-start;
	margin-bottom: 12rpx; 
	font-size: 26rpx; 
}
.dim-name-row {
	display: flex;
	align-items: center;
	gap: 12rpx;
	flex: 1;
}
.dim-name {
	font-weight: 500;
	color: #333;
}
.level-badge {
	padding: 4rpx 10rpx;
	border-radius: 8rpx;
	border: 1rpx solid;
	font-size: 20rpx;
	font-weight: 500;
	.level-text {
		font-size: 20rpx;
	}
}
.dim-value-wrapper {
	display: flex;
	align-items: center;
	gap: 12rpx;
}
.dim-val {
	font-size: 28rpx;
	font-weight: bold;
	color: #4C8AF2;
}
.dim-badge {
	padding: 4rpx 12rpx;
	border-radius: 12rpx;
	font-size: 20rpx;
	font-weight: 500;
}
.progress-bg { 
	height: 16rpx; 
	background: #F0F0F0; 
	border-radius: 8rpx; 
	overflow: hidden; 
	position: relative;
}
.progress-fill { 
	height: 100%; 
	border-radius: 8rpx; 
	transition: width 0.5s ease; 
}
.threshold-marker {
	position: absolute;
	top: 0;
	bottom: 0;
	width: 2rpx;
	border-left: 2rpx dashed;
	transform: translateX(-50%);
	opacity: 0.6;
}
.dim-detail {
	margin-top: 12rpx;
	.detail-text {
		font-size: 22rpx;
		color: #666;
	}
}

.team-header-card {
	background: linear-gradient(135deg, #8B5CF6, #6366F1); border-radius: 24rpx; padding: 40rpx;
	color: white; margin-bottom: 30rpx; box-shadow: 0 10rpx 30rpx rgba(139, 92, 246, 0.3);
}
.team-top { 
	display: flex; 
	justify-content: space-between; 
	align-items: flex-start; 
	margin-bottom: 30rpx; 
}
.team-info-left {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 8rpx;
}
.team-name { font-size: 40rpx; font-weight: bold; }
.course-name {
	font-size: 24rpx;
	opacity: 0.9;
}
.team-score-badge { 
	background: rgba(255,255,255,0.25); 
	padding: 16rpx 24rpx; 
	border-radius: 20rpx; 
	display: flex;
	flex-direction: column;
	align-items: center;
	backdrop-filter: blur(10px);
	.score-number {
		font-size: 36rpx;
		font-weight: bold;
	}
	.score-text {
		font-size: 20rpx;
		opacity: 0.9;
	}
}
.team-stats-row { 
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 20rpx;
	background: rgba(255,255,255,0.1);
	backdrop-filter: blur(10px);
	border-radius: 16rpx;
	padding: 24rpx;
}
.t-stat { 
	display: flex; 
	flex-direction: column; 
	align-items: center; 
}
.ts-val { font-size: 36rpx; font-weight: bold; }
.ts-lbl { font-size: 22rpx; opacity: 0.8; margin-top: 4rpx; }
.ts-lbl-row { display: flex; align-items: center; gap: 6rpx; }
.ts-sub { font-size: 20rpx; opacity: 0.7; }

.member-item { 
	display: flex; 
	align-items: center; 
	padding: 24rpx; 
	border-bottom: 1rpx solid #F0F0F0;
	&:last-child {
		border-bottom: none;
	}
}
.member-rank {
	width: 40rpx;
	text-align: center;
	font-size: 24rpx;
	font-weight: bold;
	color: #999;
	margin-right: 16rpx;
}
.m-avatar {
	width: 88rpx; 
	height: 88rpx; 
	background: #E0E7FF; 
	color: $theme-color; 
	border-radius: 50%;
	display: flex; 
	align-items: center; 
	justify-content: center; 
	font-weight: bold; 
	font-size: 32rpx;
	margin-right: 20rpx;
	position: relative;
	&.leader { 
		background: linear-gradient(135deg, #F9D423, #F97316); 
		color: white; 
	}
	.leader-crown {
		position: absolute;
		top: -8rpx;
		right: -8rpx;
		font-size: 24rpx;
	}
}
.m-info { 
	flex: 1; 
	display: flex;
	flex-direction: column;
	gap: 6rpx;
}
.m-name-row {
	display: flex;
	align-items: center;
	gap: 8rpx;
}
.m-name { 
	font-size: 30rpx; 
	font-weight: 500; 
	color: #333;
}
.leader-tag { 
	font-size: 20rpx; 
	background: #FEF3C7; 
	color: #D97706; 
	padding: 2rpx 10rpx; 
	border-radius: 8rpx; 
}
.member-tag {
  font-size: 20rpx;
  background: #E0E7FF;
  color: #4C8AF2;
  padding: 2rpx 10rpx;
  border-radius: 8rpx;
}
.m-id { 
	font-size: 24rpx; 
	color: #888; 
}
.m-score {
	margin-top: 4rpx;
	.score-text {
		font-size: 22rpx;
		color: #4C8AF2;
		font-weight: 500;
	}
}
.m-contribution { 
	text-align: center;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 8rpx;
}
.contribution-circle {
	width: 80rpx;
	height: 80rpx;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	.c-val {
		font-size: 24rpx;
		font-weight: bold;
		color: white;
	}
}
.c-lbl { 
	font-size: 20rpx; 
	color: #888; 
}

.stats-grid {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 20rpx;
}
.stat-card {
	padding: 30rpx;
	border-radius: 20rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	text-align: center;
	.stat-icon-wrapper {
		margin-bottom: 12rpx;
		width: 56rpx;
		height: 56rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(255,255,255,0.5);
		border-radius: 50%;
	}
	.stat-card-label {
		font-size: 24rpx;
		color: #666;
		margin-bottom: 12rpx;
	}
	.stat-card-value {
		font-size: 44rpx;
		font-weight: bold;
	}
}

.card-subtitle {
	font-size: 24rpx;
	color: #999;
	margin-left: auto;
}

.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 100rpx 40rpx;
	background: $card-bg;
	border-radius: 24rpx;
	margin-bottom: 30rpx;
	.empty-text {
		margin-top: 24rpx;
		font-size: 28rpx;
		color: #888;
	}
	.empty-hint {
		margin-top: 12rpx;
		font-size: 24rpx;
		color: #BBB;
	}
}

.empty-state-small {
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 60rpx 40rpx;
	.empty-text-small {
		font-size: 26rpx;
		color: #888;
	}
}
</style>