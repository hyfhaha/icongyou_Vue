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
  // 如果后端直接返回了 status 字段，优先使用
  if (task.status) return task.status;
  
  // 检查截止时间
  let isOverdue = false;
  if (task.end_time || task.deadline) {
    try {
      const deadline = new Date(task.end_time || task.deadline);
      const now = new Date();
      isOverdue = deadline.getTime() < now.getTime();
    } catch (e) {
      // 日期解析失败，忽略
    }
  }
  
  // 如果已提交，根据 work_status 和是否逾期判断
  if (task.done || task.work_status !== null) {
    // work_status: 1=已点评(completed), 0=未点评(submitted), null=未提交
    if (task.work_status === 1) {
      return 'completed';  // 已点评，直接返回已完成
    } else if (task.work_status === 0 || task.done) {
      // 已提交但未点评：如果过了截止时间，也视为已完成
      if (isOverdue) {
        return 'completed';
      }
      return 'submitted';  // 未过截止时间，返回已提交
    }
  }
  
  // 未提交且已逾期
  if (isOverdue) {
    return 'overdue';
  }
  
  // 未提交且未逾期：根据任务类型判断
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
  
  required: task.required !== 0,
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
  teacher: course.teacherName || course.teacher || course.teacher_names || '',
  cover: course.coverUrl || course.course_pic || '',
  progress: toPercent(course.progress ?? course.complete_percent),
  courseType: course.courseType ?? course.course_type ?? 0, // 使用 ?? 确保 0 也是有效值
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
      teamMembers.value = (detail?.members || []).map((member) => {
        // 兼容多种学号字段命名方式
        const studentId = member.studentId || member.jobNumber || member.job_number || '';
        
        // 重要：member.id 是 course_student 表的 id（如 10001），不是用户ID
        // member.student_id 才是用户ID（user.id，如 17）
        // 后端返回的数据中，student_id 字段就是用户ID
        
        console.log('团队成员数据:', {
          id: member.id, // course_student.id
          student_id: member.student_id, // user.id（用户ID）
          name: member.name,
          studentId: studentId, // 学号
          jobNumber: member.jobNumber,
          job_number: member.job_number
        });
        
        return {
          id: member.id, // course_student.id（保留用于其他用途）
          userId: member.student_id, // 用户ID（user.id），用于提交时匹配贡献度
          name: member.name,
          studentId: studentId, // 学号
          isLeader: !!member.isLeader,
          contribution: member.contributionRate != null
            ? Math.round(member.contributionRate * 100)
            : member.contribution ?? 0,
          score: member.score ?? 0
        };
      });
    } catch (error) {
      console.warn('获取团队数据失败', error);
    }
  };

  const initCourseContext = async (courseId) => {
    if (!courseId) {
      console.warn('⚠️ 课程ID为空，无法初始化');
      return;
    }
    
    currentCourseId.value = courseId;
    
    // 保存到本地存储，防止刷新后丢失
    try {
      uni.setStorageSync('currentCourseId', courseId);
    } catch (e) {
      console.warn('保存课程ID到本地存储失败', e);
    }
    
    try {
      console.log('🔄 开始初始化课程上下文，课程ID:', courseId);
      
      // 使用 Promise.allSettled 确保即使某些请求失败，其他请求仍能继续
      const results = await Promise.allSettled([
        getCourseDetail(courseId).catch(err => {
          console.error('❌ 获取课程详情失败:', err);
          return null;
        }),
        getCoursePersonalStats(courseId).catch(err => {
          console.error('❌ 获取个人统计数据失败:', err);
          return null;
        }),
        getCourseAbilities(courseId).catch(err => {
          console.error('❌ 获取能力维度失败:', err);
          return [];
        }),
        getCourseMapMetadata(courseId).catch(err => {
          console.error('❌ 获取地图元数据失败:', err);
          return { releases: [], goals: [], epics: [] };
        })
      ]);
      
      const [detailResult, personalResult, abilitiesResult, mapMetaResult] = results;
      const detail = detailResult.status === 'fulfilled' ? detailResult.value : null;
      const personal = personalResult.status === 'fulfilled' ? personalResult.value : null;
      const abilities = abilitiesResult.status === 'fulfilled' ? abilitiesResult.value : [];
      const mapMeta = mapMetaResult.status === 'fulfilled' ? mapMetaResult.value : { releases: [], goals: [], epics: [] };

      const coursePayload = detail?.course || detail || {};
      console.log('📚 课程详情数据:', coursePayload);
      const courseName = coursePayload.courseName || coursePayload.course_name || coursePayload.name || '未命名课程';
      const teacher = coursePayload.teacher || coursePayload.teacher_names || coursePayload.teacherName || '';
      const semester = coursePayload.semester || coursePayload.semester_label || '';
      
      currentCourse.value = {
        courseId,
        courseName,
        teacher,
        semester
      };
      console.log('✅ 设置当前课程:', currentCourse.value);

      console.log('📊 个人数据原始返回:', personal);
      
      // 兼容多种字段命名方式
      const totalScore = personal?.totalScore ?? personal?.total_score ?? 0;
      const avgScore = personal?.avgScore ?? personal?.averageScore ?? personal?.avg_score ?? 0;
      const rank = personal?.rank ?? null;
      const rankPercentRaw = personal?.rankPercent ?? personal?.rank_percent ?? 0;
      const studentCount = personal?.studentCount ?? personal?.student_count ?? 0;
      
      // rankPercent 后端返回的是 0-100 的百分比，直接使用
      const rankPercent = Number(rankPercentRaw);
      
      personalData.value = {
        totalScore: Number(totalScore),
        avgScore: Number(avgScore),
        rank: rank !== null ? Number(rank) : null,
        rankPercent: rankPercent,
        studentCount: Number(studentCount)
      };
      
      console.log('✅ 处理后的个人数据:', personalData.value);

      console.log('🎯 能力维度原始数据:', abilities);
      abilityDimensions.value = (abilities || []).map((item, index) => {
        // 兼容多种字段命名方式
        const abilityName = item.abilityName || item.ability_name || item.label || `能力 ${index + 1}`;
        const achievementRate = item.achievementRate != null 
          ? item.achievementRate 
          : (item.completion_percent != null ? item.completion_percent / 100 : 0);
        const value = Math.round(achievementRate * 100);
        
        // 根据 goal_level 设置不同颜色
        const goalLevel = (item.goalLevel || item.goal_level || '').toUpperCase();
        let color = item.color;
        let levelLabel = '';
        
        if (!color) {
          if (goalLevel === 'H') {
            color = '#E74C3C'; // 红色 - 高优先级
            levelLabel = '高';
          } else if (goalLevel === 'M') {
            color = '#4C8AF2'; // 蓝色 - 中等优先级
            levelLabel = '中';
          } else if (goalLevel === 'L') {
            color = '#95A5A6'; // 灰色 - 低优先级
            levelLabel = '低';
          } else {
            // 未设置级别，使用默认颜色
            color = ['#4C8AF2', '#9B59B6', '#2ECC71', '#F39C12', '#E74C3C'][index % 5];
          }
        }
        
        const mapped = {
          id: item.abilityKey || item.ability_id || item.abilityId || item.id || index,
          label: abilityName,
          value: value,
          color: color,
          goalLevel: goalLevel,
          levelLabel: levelLabel,
          // 添加任务分布信息用于说明
          totalTasks: item.totalTasks || item.total_tasks || 0,
          finishedTasks: item.finishedTasks || item.finished_tasks || 0,
          maxScore: item.maxScore || item.max_score || 0,
          achievedScore: item.achievedScore || item.achieved_score || 0,
          threshold: item.threshold || 70
        };
        console.log(`  能力维度 ${index + 1}:`, mapped);
        return mapped;
      });
      console.log('✅ 设置能力维度数量:', abilityDimensions.value.length);

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

      // 异步加载任务节点和团队信息，但不阻塞主流程
      Promise.allSettled([
        refreshTaskNodes(courseId).catch(err => {
          console.error('❌ 刷新任务节点失败:', err);
        }),
        fetchTeamInfo(courseId).catch(err => {
          console.error('❌ 获取团队信息失败:', err);
        })
      ]).then(() => {
        console.log('✅ 课程上下文初始化完成');
      });
      
    } catch (error) {
      console.error('❌ 初始化课程上下文时发生错误:', error);
      // 不抛出错误，允许部分数据加载失败
      // showError('加载课程数据失败', error);
    }
  };

  const formatTaskDetail = (detail = {}) => {
    const story = detail.story || detail;
    
    // 如果 story 没有 done 或 work_status 字段，但 myWork 存在，则设置
    if (story.done === undefined && detail.myWork) {
      story.done = true;
    }
    if (story.work_status === undefined && detail.myWork) {
      // work_status: 1=已点评, 0=未点评, null=未提交
      story.work_status = detail.myWork.status === 1 ? 1 : 0;
    }
    
    const formatted = {
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
    
    // 如果后端返回了权限信息，记录日志
    if (detail.permission) {
      console.log('✅ 后端返回权限信息:', detail.permission);
    }
    
    return formatted;
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
    // 如果后端返回了权限信息，直接使用
    if (currentTask.value?.permission) {
      const permission = currentTask.value.permission;
      return {
        allowed: permission.allowed !== false,
        reason: permission.reason || '',
        teamRequired: !!permission.teamRequired,
        onlyLeaderCanSubmit: !!permission.onlyLeaderCanSubmit
      };
    }
    
    // 如果没有任务信息，返回不允许
    if (!currentTask.value || !currentTask.value.id) {
      return { allowed: false, reason: '任务信息未加载' };
    }
    
    const storyType = currentTask.value.storyType ?? 1;
    const currentUserJobNumber = authStore.userInfo.jobNumber;
    
    console.log('🔍 检查提交权限:', {
      storyType,
      currentUserJobNumber,
      teamMembersCount: teamMembers.value.length,
      myTeamId: myTeam.value.id,
      teamMembers: teamMembers.value.map(m => ({ id: m.id, studentId: m.studentId, isLeader: m.isLeader }))
    });
    
    // 个人任务（storyType === 1），不需要团队
    if (storyType === 1) {
      return { allowed: true, reason: '' };
    }
    
    // 团队任务（storyType === 2 或 3），需要检查团队信息
    if (storyType === 2 || storyType === 3) {
      // 检查是否有团队
      if (!myTeam.value.id) {
        console.warn('⚠️ 未找到团队信息');
        return { allowed: false, reason: '未加入团队，无法提交团队任务' };
      }
      
      // 检查用户是否在团队成员列表中
      const myRole = teamMembers.value.find((member) => {
        // 兼容多种匹配方式
        const matchByStudentId = member.studentId && String(member.studentId) === String(currentUserJobNumber);
        const matchById = member.id && String(member.id) === String(authStore.userInfo.id);
        return matchByStudentId || matchById;
      });
      
      if (!myRole) {
        console.warn('⚠️ 用户不在团队成员列表中:', {
          currentUserJobNumber,
          userId: authStore.userInfo.id,
          teamMembers: teamMembers.value
        });
        return { allowed: false, reason: '您不是该团队的成员' };
      }
      
      // 团队任务类型 2：仅队长可提交
      if (storyType === 2 && !myRole.isLeader) {
        return { allowed: false, reason: '本任务仅限队长提交' };
      }
      
      // 团队任务类型 3：全员可提交
      return { allowed: true, reason: '' };
    }
    
    // 默认允许
    return { allowed: true, reason: '' };
  };

  const updateMemberContribution = (memberId, delta) => {
    const member = teamMembers.value.find((m) => m.id === memberId);
    if (member) {
      const current = member.contribution || 0;
      const next = current + delta;
      if (next >= 0 && next <= 100) {
        member.contribution = next;
      } else if (next < 0) {
        member.contribution = 0;
      } else {
        member.contribution = 100;
      }
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
      excellentWorksList.value = (list || []).map((item) => {
        // 处理文件名（多个文件用|分隔）
        const fileNames = item.file_name ? item.file_name.split('|').filter(f => f.trim()) : [];
        
        // 获取学生姓名（优先使用submit_name，因为这是提交人名字）
        const studentName = item.submit_name || item.user_name || '';
        
        return {
          id: item.id,
          studentName: studentName,
          teamName: item.group_name || '',
          score: item.score != null ? Number(item.score) : 0,
          title: item.content ? (item.content.length > 50 ? item.content.substring(0, 50) + '...' : item.content) : '优秀作业',
          summary: item.content || '',
          teacherComment: item.content || '', // 评语字段
          attachments: fileNames,
          likes: item.like_count != null ? Number(item.like_count) : 0,
          isLiked: item.liked ?? false,
          isCollected: item.bookmarked ?? item.favorited ?? false,
          avatarChar: studentName.charAt(0) || '?'
        };
      });
    } catch (error) {
      showError('获取优秀作业失败', error);
      excellentWorksList.value = [];
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
    const taskId = currentTask.value?.id;
    if (!taskId) {
      uni.showToast({ title: '任务ID不存在', icon: 'none' });
      return;
    }
    const work = excellentWorksList.value.find((item) => String(item.id) === String(workId));
    if (!work) {
      uni.showToast({ title: '作业不存在', icon: 'none' });
      return;
    }
    try {
      const result = await bookmarkExcellentWork(taskId, workId);
      if (result) {
        work.isCollected = result.bookmarked ?? result.favorited ?? !work.isCollected;
      } else {
        work.isCollected = !work.isCollected;
      }
    } catch (error) {
      console.error('收藏失败:', error);
      uni.showToast({ title: error.message || '收藏失败', icon: 'none' });
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
    fetchTeamInfo,
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