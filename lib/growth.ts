import { students, type InternshipRole, type RiskLevel, type Student } from "@/data/mockStudents";
import { average } from "@/lib/utils";

export type TaskDefinition = {
  id: string;
  title: string;
  evidence: string;
};

export type MentorFeedback = {
  praise: string;
  suggestion: string;
  action: string;
  sourceNote: string;
  createdAt: string;
};

export type GrowthStudent = Student & {
  feedbackCount: number;
  completedTaskIds: string[];
  taskHistory: string[];
  feedbackHistory: MentorFeedback[];
};

export const roleTasks: Record<InternshipRole, TaskDefinition[]> = {
  产品: [
    { id: "product-context", title: "完成业务背景学习", evidence: "已梳理业务目标、用户角色和核心指标" },
    { id: "product-review", title: "参与一次需求评审", evidence: "参与需求评审并记录 3 个关键问题" },
    { id: "product-competitor", title: "输出一份竞品观察", evidence: "提交竞品观察，沉淀可借鉴点和风险点" },
    { id: "product-1v1", title: "和导师进行一次 1v1", evidence: "完成导师 1v1，明确下周一个验证动作" }
  ],
  研发: [
    { id: "dev-env", title: "完成开发环境配置", evidence: "开发环境可运行，完成首次本地调试" },
    { id: "dev-code-reading", title: "阅读一个核心模块代码", evidence: "画出模块调用链并标记关键依赖" },
    { id: "dev-issue", title: "修复一个低风险 issue", evidence: "提交 issue 修复并通过自测" },
    { id: "dev-review", title: "参加一次代码 Review", evidence: "完成一次 Review 反馈吸收和复盘" }
  ],
  销售: [
    { id: "sales-profile", title: "学习客户画像和产品卖点", evidence: "梳理目标客户分层、产品卖点和常见需求" },
    { id: "sales-shadowing", title: "旁听一次客户沟通", evidence: "旁听客户沟通并记录关键异议" },
    { id: "sales-tags", title: "输出 3 条客户反馈标签", evidence: "把客户反馈整理成可复用标签" },
    { id: "sales-review", title: "进行一次模拟客户拜访复盘", evidence: "输出拜访复盘和下一步跟进动作" }
  ]
};

export const growthStages = ["入营", "上手", "协同", "产出", "适岗复盘"] as const;

export function getFitAverage(student: Pick<Student, "fitSignals">) {
  return average(Object.values(student.fitSignals));
}

export function getStageByProgress(progress: number): Student["stage"] {
  if (progress >= 90) return "适岗复盘";
  if (progress >= 78) return "产出";
  if (progress >= 62) return "协同";
  if (progress >= 35) return "上手";
  return "入营";
}

export function getCompletedTasks(student: GrowthStudent) {
  return roleTasks[student.role].filter((task) => student.completedTaskIds.includes(task.id));
}

export function getRiskReasons(student: GrowthStudent) {
  const reasons: string[] = [];
  const totalTasks = roleTasks[student.role].length;
  const completionRatio = student.completedTaskIds.length / totalTasks;

  if (student.progress < 60 || completionRatio < 0.5) reasons.push("任务滞后");
  if (student.feedbackCount < 2) reasons.push("反馈缺失");
  if (
    student.tags.includes("目标不清") ||
    (student.progress < 72 && student.fitSignals.businessUnderstanding < 68)
  ) {
    reasons.push("目标不清");
  }
  if (student.tags.includes("融入慢") || student.fitSignals.collaboration < 60) {
    reasons.push("融入慢");
  }

  return Array.from(new Set(reasons));
}

export function deriveRiskLevel(student: GrowthStudent): RiskLevel {
  const reasons = getRiskReasons(student);
  if (student.progress < 55 || reasons.length >= 3 || (reasons.includes("任务滞后") && reasons.includes("反馈缺失"))) {
    return "high";
  }
  if (student.progress < 75 || reasons.length > 0 || student.feedbackCount < 3) {
    return "medium";
  }
  return "low";
}

export function normalizeStudent(student: GrowthStudent): GrowthStudent {
  const progress = Math.max(0, Math.min(100, Math.round(student.progress)));
  return {
    ...student,
    progress,
    energy: Math.max(0, Math.min(100, Math.round(student.energy))),
    stage: getStageByProgress(progress),
    riskLevel: deriveRiskLevel({ ...student, progress })
  };
}

export function hydrateStudents(): GrowthStudent[] {
  return students.map((student, index) => {
    const tasks = roleTasks[student.role];
    const completedCount = Math.max(1, Math.min(tasks.length, Math.round((student.progress / 100) * tasks.length)));
    const feedbackCount = student.tags.includes("反馈缺失")
      ? 1
      : student.progress >= 88
        ? 4
        : student.progress >= 72
          ? 3
          : 2;

    return normalizeStudent({
      ...student,
      feedbackCount,
      completedTaskIds: tasks.slice(0, completedCount).map((task) => task.id),
      taskHistory: tasks
        .slice(0, completedCount)
        .map((task, taskIndex) => `第 ${Math.max(1, taskIndex + 1)} 周完成「${task.title}」`),
      feedbackHistory: [
        {
          praise: student.lastFeedback,
          suggestion: "继续把过程记录沉淀下来，便于导师和 HRBP 看到真实成长证据。",
          action: student.nextAction,
          sourceNote: "系统初始化的导师反馈摘要",
          createdAt: `第 ${Math.max(1, (index % 4) + 1)} 周`
        }
      ]
    });
  });
}

