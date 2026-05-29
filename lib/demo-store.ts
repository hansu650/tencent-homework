import type { InternshipRole } from "@/data/mockStudents";
import {
  buildFeedbackBlocks,
  getCompletedTasks,
  getFitAverage,
  getPriorityActions,
  getRiskReasons,
  hydrateStudents,
  normalizeStudent,
  roleTasks,
  type GrowthStudent,
  type MentorFeedback
} from "@/lib/growth";
import { average } from "@/lib/utils";

export type DemoEvent = {
  id: string;
  type: "task" | "feedback" | "feedback-request" | "weekly-report" | "system" | "reset";
  message: string;
  createdAt: string;
};

export type WeeklyReport = {
  generatedAt: string;
  overview: string;
  riskStudents: string[];
  highFitStudents: string[];
  mentorTodos: string[];
  hrbpActions: string[];
  boundary: string;
  markdown: string;
};

type DemoStore = {
  students: GrowthStudent[];
  events: DemoEvent[];
  eventCursor: number;
};

type RiskCount = {
  name: string;
  value: number;
};

declare global {
  // Keeps demo data alive between route handler calls during one dev/server process.
  // eslint-disable-next-line no-var
  var __EMIAO_DEMO_STORE__: DemoStore | undefined;
}

const roles: InternshipRole[] = ["研发", "产品", "销售"];

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function nowLabel() {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date());
}

function initialEvents(): DemoEvent[] {
  return [
    {
      id: "event-initial-1",
      type: "system",
      message: "系统识别 2 名同学存在目标不清风险，建议 HRBP 优先沟通。",
      createdAt: nowLabel()
    },
    {
      id: "event-initial-2",
      type: "system",
      message: "AI 已同步 20 名实习生的阶段任务、导师反馈和适岗信号。",
      createdAt: nowLabel()
    }
  ];
}

function createStore(): DemoStore {
  return {
    students: hydrateStudents(),
    events: initialEvents(),
    eventCursor: 2
  };
}

function getStore() {
  if (!globalThis.__EMIAO_DEMO_STORE__) {
    globalThis.__EMIAO_DEMO_STORE__ = createStore();
  }

  return globalThis.__EMIAO_DEMO_STORE__;
}

function addEvent(type: DemoEvent["type"], message: string) {
  const store = getStore();
  store.eventCursor += 1;
  store.events = [
    {
      id: `event-${Date.now()}-${store.eventCursor}`,
      type,
      message,
      createdAt: nowLabel()
    },
    ...store.events
  ].slice(0, 40);
}

function calcEnergy(student: GrowthStudent, progress = student.progress) {
  return Math.min(
    100,
    Math.max(0, Math.round(34 + progress * 0.46 + student.feedbackCount * 4 + getFitAverage(student) * 0.13))
  );
}

function tagsFromSignals(student: GrowthStudent, completedTaskIds = student.completedTaskIds) {
  const tags = new Set(student.tags);
  const completionRatio = completedTaskIds.length / roleTasks[student.role].length;

  if (completionRatio < 0.5) tags.add("任务滞后");
  if (completionRatio >= 0.75) tags.delete("任务滞后");
  if (student.feedbackCount < 2) tags.add("反馈缺失");
  if (student.feedbackCount >= 2) tags.delete("反馈缺失");
  if (student.fitSignals.businessUnderstanding < 68 && completionRatio < 0.75) tags.add("目标不清");
  if (student.fitSignals.collaboration < 60) tags.add("融入慢");
  if (getFitAverage(student) >= 85 && completionRatio >= 0.75) tags.add("高适岗");
  if (student.feedbackCount >= 3) tags.add("反馈及时");

  return Array.from(tags).slice(0, 7);
}

function recalcStudent(student: GrowthStudent, completedTaskIds = student.completedTaskIds) {
  const progress = Math.round((completedTaskIds.length / roleTasks[student.role].length) * 100);
  const nextBase = {
    ...student,
    completedTaskIds,
    progress,
    tags: tagsFromSignals({ ...student, completedTaskIds, progress }, completedTaskIds)
  };

  return normalizeStudent({
    ...nextBase,
    energy: calcEnergy(nextBase, progress)
  });
}

function inferTagsFromFeedback(note: string, student: GrowthStudent) {
  const tags = new Set(tagsFromSignals(student));
  const cleanNote = note.trim();

  tags.delete("反馈缺失");
  if (/主动|提问|跟进/.test(cleanNote)) tags.add("主动提问");
  if (/协作|沟通|同步/.test(cleanNote)) tags.add("协作强");
  if (/需求|用户|业务/.test(cleanNote)) tags.add("业务理解");
  if (/客户|拜访|异议/.test(cleanNote)) tags.add("客户敏感");
  if (/代码|Review|模块|issue/.test(cleanNote)) tags.add("代码规范");
  if (student.feedbackCount >= 3) tags.add("反馈及时");

  return Array.from(tags).slice(0, 7);
}

