import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useAuthStore } from './authStore';
import {
  getCourseList as getCourseOverview,
  getCourseDetail,
  getCoursePersonalStats,
  getCourseAbilities,
  getCourseMapMetadata
} from '@/api/course';
import { getTasksByCourse, getTaskDetail, getTaskBoard } from '@/api/task';
import { getMyTeams, getTeamDetail } from '@/api/team';
import {
  getExcellentWorks,
  likeExcellentWork,
  bookmarkExcellentWork
} from '@/api/excellent';

const toPercent = (value) => {
  if (value === undefined || value === null) return 0;
  const num = Number(value);
  if (Number.isNaN(num)) return 0;
  return num > 1 ? Math.round(num) : Math.round(num * 100);
};

const deriveTaskStatus = (task) => {
  if (task.status) return task.status;
  if (task.done) return 'completed';
  return task.story_type === 1 ? 'in-progress' : 'upcoming';
};

const mapTaskNode = (task) => ({
  id: task.id,
  storyName: task.story_name || task.storyName || task.title || `任务${task.id}`,
  storyDesc: task.story_desc || task.storyDesc || '',
  totalScore: task.total_score ?? task.totalScore ?? 0,
  deadline: task.end_time || task.deadline || '',
  storyType: task.story_type ?? task.storyType ?? 1,
  status: deriveTaskStatus(task),
  x: (task.position_x ?? 1) - 1,
  y: (task.position_y ?? 1) - 1,
  goalId: task.goal_id || task.goalId || null,
  epicId: task.epic_id || task.epicId || null,
  releaseId: task.release_id || task.releaseId || null
});

// [修改] 兼容后端返回的 course_id, course_name, complete_percent 等字段
const mapCourseListItem = (course) => ({
  courseId: course.courseId || course.id || course.course_id,
  courseName: course.courseName || course.name || course.course_name || '未命名课程',
  teacher: course.teacherName || course.teacher || '',
  cover: course.coverUrl || course.course_pic || '',
  progress: toPercent(course.progress ?? course.complete_percent),
  courseType: course.courseType || 0,
  semester: course.semester || course.semester_label || '',
  studentCount: course.studentCount ?? 0,
  taskCount: course.totalTasks ?? course.taskCount ?? course.total_tasks ?? 0
});

