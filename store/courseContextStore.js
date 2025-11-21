import { defineStore } from 'pinia';
import { ref } from 'vue';

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
        taskCount: 18
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

  // 当前选中的任务详情 (用于 TaskDetailView)
  const currentTask = ref({
    id: null,
    storyName: '',
    storyDesc: '',
    totalScore: 0,
    deadline: '',
    status: ''
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
    const total = 18; 
    const completed = 12; 
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

    // 5. 任务节点 (Mock - 对应 DB course_map_story)
    taskNodes.value = [
      { id: 'T0', storyName: '启动会议', positionX: 0, positionY: 0, status: 'completed', deadline: '2025-11-01', storyDesc: '完成课程导入与分组', totalScore: 10 },
      { id: 'T4-1', storyName: '爱从游（学生移动端）', positionX: 4, positionY: 3, status: 'in-progress', deadline: '2025-11-30', storyDesc: '实现点阵地图与AI入口', totalScore: 200 }
    ];
  };

  // 选中任务
  const selectTask = (taskId) => {
    const task = taskNodes.value.find(t => t.id === taskId);
    if (task) {
      currentTask.value = task;
    } else {
      currentTask.value = {
        id: taskId,
        storyName: '未知任务',
        storyDesc: '暂无描述',
        totalScore: 0,
        deadline: '-',
        status: 'upcoming'
      };
    }
  };

  // 修改贡献度
  const updateMemberContribution = (memberId, delta) => {
    const member = teamMembers.value.find(m => m.id === memberId);
    if (member) {
      let val = member.contribution + delta;
      if (val >= 0 && val <= 100) member.contribution = val;
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
        summary: '通过卡片式导览设计实现课程概要、进度与热度的统一呈现...',
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
        summary: '构建提交率、讨论热度双指标体系，并提供 AI 答疑入口。',
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
    courseList,
    currentCourse,
    taskStats,
    personalData,
    abilityDimensions,
    myTeam,
    teamMembers,
    taskNodes,
    currentTask,
    currentTaskAnalytics,
    excellentWorksList,
    fetchCourseList,
    initCourseContext,
    selectTask,
    updateMemberContribution,
    fetchTaskAnalytics,
    fetchExcellentWorks,
    toggleWorkLike,
    toggleWorkCollect
  };
});