function getRiskRole(students: GrowthStudent[]) {
  const counts = roles.map((role) => ({
    role,
    count: students.filter((student) => student.role === role && student.riskLevel !== "low").length
  }));

  return counts.sort((a, b) => b.count - a.count)[0];
}

function getMentorsToRemind(students: GrowthStudent[]) {
  return Array.from(
    new Set(
      students
        .filter((student) => getRiskReasons(student).includes("反馈缺失") || student.feedbackCount < 2)
        .map((student) => student.mentor)
    )
  );
}

function getRiskCounts(students: GrowthStudent[]): RiskCount[] {
  const riskTypes = ["任务滞后", "反馈缺失", "目标不清", "融入慢"];
  return riskTypes.map((name) => ({
    name,
    value: students.filter((student) => getRiskReasons(student).includes(name)).length
  }));
}

export function resetDemoStore() {
  globalThis.__EMIAO_DEMO_STORE__ = createStore();
  addEvent("reset", "演示数据已重置，任务、反馈和周报回到初始状态。");
  return {
    students: getStudents(),
    events: getEvents()
  };
}

export function getStudents() {
  return clone(getStore().students);
}

export function getEvents() {
  return clone(getStore().events);
}

export function getDashboardMetrics(students = getStore().students) {
  const total = students.length;
  const averageProgress = average(students.map((student) => student.progress));
  const feedbackTimelyRate = Math.round((students.filter((student) => student.feedbackCount >= 2).length / total) * 100);
  const focusCount = students.filter((student) => student.riskLevel !== "low").length;
  const highFitCount = students.filter((student) => getFitAverage(student) >= 85 && student.riskLevel === "low").length;

  return {
    total,
    averageProgress,
    feedbackTimelyRate,
    focusCount,
    highFitCount,
    riskCounts: getRiskCounts(students),
    roleDistribution: roles.map((role) => ({
      name: role,
      value: students.filter((student) => student.role === role).length
    })),
    stageDistribution: ["入营", "上手", "协同", "产出", "适岗复盘"].map((stage) => ({
      name: stage,
      value: students.filter((student) => student.stage === stage).length
    }))
  };
}

export function updateStudentTask(studentId: string, taskId: string, completed: boolean) {
  const store = getStore();
  const student = store.students.find((item) => item.id === studentId);
  if (!student) return null;

  const task = roleTasks[student.role].find((item) => item.id === taskId);
  if (!task) return null;

  const completedSet = new Set(student.completedTaskIds);
  if (completed) completedSet.add(taskId);
  else completedSet.delete(taskId);

  const completedTaskIds = roleTasks[student.role]
    .map((item) => item.id)
    .filter((id) => completedSet.has(id));

  const nextStudent = recalcStudent({
    ...student,
    completedTaskIds,
    taskHistory: completed
      ? [`${nowLabel()} 完成「${task.title}」`, ...student.taskHistory].slice(0, 8)
      : student.taskHistory.filter((item) => !item.includes(`「${task.title}」`))
  });

  store.students = store.students.map((item) => (item.id === studentId ? nextStudent : item));
  addEvent("task", `${student.name}${completed ? "完成" : "取消完成"}「${task.title}」，成长进度更新为 ${nextStudent.progress}%。`);

  return {
    student: clone(nextStudent),
    students: getStudents(),
    events: getEvents()
  };
}

export function createFeedback(studentId: string, mentorNote: string) {
  const store = getStore();
  const student = store.students.find((item) => item.id === studentId);
  if (!student) return null;

  const feedback: MentorFeedback = buildFeedbackBlocks(student, mentorNote);
  const feedbackCount = student.feedbackCount + 1;
  const progress = Math.min(100, student.progress + 4);
  const nextBase: GrowthStudent = {
    ...student,
    feedbackCount,
    progress,
    completedTaskIds: student.completedTaskIds,
    tags: inferTagsFromFeedback(mentorNote, { ...student, feedbackCount, progress }),
    lastFeedback: `${feedback.praise} ${feedback.suggestion}`,
    nextAction: feedback.action,
    feedbackHistory: [feedback, ...student.feedbackHistory].slice(0, 6)
  };

  const nextStudent = normalizeStudent({
    ...nextBase,
    energy: calcEnergy(nextBase, progress)
  });

  store.students = store.students.map((item) => (item.id === studentId ? nextStudent : item));
  addEvent("feedback", `导师为 ${student.name} 生成结构化反馈，反馈次数更新为 ${nextStudent.feedbackCount} 次。`);

  return {
    feedback: clone(feedback),
    student: clone(nextStudent),
    students: getStudents(),
    events: getEvents()
  };
}