export const useCourseContextStore = defineStore('courseContext', () => {
  const authStore = useAuthStore();

  const courseList = ref([]);
  const courseListLoading = ref(false);
  const currentCourseId = ref(null);

  const currentCourse = ref({
    courseId: null,
    courseName: '',
    teacher: '',
    semester: ''
  });

  const taskStats = ref({
    totalTasks: 0,
    completedTasks: 0,
    completionRate: 0
  });

  const personalData = ref({
    totalScore: 0,
    avgScore: 0,
    rank: 0,
    rankPercent: 0,
    studentCount: 0
  });

  const abilityDimensions = ref([]);
  const myTeam = ref({
    id: null,
    groupName: '',
    totalScore: 0
  });
  const teamMembers = ref([]);

  const taskNodes = ref([]);
  const mapMetaData = ref({
    releases: [],
    goals: [],
    epics: []
  });

  const currentTask = ref({
    id: null,
    storyName: '',
    storyDesc: '',
    totalScore: 0,
    deadline: '',
    status: '',
    storyType: 1,
    permission: null,
    myWork: null,
    materials: [],
    viewCount: 0
  });

  const currentTaskAnalytics = ref({
    submittedCount: 0,
    totalStudents: 0,
    submissionRate: 0,
    pendingCount: 0,
    viewCount: 0,
    discussionCount: 0
  });

  const excellentWorksList = ref([]);

  const showError = (title, err) => {
    console.warn(title, err);
    uni.showToast({ title, icon: 'none' });
  };

  const recomputeTaskStats = (tasks = []) => {
    const total = tasks.length;
    const completed = tasks.filter((t) => ['completed', 'submitted'].includes(t.status)).length;
    taskStats.value = {
      totalTasks: total,
      completedTasks: completed,
      completionRate: total ? Math.round((completed / total) * 100) : 0
    };
  };

  const fetchCourseList = async (params = {}) => {
    if (!authStore.token) {
      courseList.value = [];
      return;
    }
    courseListLoading.value = true;
    try {
      const data = await getCourseOverview(params);
      // [修改] 兼容后端直接返回数组或返回 { list: [...] } 的情况
      const list = Array.isArray(data) ? data : (data?.list || []);
      courseList.value = list.map(mapCourseListItem);
    } catch (error) {
      showError('获取课程列表失败', error);
    } finally {
      courseListLoading.value = false;
    }
  };

  const refreshTaskNodes = async (courseId) => {
    try {
      const data = await getTasksByCourse(courseId);
      const tasks = data?.items || data?.list || data || [];
      const mapped = tasks.map(mapTaskNode);
      taskNodes.value = mapped;
      recomputeTaskStats(mapped);
    } catch (error) {
      showError('加载任务列表失败', error);
    }
  };

  const fetchTeamInfo = async (courseId) => {
    try {
      const teams = await getMyTeams();
      const target = (teams || []).find((team) => String(team.courseId) === String(courseId));
      if (!target) {
        myTeam.value = { id: null, groupName: '', totalScore: 0 };
        teamMembers.value = [];
        return;
      }
      myTeam.value = {
        id: target.teamId,
        groupName: target.groupName,
        totalScore: target.score ?? target.totalScore ?? 0
      };
      const detail = await getTeamDetail(target.teamId);
      teamMembers.value = (detail?.members || []).map((member) => ({
        id: member.id,
        name: member.name,
        studentId: member.studentId || member.jobNumber || '',
        isLeader: !!member.isLeader,
        contribution: member.contributionRate != null
          ? Math.round(member.contributionRate * 100)
          : member.contribution ?? 0,
        score: member.score ?? 0
      }));
    } catch (error) {
      console.warn('获取团队数据失败', error);
    }
  };

  const initCourseContext = async (courseId) => {
    if (!courseId) return;
    currentCourseId.value = courseId;
    try {
      const [detail, personal, abilities, mapMeta] = await Promise.all([
        getCourseDetail(courseId),
        getCoursePersonalStats(courseId).catch(() => null),
        getCourseAbilities(courseId).catch(() => []),
        getCourseMapMetadata(courseId).catch(() => ({ releases: [], goals: [], epics: [] }))
      ]);

      const coursePayload = detail?.course || detail || {};
      currentCourse.value = {
        courseId,
        courseName: coursePayload.courseName || coursePayload.name || '未命名课程',
        teacher: coursePayload.teacher || coursePayload.teacherName || '',
        semester: coursePayload.semester || ''
      };

      personalData.value = {
        totalScore: personal?.totalScore ?? 0,
        avgScore: personal?.avgScore ?? personal?.averageScore ?? 0,
        rank: personal?.rank ?? 0,
        rankPercent: toPercent(personal?.rankPercent),
        studentCount: personal?.studentCount ?? 0
      };

      abilityDimensions.value = (abilities || []).map((item, index) => ({
        id: item.abilityKey || item.id || index,
        label: item.abilityName || item.label || `能力 ${index + 1}`,
        value: item.achievementRate != null
          ? Math.round(item.achievementRate * 100)
          : Math.round(item.score ?? 0),
        color: item.color || ['#4C8AF2', '#9B59B6', '#2ECC71'][index % 3]
      }));

      mapMetaData.value = {
        releases: (mapMeta?.releases || []).map((release) => ({
          id: release.id,
          name: release.release_name || release.releaseName || release.name || ''
        })),
        goals: (mapMeta?.goals || []).map((goal) => ({
          id: goal.id,
          name: goal.goal_name || goal.goalName || goal.name || '',
          sort: goal.sort ?? 0
        })),
        epics: (mapMeta?.epics || []).map((epic) => ({
          id: epic.id,
          name: epic.epic_name || epic.epicName || epic.name || '',
          goalId: epic.goal_id || epic.goalId || null
        }))
      };

      await Promise.all([
        refreshTaskNodes(courseId),
        fetchTeamInfo(courseId)
      ]);
    } catch (error) {
      showError('加载课程数据失败', error);
      throw error;
    }
  };

  const formatTaskDetail = (detail = {}) => {
    const story = detail.story || detail;
    return {
      id: story.id,
      storyName: story.story_name || story.storyName || story.title || `任务${story.id}`,
      storyDesc: story.story_desc || story.storyDesc || '',
      totalScore: story.total_score ?? story.totalScore ?? 0,
      deadline: story.end_time || story.deadline || '',
      status: deriveTaskStatus(story),
      storyType: story.story_type ?? story.storyType ?? 1,
      permission: detail.permission || null,
      myWork: detail.myWork || null,
      materials: detail.materials || [],
      viewCount: detail.viewCount ?? 0
    };
  };

  const selectTask = async (taskId) => {
    if (!taskId) return;
    const fallback = taskNodes.value.find((task) => task.id === taskId);
    if (fallback) {
      currentTask.value = { ...fallback, permission: null, myWork: null, materials: [], viewCount: 0 };
    }
    try {
      const detail = await getTaskDetail(taskId);
      currentTask.value = formatTaskDetail(detail);
    } catch (error) {
      if (!fallback) {
        currentTask.value = {
          id: taskId,
          storyName: '未知任务',
          storyDesc: '',
          totalScore: 0,
          deadline: '',
          status: 'upcoming',
          storyType: 1,
          permission: null,
          myWork: null,
          materials: [],
          viewCount: 0
        };
      }
      showError('获取任务详情失败', error);
    }
  };

  const checkSubmissionPermission = () => {
    if (currentTask.value?.permission) {
      const permission = currentTask.value.permission;
      return {
        allowed: permission.allowed !== false,
        reason: permission.reason || '',
        teamRequired: !!permission.teamRequired,
        onlyLeaderCanSubmit: !!permission.onlyLeaderCanSubmit
      };
    }
    const currentUserJobNumber = authStore.userInfo.jobNumber;
    const myRole = teamMembers.value.find((member) => member.studentId === currentUserJobNumber);
    if (!myRole && currentTask.value.storyType !== 1) {
      return { allowed: false, reason: '未加入团队' };
    }
    if (currentTask.value.storyType === 2 && myRole && !myRole.isLeader) {
      return { allowed: false, reason: '本任务仅限队长提交' };
    }
    return { allowed: true, reason: '' };
  };

  const updateMemberContribution = (memberId, delta) => {
    const member = teamMembers.value.find((m) => m.id === memberId);
    if (member) {
      const next = member.contribution + delta;
      if (next >= 0 && next <= 100) member.contribution = next;
    }
  };

  const updateTaskStatus = (taskId, newStatus) => {
    const task = taskNodes.value.find((t) => t.id === taskId);
    if (task) {
      const wasCompleted = ['completed', 'submitted'].includes(task.status);
      task.status = newStatus;
      const nowCompleted = ['completed', 'submitted'].includes(newStatus);
      if (!wasCompleted && nowCompleted) {
        taskStats.value.completedTasks += 1;
        taskStats.value.completionRate = taskStats.value.totalTasks
          ? Math.round((taskStats.value.completedTasks / taskStats.value.totalTasks) * 100)
          : 0;
        const courseCard = courseList.value.find((c) => c.courseId === currentCourse.value.courseId);
        if (courseCard) {
          courseCard.progress = taskStats.value.completionRate;
        }
        authStore.userStats.completedTasks += 1;
        if (currentTaskAnalytics.value.totalStudents > 0) {
          currentTaskAnalytics.value.submittedCount += 1;
          currentTaskAnalytics.value.pendingCount = Math.max(
            currentTaskAnalytics.value.totalStudents - currentTaskAnalytics.value.submittedCount,
            0
          );
          currentTaskAnalytics.value.submissionRate = Math.round(
            (currentTaskAnalytics.value.submittedCount / currentTaskAnalytics.value.totalStudents) * 100
          );
        }
      }
    }
    if (currentTask.value.id === taskId) {
      currentTask.value.status = newStatus;
    }
  };

  const fetchTaskAnalytics = async (taskId) => {
    const targetId = taskId || currentTask.value.id;
    if (!targetId) return;
    try {
      const data = await getTaskBoard(targetId);
      const submitted = data?.submissionStats?.submittedCount ?? 0;
      const total = data?.submissionStats?.studentCount ?? 0;
      currentTaskAnalytics.value = {
        submittedCount: submitted,
        totalStudents: total,
        submissionRate: data?.submissionStats?.submissionRate != null
          ? toPercent(data.submissionStats.submissionRate)
          : (total ? Math.round((submitted / total) * 100) : 0),
        pendingCount: Math.max(total - submitted, 0),
        viewCount: data?.heat?.viewCount ?? 0,
        discussionCount: data?.heat?.discussionCount ?? 0
      };
    } catch (error) {
      showError('获取任务统计失败', error);
    }
  };

  const fetchExcellentWorks = async (taskId) => {
    const targetId = taskId || currentTask.value.id;
    if (!targetId) return;
    try {
      const list = await getExcellentWorks(targetId);
      excellentWorksList.value = (list || []).map((item) => ({
        id: item.workId || item.id,
        studentName: item.student?.name || item.studentName || '',
        teamName: item.teamName || '',
        score: item.score ?? 0,
        title: item.title || item.summary || '',
        summary: item.summary || '',
        teacherComment: item.teacherComment || '',
        attachments: item.attachments || [],
        likes: item.likeCount ?? item.likes ?? 0,
        isLiked: item.liked ?? false,
        isCollected: item.bookmarked ?? item.favorited ?? false,
        avatarChar: (item.student?.name || item.studentName || '').charAt(0) || ''
      }));
    } catch (error) {
      showError('获取优秀作业失败', error);
    }
  };

  const toggleWorkLike = async (workId) => {
    const taskId = currentTask.value.id;
    if (!taskId) return;
    const work = excellentWorksList.value.find((item) => item.id === workId);
    if (!work) return;
    try {
      const result = await likeExcellentWork(taskId, workId);
      if (result) {
        work.isLiked = result.liked ?? work.isLiked;
        if (result.likeCount != null) {
          work.likes = result.likeCount;
        } else {
          work.likes += work.isLiked ? 1 : -1;
        }
      }
    } catch (error) {
      showError('点赞失败', error);
    }
  };

  const toggleWorkCollect = async (workId) => {
    const taskId = currentTask.value.id;
    if (!taskId) return;
    const work = excellentWorksList.value.find((item) => item.id === workId);
    if (!work) return;
    try {
      const result = await bookmarkExcellentWork(taskId, workId);
      if (result) {
        work.isCollected = result.bookmarked ?? !work.isCollected;
      } else {
        work.isCollected = !work.isCollected;
      }
    } catch (error) {
      showError('收藏失败', error);
    }
  };

  return {
    courseList,
    courseListLoading,
    currentCourse,
    currentCourseId,
    taskStats,
    personalData,
    abilityDimensions,
    myTeam,
    teamMembers,
    taskNodes,
    mapMetaData,
    currentTask,
    currentTaskAnalytics,
    excellentWorksList,
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