export function getRiskMeta(level: RiskLevel) {
  if (level === "high") {
    return { label: "高风险", variant: "red" as const, color: "text-red-200" };
  }
  if (level === "medium") {
    return { label: "需关注", variant: "yellow" as const, color: "text-amber-200" };
  }
  return { label: "稳定成长", variant: "green" as const, color: "text-emerald-200" };
}

export function getCoachAdvice(student: GrowthStudent) {
  const reasons = getRiskReasons(student);
  const roleAdvice: Record<InternshipRole, string> = {
    产品: "产品实习的关键不是把方案写满，而是把用户、场景、指标和取舍问清楚。",
    研发: "研发实习的关键是先跑通链路，再理解边界条件，遇到卡点要尽早同步。",
    销售: "销售实习的关键是把客户反馈从聊天记录里提炼出来，形成可复盘的行为线索。"
  };

  if (reasons.includes("目标不清")) {
    return `${roleAdvice[student.role]} 你当前最需要先澄清目标：这件事服务谁、解决什么问题、做到什么程度算完成。`;
  }
  if (reasons.includes("反馈缺失")) {
    return `${roleAdvice[student.role]} 本周建议主动向导师要一次具体反馈，并把反馈写成“下周一个动作”。`;
  }
  if (reasons.includes("任务滞后")) {
    return `${roleAdvice[student.role]} 先把任务拆成可验收的小块，不要等到最后一天才暴露风险。`;
  }
  if (student.riskLevel === "low" && getFitAverage(student) >= 85) {
    return `${roleAdvice[student.role]} 你已经出现较强适岗信号，下周可以争取一个更独立的小任务来验证判断力。`;
  }
  return `${roleAdvice[student.role]} 继续保持稳定节奏，把每次任务、反馈和复盘都沉淀成可看见的成长证据。`;
}

export function buildFeedbackBlocks(student: GrowthStudent, note: string): MentorFeedback {
  const cleanNote = note.trim() || "能主动跟进任务，但在拆解问题时还需要更结构化。";
  const roleAction: Record<InternshipRole, string> = {
    产品: "下周先用“背景-问题-方案-风险”框架整理一个需求，再和导师做 15 分钟校准。",
    研发: "下周选择一个低风险 issue，先写出影响范围和自测清单，再提交代码 Review。",
    销售: "下周完成一次客户沟通复盘，把客户异议整理成标签并给出下一步跟进动作。"
  };

  return {
    praise: `你本周的表现有可见进步：${cleanNote}`,
    suggestion:
      student.riskLevel === "high"
        ? "当前更重要的是降低不确定性，及时暴露卡点，不要独自消化到任务延期。"
        : "建议继续把过程讲清楚，尤其是判断依据、遇到的卡点和需要支持的地方。",
    action: roleAction[student.role],
    sourceNote: cleanNote,
    createdAt: "本周"
  };
}

export function getWeeklySummary(studentsState: GrowthStudent[], variant = 0) {
  const total = studentsState.length;
  const taskRate = average(studentsState.map((student) => student.progress));
  const timelyFeedback = studentsState.filter((student) => student.feedbackCount >= 2).length;
  const focusStudents = studentsState.filter((student) => student.riskLevel !== "low");
  const highFit = studentsState.filter((student) => getFitAverage(student) >= 85 && student.riskLevel === "low").length;
  const unclear = studentsState.filter((student) => getRiskReasons(student).includes("目标不清")).length;
  const missingFeedback = studentsState.filter((student) => getRiskReasons(student).includes("反馈缺失")).length;
  const late = studentsState.filter((student) => getRiskReasons(student).includes("任务滞后")).length;
  const topRole = ["研发", "产品", "销售"]
    .map((role) => ({
      role,
      count: focusStudents.filter((student) => student.role === role).length
    }))
    .sort((a, b) => b.count - a.count)[0];

  const opening =
    variant % 2 === 0
      ? `本周 ${total} 名实习生平均任务完成率 ${taskRate}%`
      : `AI 已根据最新任务和反馈重新汇总：${total} 名实习生平均进度 ${taskRate}%`;

  return `${opening}，导师反馈及时率 ${Math.round((timelyFeedback / total) * 100)}%。当前需关注 ${focusStudents.length} 人，高适岗信号 ${highFit} 人。主要风险集中在目标不清 ${unclear} 人、反馈缺失 ${missingFeedback} 人、任务滞后 ${late} 人；${topRole.count > 0 ? `${topRole.role}方向需要 HRBP 优先跟进。` : "整体节奏稳定，可继续沉淀适岗证据。"} 建议本周优先完成三件事：提醒低反馈导师补充场景化反馈，约谈连续低进度同学，给高适岗同学安排一次独立小任务验证。`;
}

export function getPriorityActions(studentsState: GrowthStudent[]) {
  const focus = studentsState.filter((student) => student.riskLevel !== "low");
  const missingFeedback = studentsState.filter((student) => getRiskReasons(student).includes("反馈缺失"));
  const highFit = studentsState.filter((student) => getFitAverage(student) >= 85 && student.riskLevel === "low");

  return [
    `优先约谈 ${focus.slice(0, 2).map((student) => student.name).join("、") || "暂无高风险同学"}，先确认真实卡点。`,
    `提醒 ${missingFeedback.length} 位反馈不足同学的导师补充场景化反馈。`,
    `给 ${highFit.length} 位高适岗同学安排独立小任务，补齐最终判断证据。`
  ];
}