export function requestMentorFeedback(studentId: string, taskId: string) {
  const store = getStore();
  const student = store.students.find((item) => item.id === studentId);
  if (!student) return null;

  const task = roleTasks[student.role].find((item) => item.id === taskId);
  if (!task) return null;

  const tags = Array.from(new Set([...student.tags, "请求反馈"])).slice(0, 7);
  const nextStudent = normalizeStudent({
    ...student,
    tags,
    nextAction: `请导师围绕「${task.title}」补充一次结构化反馈，重点看事实、判断和下周行动。`,
    taskHistory: [`${nowLabel()} 请求导师反馈「${task.title}」`, ...student.taskHistory].slice(0, 8)
  });

  store.students = store.students.map((item) => (item.id === studentId ? nextStudent : item));
  addEvent("feedback-request", `${student.name} 请求导师围绕「${task.title}」补充反馈，已进入导师待办。`);

  return {
    student: clone(nextStudent),
    students: getStudents(),
    events: getEvents()
  };
}

export function generateWeeklyReport() {
  const store = getStore();
  const students = store.students;
  const metrics = getDashboardMetrics(students);
  const focusStudents = students.filter((student) => student.riskLevel !== "low");
  const highFitStudents = students
    .filter((student) => getFitAverage(student) >= 85 && student.riskLevel === "low")
    .sort((a, b) => getFitAverage(b) - getFitAverage(a));
  const topRiskRole = getRiskRole(students);
  const mentors = getMentorsToRemind(students);
  const priorityActions = getPriorityActions(students);
  const lateCount = metrics.riskCounts.find((item) => item.name === "任务滞后")?.value ?? 0;
  const missingFeedbackCount = metrics.riskCounts.find((item) => item.name === "反馈缺失")?.value ?? 0;
  const unclearCount = metrics.riskCounts.find((item) => item.name === "目标不清")?.value ?? 0;

  const overview = `本周 ${metrics.total} 名实习生平均任务完成率 ${metrics.averageProgress}%，导师反馈及时率 ${metrics.feedbackTimelyRate}%。当前需关注 ${metrics.focusCount} 人，高适岗信号 ${metrics.highFitCount} 人；风险主要集中在 ${
    topRiskRole.count > 0 ? topRiskRole.role : "暂无明显集中岗位"
  }方向。任务滞后 ${lateCount} 人，反馈缺失 ${missingFeedbackCount} 人，目标不清 ${unclearCount} 人。`;

  const riskStudents = focusStudents.slice(0, 6).map((student) => {
    const reasons = getRiskReasons(student);
    return `${student.name}（${student.role}，导师 ${student.mentor}）：${reasons.join("、") || "需关注"}，下一步 ${student.nextAction}`;
  });

  const highFitList = highFitStudents.slice(0, 6).map((student) => {
    const completed = getCompletedTasks(student).slice(-1)[0]?.title ?? "阶段任务";
    return `${student.name}（${student.role}）：适岗均分 ${getFitAverage(student)}，最近证据「${completed}」。`;
  });

  const mentorTodos = mentors.length
    ? mentors.map((mentor) => `提醒导师 ${mentor} 补充场景化反馈，重点写清事实、影响和下周行动。`)
    : ["本周导师反馈节奏稳定，可继续沉淀高适岗同学的独立任务证据。"];

  const boundary =
    "AI 风险判断仅作为 HRBP 与导师沟通线索，不直接作为留用、淘汰或评价依据；最终判断仍需结合业务反馈、导师面谈和 HRBP 的人情分寸。";

  const markdown = [
    "# 鹅苗星图 AI 本周成长周报",
    "",
    "## 本周概览",
    overview,
    "",
    "## 风险学生",
    ...(riskStudents.length ? riskStudents : ["暂无高风险集中信号。"]).map((item) => `- ${item}`),
    "",
    "## 高适岗学生",
    ...(highFitList.length ? highFitList : ["暂无新增高适岗信号。"]).map((item) => `- ${item}`),
    "",
    "## 导师待办",
    ...mentorTodos.map((item) => `- ${item}`),
    "",
    "## HRBP 优先动作",
    ...priorityActions.map((item) => `- ${item}`),
    "",
    "## AI 边界说明",
    boundary
  ].join("\n");

  const report: WeeklyReport = {
    generatedAt: nowLabel(),
    overview,
    riskStudents,
    highFitStudents: highFitList,
    mentorTodos,
    hrbpActions: priorityActions,
    boundary,
    markdown
  };

  addEvent("weekly-report", `HRBP 生成本周 AI 周报：需关注 ${metrics.focusCount} 人，高适岗信号 ${metrics.highFitCount} 人。`);
  return {
    report,
    metrics,
    events: getEvents()
  };
}
