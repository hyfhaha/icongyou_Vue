import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useAuthStore } from './authStore';

export const useCourseContextStore = defineStore('courseContext', () => {
  // ==========================================
  // 1. 课程列表数据 (用于 CourseListView)
  // ==========================================
  const courseList = ref([]);

  const fetchCourseList = () => {
    // [数据对齐]: courseType 对应数据库 course.course_type (1=实训 2=活动 3=必修 4=选修 5=公共基础)
    courseList.value = [
      { 
        courseId: 1001, 
        courseName: '软件产品构建实训', 
        teacher: '张老师', 
        cover: '', 
        progress: 45, 
        courseType: 1, 
        semester: '2025春季',
        studentCount: 42,
        taskCount: 25 
      },
      { 
        courseId: 1002, 
        courseName: '大学生职业规划', 
        teacher: '王老师', 
        cover: '', 
        progress: 10, 
        courseType: 5, 
        semester: '2025春季',
        studentCount: 120,
        taskCount: 5 
      },
      { 
        courseId: 1003, 
        courseName: '高级Web开发', 
        teacher: '李老师', 
        cover: '', 
        progress: 80, 
        courseType: 4, 
        semester: '2024秋季',
        studentCount: 30,
        taskCount: 12 
      },
      {
        courseId: 1004,
        courseName: '数据结构与算法',
        teacher: '赵老师', 
        cover: '', 
        progress: 100, 
        courseType: 3, 
        semester: '2024秋季',
        studentCount: 60, 
        taskCount: 20 
      }
    ];
  };

  // ==========================================
  // 2. 单课上下文 (用于 CourseHomeView, Kanban, Dashboard)
  // ==========================================
  
  // 当前课程基本信息
  const currentCourse = ref({
    courseId: null,
    courseName: '',
    teacher: '',
    semester: ''
  });

  // 任务统计数据 (替代页面写死数据)
  const taskStats = ref({
    totalTasks: 0,      // 总任务数
    completedTasks: 0,  // 已完成数
    completionRate: 0   // 完成率百分比
  });

  // 个人在该课程的数据 (支撑 DataDashboardView 个人Tab)
  const personalData = ref({
    totalScore: 0,
    avgScore: 0,
    rank: 0,
    rankPercent: 0
  });

  // 能力维度
  const abilityDimensions = ref([]);

  // 我的团队信息 (对应 course_group)
  const myTeam = ref({
    id: null,
    groupName: '',
    totalScore: 0
  });

  // 团队成员 (对应 course_student)
  const teamMembers = ref([]);

  // 任务节点 (对应 course_map_story，用于 Kanban)
  const taskNodes = ref([]);

  // 地图元数据 (用于渲染二维表格表头，包含毕业要求 Goals 和 史诗 Epics)
  const mapMetaData = ref({
    releases: [], // 纵轴：阶段
    goals: [],    // 横轴第一层：毕业要求
    epics: []     // 横轴第二层：史诗
  });

  // 当前选中的任务详情 (用于 TaskDetailView)
  const currentTask = ref({
    id: null,
    storyName: '',
    storyDesc: '',
    totalScore: 0,
    deadline: '',
    status: '',
    storyType: 1
  });

  // ==========================================
  // 3. 任务延伸数据 (用于 Analytics & ExcellentWorks)
  // ==========================================

  // 单任务数据看板
  const currentTaskAnalytics = ref({
    submittedCount: 0,
    totalStudents: 0,
    submissionRate: 0,
    viewCount: 0,
    discussionCount: 0,
    pendingCount: 0
  });

  // 优秀作业列表
  const excellentWorksList = ref([]);

  // ==========================================
  // Actions
  // ==========================================
  
  // 初始化上下文 (进入课程时调用)
  const initCourseContext = (courseId) => {
    console.log('初始化课程上下文:', courseId);
    
    // 1. 模拟获取课程详情
    currentCourse.value = { 
      courseId, 
      courseName: '软件产品构建实训', 
      teacher: '张老师',
      semester: '2025春季'
    };

    // 2. 计算任务统计
    const total = 25; 
    const completed = 8; 
    taskStats.value = {
      totalTasks: total,
      completedTasks: completed,
      completionRate: Math.round((completed / total) * 100)
    };
    
    // 3. 个人成绩 (Mock)
    personalData.value = { totalScore: 312, avgScore: 286, rank: 4, rankPercent: 15 };
    abilityDimensions.value = [
      { id: 1, label: '团队协作', value: 82, color: '#4C8AF2' },
      { id: 2, label: '方案设计', value: 75, color: '#9B59B6' },
      { id: 3, label: '软件构建', value: 68, color: '#2ECC71' }
    ];

    // 4. 团队信息 (Mock)
    myTeam.value = { id: 101, groupName: '追梦小队', totalScore: 85 };
    teamMembers.value = [
      { id: 1, name: '张三', studentId: '2021001', isLeader: true, contribution: 25, avatarUrl: '' },
      { id: 2, name: '李四', studentId: '2021002', isLeader: false, contribution: 25, avatarUrl: '' },
      { id: 3, name: '王五', studentId: '2021003', isLeader: false, contribution: 25, avatarUrl: '' },
      { id: 4, name: '赵六', studentId: '2021004', isLeader: false, contribution: 25, avatarUrl: '' }
    ];

    // 5. 地图元数据 (支持双层表头)
    mapMetaData.value = {
        releases: [
            { id: 1, name: '阶段一：启动' },
            { id: 2, name: '阶段二：迭代开发' },
            { id: 3, name: '阶段三：交付与复盘' }
        ],
        // 第一层表头：毕业要求
        goals: [
            { id: 'G1', name: '能够胜任团队角色' },
            { id: 'G2', name: '考虑社会与文化' },
            { id: 'G3', name: '持续改进构建软件' },
            { id: 'G4', name: '分析解释数据' },
            { id: 'G5', name: '交付有效成果' }
        ],
        // 第二层表头：任务集合 (关联 goalId)
        epics: [
            { id: 101, name: '团队协作', goalId: 'G1' },
            { id: 102, name: '产品规划', goalId: 'G2' },
            { id: 103, name: '子系统1', goalId: 'G3' },
            { id: 104, name: '子系统2', goalId: 'G3' },
            { id: 105, name: '子系统3', goalId: 'G3' },
            { id: 106, name: '进度质量', goalId: 'G4' },
            { id: 107, name: '个体提升', goalId: 'G5' }
        ]
    };

    // 6. 任务节点 (x对应epics索引, y对应releases索引)
    taskNodes.value = [
      // --- 阶段一 (y=0) ---
      { id: 'T0', storyName: '启动课程', storyType: 1, x: 0, y: 0, status: 'completed', deadline: '11-01', totalScore: 10, storyDesc: '完成课程导入与分组' },
      { id: 'T1', storyName: '团队组建', storyType: 1, x: 0, y: 0, status: 'completed', deadline: '11-02', totalScore: 20, storyDesc: '确定队员与角色分工' },
      { id: 'T2', storyName: '商模设计', storyType: 2, x: 1, y: 0, status: 'completed', deadline: '11-05', totalScore: 50, storyDesc: '分析市场竞品优劣势' },
      { id: 'T3', storyName: '故事地图', storyType: 2, x: 1, y: 0, status: 'completed', deadline: '11-06', totalScore: 50, storyDesc: '用户故事梳理' },
      { id: 'P1', storyName: '前测', storyType: 1, x: 6, y: 0, status: 'completed', deadline: '11-10', totalScore: 10, storyDesc: '能力摸底测试' },

      // --- 阶段二 (y=1) ---
      { id: 'T4-1', storyName: '爱从游(学生)', storyType: 2, x: 2, y: 1, status: 'in-progress', deadline: '11-30', totalScore: 200, storyDesc: '核心功能开发' },
      { id: 'T4-2', storyName: '爱从游(教师)', storyType: 2, x: 3, y: 1, status: 'in-progress', deadline: '11-30', totalScore: 200, storyDesc: '教师端开发' },
      { id: 'T4-3', storyName: '爱从游(企业)', storyType: 2, x: 4, y: 1, status: 'upcoming', deadline: '11-30', totalScore: 200, storyDesc: '企业端开发' },
      
      { id: 'T5-1', storyName: '机器人(声纹)', storyType: 2, x: 2, y: 1, status: 'upcoming', deadline: '11-30', totalScore: 150, storyDesc: '声纹识别模块' },
      { id: 'T5-2', storyName: '机器人(虚拟)', storyType: 2, x: 3, y: 1, status: 'upcoming', deadline: '11-30', totalScore: 150, storyDesc: '虚拟仿真模块' },
      { id: 'T5-3', storyName: '机器人(网络)', storyType: 2, x: 4, y: 1, status: 'upcoming', deadline: '11-30', totalScore: 150, storyDesc: '网络通信模块' },

      { id: 'T6-1', storyName: '智慧课程(脑)', storyType: 2, x: 2, y: 1, status: 'upcoming', deadline: '11-30', totalScore: 180, storyDesc: '知识图谱构建' },
      { id: 'T6-2', storyName: '智慧课程(导)', storyType: 2, x: 3, y: 1, status: 'upcoming', deadline: '11-30', totalScore: 180, storyDesc: '学习路径推荐' },
      
      { id: 'T9', storyName: '燃尽图', storyType: 3, x: 5, y: 1, status: 'in-progress', deadline: '11-30', totalScore: 50, storyDesc: '每日更新进度' },
      { id: 'T10', storyName: '集成测试', storyType: 3, x: 5, y: 1, status: 'upcoming', deadline: '11-30', totalScore: 80, storyDesc: '全系统集成测试' },

      // --- 阶段三 (y=2) ---
      { id: 'T11', storyName: '产品回顾会', storyType: 2, x: 0, y: 2, status: 'upcoming', deadline: '11-30', totalScore: 30, storyDesc: 'Sprint Review' },
      { id: 'T12', storyName: '交付/联合', storyType: 2, x: 0, y: 2, status: 'upcoming', deadline: '11-30', totalScore: 50, storyDesc: '最终产物提交' },
      { id: 'P2', storyName: '后测', storyType: 1, x: 6, y: 2, status: 'upcoming', deadline: '11-28', totalScore: 10, storyDesc: '能力结课测试' },
      { id: 'P3', storyName: '总结报告', storyType: 1, x: 6, y: 2, status: 'upcoming', deadline: '11-30', totalScore: 40, storyDesc: '个人心得体会' }
    ];
  };

  // 选中任务
  const selectTask = (taskId) => {
    const task = taskNodes.value.find(t => t.id === taskId);
    if (task) {
      currentTask.value = task;
    } else {
      // 没找到时给默认值防止报错
      currentTask.value = {
        id: taskId,
        storyName: '未知任务',
        storyDesc: '暂无描述',
        totalScore: 0,
        deadline: '-',
        status: 'upcoming',
        storyType: 1
      };
    }
  };

  // 权限检查
  const checkSubmissionPermission = () => {
    const authStore = useAuthStore();
    const currentUserJobNumber = authStore.userInfo.jobNumber;
    
    const myRole = teamMembers.value.find(m => m.studentId === currentUserJobNumber);
    
    if (!myRole && currentTask.value.storyType !== 1) {
        return { allowed: false, reason: '未加入团队' };
    }

    const type = currentTask.value.storyType;

    if (type === 1) {
        return { allowed: true, reason: '' };
    } else if (type === 2) {
        if (myRole && myRole.isLeader) {
            return { allowed: true, reason: '' };
        } else {
            return { allowed: false, reason: '本任务仅限队长提交' };
        }
    } else if (type === 3) {
        return { allowed: true, reason: '' };
    }
    
    return { allowed: true, reason: '' };
  };

  // 修改贡献度
  const updateMemberContribution = (memberId, delta) => {
    const member = teamMembers.value.find(m => m.id === memberId);
    if (member) {
      let val = member.contribution + delta;
      if (val >= 0 && val <= 100) member.contribution = val;
    }
  };

  // [核心修改] 更新任务状态 & 全链路同步
  const updateTaskStatus = (taskId, newStatus) => {
    console.log(`[Store] 更新任务 ${taskId} 状态为 ${newStatus}`);
    
    const authStore = useAuthStore(); 

    // 1. 更新地图节点状态
    const task = taskNodes.value.find(t => t.id === taskId);
    if (task) {
        const isNewCompletion = (task.status !== 'completed' && task.status !== 'submitted') && 
                                (newStatus === 'completed' || newStatus === 'submitted');

        if (isNewCompletion) {
            // 2. 【首页 CourseHomeView 同步】
            taskStats.value.completedTasks++;
            taskStats.value.completionRate = Math.round((taskStats.value.completedTasks / taskStats.value.totalTasks) * 100);
            
            // 3. 【看板 TaskAnalyticsView 同步】
            if (currentTaskAnalytics.value.totalStudents > 0) {
                currentTaskAnalytics.value.submittedCount++;
                currentTaskAnalytics.value.pendingCount--;
                currentTaskAnalytics.value.submissionRate = Math.round((currentTaskAnalytics.value.submittedCount / currentTaskAnalytics.value.totalStudents) * 100);
            }

            // 4. 【列表 CourseListView 同步】
            const listItem = courseList.value.find(c => c.courseId === currentCourse.value.courseId);
            if (listItem) {
                listItem.progress = taskStats.value.completionRate;
            }

            // 5. 【个人中心 ProfileView 同步】
            authStore.userStats.completedTasks++;
        }
        
        task.status = newStatus;
    }

    // 6. 【详情页 TaskDetailView 同步】
    if (currentTask.value.id === taskId) {
        currentTask.value.status = newStatus;
    }
  };

  // 获取单任务统计数据
  const fetchTaskAnalytics = (taskId) => {
    console.log('获取任务统计:', taskId);
    const total = 36; 
    const submitted = 18;
    currentTaskAnalytics.value = {
      submittedCount: submitted,
      totalStudents: total,
      submissionRate: Math.round((submitted / total) * 100),
      pendingCount: total - submitted,
      viewCount: 240, 
      discussionCount: 63 
    };
  };

  // 获取优秀作业
  const fetchExcellentWorks = (taskId) => {
    console.log('获取优秀作业:', taskId);
    excellentWorksList.value = [
      {
        id: 201,
        studentName: '张晓雨', 
        teamName: '追梦小队',  
        score: 198,
        title: '多课程导览交互稿',
        summary: '通过卡片式导览设计实现课程概要...',
        teacherComment: '清晰突出核心指标，交互逻辑符合工程认证的能力维度拆解。',
        attachments: ['交互稿.fig', '说明文档.pdf'],
        likes: 32,
        isLiked: false,
        isCollected: false,
        avatarChar: '张'
      },
      {
        id: 202,
        studentName: '李晨',
        teamName: '凌云队',
        score: 194,
        title: '任务数据可视化方案',
        summary: '构建提交率、讨论热度双指标体系...',
        teacherComment: '指标拆解完整，颜色体系突出重要程度。',
        attachments: ['数据设计.xlsx'],
        likes: 26,
        isLiked: true,
        isCollected: true,
        avatarChar: '李'
      }
    ];
  };

  // 点赞
  const toggleWorkLike = (workId) => {
    const work = excellentWorksList.value.find(w => w.id === workId);
    if (work) {
      work.isLiked = !work.isLiked;
      work.likes += work.isLiked ? 1 : -1;
    }
  };

  // 收藏
  const toggleWorkCollect = (workId) => {
    const work = excellentWorksList.value.find(w => w.id === workId);
    if (work) {
      work.isCollected = !work.isCollected;
    }
  };

  return {
    // State
    courseList,
    currentCourse,
    taskStats,
    personalData,
    abilityDimensions,
    myTeam,
    teamMembers,
    taskNodes,
    mapMetaData, // 确保导出
    currentTask,
    currentTaskAnalytics,
    excellentWorksList,
    
    // Actions
    fetchCourseList,
    initCourseContext,
    selectTask,
    checkSubmissionPermission,
    updateMemberContribution,
    updateTaskStatus,
    fetchTaskAnalytics,
    fetchExcellentWorks,
    toggleWorkLike,
    toggleWorkCollect
  };
});