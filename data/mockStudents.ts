export type InternshipRole = "研发" | "产品" | "销售";
export type GrowthStage = "入营" | "上手" | "协同" | "产出" | "适岗复盘";
export type RiskLevel = "low" | "medium" | "high";

export type FitSignals = {
  businessUnderstanding: number;
  learningSpeed: number;
  collaboration: number;
  execution: number;
  initiative: number;
};

export type Student = {
  id: string;
  name: string;
  role: InternshipRole;
  mentor: string;
  stage: GrowthStage;
  progress: number;
  energy: number;
  riskLevel: RiskLevel;
  tags: string[];
  fitSignals: FitSignals;
  lastFeedback: string;
  nextAction: string;
};

// 20 位模拟实习生，用于演示作业四「实习能量站」中的多角色协同和适岗证据沉淀。
export const students: Student[] = [
  {
    id: "S001",
    name: "林知夏",
    role: "产品",
    mentor: "周凯",
    stage: "产出",
    progress: 78,
    energy: 72,
    riskLevel: "low",
    tags: ["主动提问", "学习快", "需求敏感"],
    fitSignals: { businessUnderstanding: 76, learningSpeed: 88, collaboration: 82, execution: 74, initiative: 86 },
    lastFeedback: "能主动追问业务背景，需求评审前准备充分，但判断依据还需要更结构化。",
    nextAction: "安排一次独立小需求拆解，用「背景-问题-方案-风险」框架输出。"
  },
  {
    id: "S002",
    name: "陈予安",
    role: "研发",
    mentor: "许程",
    stage: "产出",
    progress: 84,
    energy: 81,
    riskLevel: "low",
    tags: ["协作强", "执行稳定", "代码规范"],
    fitSignals: { businessUnderstanding: 72, learningSpeed: 84, collaboration: 88, execution: 86, initiative: 78 },
    lastFeedback: "能按时交付模块，主动同步风险，代码 Review 反馈吸收较快。",
    nextAction: "尝试承担一个低风险接口 owner，验证端到端交付意识。"
  },
  {
    id: "S003",
    name: "顾若澄",
    role: "销售",
    mentor: "韩笑",
    stage: "上手",
    progress: 55,
    energy: 60,
    riskLevel: "high",
    tags: ["目标不清", "融入慢"],
    fitSignals: { businessUnderstanding: 58, learningSpeed: 66, collaboration: 62, execution: 60, initiative: 57 },
    lastFeedback: "对客户分层理解还不够清晰，跟进节奏容易被动等待安排。",
    nextAction: "导师补一次客户画像讲解，并给出本周 3 个可观察的客户跟进动作。"
  },
  {
    id: "S004",
    name: "沈一诺",
    role: "研发",
    mentor: "许程",
    stage: "协同",
    progress: 68,
    energy: 69,
    riskLevel: "medium",
    tags: ["反馈缺失", "学习快"],
    fitSignals: { businessUnderstanding: 65, learningSpeed: 82, collaboration: 68, execution: 70, initiative: 72 },
    lastFeedback: "技术学习速度快，但连续两次任务缺少过程同步，导师难以及时介入。",
    nextAction: "建立每日 10 分钟站会同步，重点看卡点是否提前暴露。"
  },
  {
    id: "S005",
    name: "叶清禾",
    role: "产品",
    mentor: "周凯",
    stage: "适岗复盘",
    progress: 91,
    energy: 88,
    riskLevel: "low",
    tags: ["高适岗", "主动提问", "业务理解强"],
    fitSignals: { businessUnderstanding: 90, learningSpeed: 88, collaboration: 86, execution: 90, initiative: 92 },
    lastFeedback: "能把用户反馈转化为清晰问题，并主动推动设计和研发对齐。",
    nextAction: "给一个跨角色小项目，观察复杂协同中的优先级判断。"
  },
  {
    id: "S006",
    name: "赵景行",
    role: "销售",
    mentor: "韩笑",
    stage: "协同",
    progress: 74,
    energy: 76,
    riskLevel: "medium",
    tags: ["客户敏感", "协作强"],
    fitSignals: { businessUnderstanding: 80, learningSpeed: 74, collaboration: 82, execution: 78, initiative: 76 },
    lastFeedback: "能及时记录客户问题，也愿意向产品同学同步市场反馈。",
    nextAction: "安排一次模拟客户拜访复盘，强化方案表达和异议处理。"
  },
  {
    id: "S007",
    name: "唐予白",
    role: "研发",
    mentor: "邱然",
    stage: "上手",
    progress: 42,
    energy: 49,
    riskLevel: "high",
    tags: ["任务滞后", "融入慢", "目标不清"],
    fitSignals: { businessUnderstanding: 50, learningSpeed: 54, collaboration: 48, execution: 45, initiative: 46 },
    lastFeedback: "环境配置和任务理解均出现滞后，暂时不太敢主动暴露问题。",
    nextAction: "HR 约一次 20 分钟关怀沟通，导师拆小任务并给出明确验收标准。"
  },
  {
    id: "S008",
    name: "宋闻笛",
    role: "产品",
    mentor: "袁知",
    stage: "适岗复盘",
    progress: 93,
    energy: 90,
    riskLevel: "low",
    tags: ["高适岗", "复盘深入", "推动力强"],
    fitSignals: { businessUnderstanding: 88, learningSpeed: 90, collaboration: 90, execution: 92, initiative: 91 },
    lastFeedback: "复盘能主动区分事实、判断和行动建议，适合继续产品方向培养。",
    nextAction: "输出一页实习项目总结，补充适岗面谈证据。"
  },
  {
    id: "S009",
    name: "许星野",
    role: "研发",
    mentor: "邱然",
    stage: "产出",
    progress: 88,
    energy: 84,
    riskLevel: "low",
    tags: ["高适岗", "执行质量高", "学习快"],
    fitSignals: { businessUnderstanding: 78, learningSpeed: 91, collaboration: 82, execution: 92, initiative: 84 },
    lastFeedback: "能独立修复线上低风险问题，并在复盘中说明影响范围。",
    nextAction: "给一次需求技术方案讲解机会，观察业务表达能力。"
  },
  {
    id: "S010",
    name: "罗青柠",
    role: "销售",
    mentor: "韩笑",
    stage: "协同",
    progress: 63,
    energy: 66,
    riskLevel: "medium",
    tags: ["目标不清", "反馈缺失"],
    fitSignals: { businessUnderstanding: 62, learningSpeed: 68, collaboration: 70, execution: 61, initiative: 64 },
    lastFeedback: "愿意学习，但对本周客户跟进目标理解不够具体，反馈记录偏少。",
    nextAction: "补齐客户跟进模板，并请导师在周三前给一次样例反馈。"
  },
  {
    id: "S011",
    name: "孟怀瑾",
    role: "产品",
    mentor: "袁知",
    stage: "产出",
    progress: 82,
    energy: 79,
    riskLevel: "low",
    tags: ["协作强", "用户意识", "表达清晰"],
    fitSignals: { businessUnderstanding: 84, learningSpeed: 78, collaboration: 86, execution: 80, initiative: 78 },
    lastFeedback: "能把用户访谈内容整理成问题列表，跨角色同步比较顺畅。",
    nextAction: "尝试做一次需求优先级排序，并说明取舍理由。"
  },
  {
    id: "S012",
    name: "江听澜",
    role: "研发",
    mentor: "许程",
    stage: "适岗复盘",
    progress: 95,
    energy: 92,
    riskLevel: "low",
    tags: ["高适岗", "代码规范", "主动复盘"],
    fitSignals: { businessUnderstanding: 82, learningSpeed: 90, collaboration: 88, execution: 94, initiative: 89 },
    lastFeedback: "技术产出稳定，能复盘依赖关系和边界条件，适岗信号明显。",
    nextAction: "补充一次业务侧反馈，形成更完整的留用判断证据。"
  },
  {
    id: "S013",
    name: "秦沐阳",
    role: "销售",
    mentor: "梁晨",
    stage: "产出",
    progress: 80,
    energy: 77,
    riskLevel: "low",
    tags: ["客户敏感", "执行稳定"],
    fitSignals: { businessUnderstanding: 82, learningSpeed: 76, collaboration: 78, execution: 82, initiative: 75 },
    lastFeedback: "能跟进客户线索并主动复盘话术，但数据化记录还可以更完整。",
    nextAction: "本周补充 5 条客户反馈标签，用于销售场景复盘。"
  },
  {
    id: "S014",
    name: "苏念初",
    role: "产品",
    mentor: "周凯",
    stage: "上手",
    progress: 48,
    energy: 54,
    riskLevel: "high",
    tags: ["融入慢", "目标不清"],
    fitSignals: { businessUnderstanding: 56, learningSpeed: 62, collaboration: 58, execution: 55, initiative: 52 },
    lastFeedback: "对产品实习任务边界仍然模糊，参与会议时较少表达问题。",
    nextAction: "安排 Buddy 带看一次完整需求流转，并设置一个低压提问目标。"
  },
  {
    id: "S015",
    name: "邵云帆",
    role: "研发",
    mentor: "邱然",
    stage: "协同",
    progress: 76,
    energy: 73,
    riskLevel: "low",
    tags: ["主动提问", "协作强"],
    fitSignals: { businessUnderstanding: 70, learningSpeed: 80, collaboration: 84, execution: 78, initiative: 81 },
    lastFeedback: "能主动问清接口依赖，和产品沟通时态度积极。",
    nextAction: "下周让其主持一次小型技术方案同步。"
  },
  {
    id: "S016",
    name: "何以宁",
    role: "销售",
    mentor: "梁晨",
    stage: "协同",
    progress: 70,
    energy: 68,
    riskLevel: "medium",
    tags: ["反馈缺失", "执行稳定"],
    fitSignals: { businessUnderstanding: 70, learningSpeed: 72, collaboration: 68, execution: 74, initiative: 62 },
    lastFeedback: "能完成基础跟进，但导师反馈记录不连续，成长证据不足。",
    nextAction: "提醒导师补充两条场景化反馈，并同步给 HRBP。"
  },
  {
    id: "S017",
    name: "陆景明",
    role: "产品",
    mentor: "袁知",
    stage: "产出",
    progress: 86,
    energy: 83,
    riskLevel: "low",
    tags: ["高适岗", "业务理解强", "协作强"],
    fitSignals: { businessUnderstanding: 87, learningSpeed: 84, collaboration: 88, execution: 86, initiative: 84 },
    lastFeedback: "能站在业务目标上解释方案，和研发沟通时能主动降低歧义。",
    nextAction: "安排一次独立复盘汇报，观察结构化表达和压力下判断。"
  },
  {
    id: "S018",
    name: "温栀然",
    role: "研发",
    mentor: "许程",
    stage: "上手",
    progress: 61,
    energy: 58,
    riskLevel: "high",
    tags: ["任务滞后", "反馈缺失"],
    fitSignals: { businessUnderstanding: 58, learningSpeed: 60, collaboration: 55, execution: 52, initiative: 56 },
    lastFeedback: "本周两项任务延期，导师反馈缺失导致 HR 难判断真实卡点。",
    nextAction: "HRBP 提醒导师补反馈，并将任务拆成两个可验收子目标。"
  },
  {
    id: "S019",
    name: "季南星",
    role: "销售",
    mentor: "梁晨",
    stage: "产出",
    progress: 89,
    energy: 86,
    riskLevel: "low",
    tags: ["高适岗", "客户敏感", "主动复盘"],
    fitSignals: { businessUnderstanding: 86, learningSpeed: 82, collaboration: 84, execution: 88, initiative: 87 },
    lastFeedback: "能总结客户异议背后的真实顾虑，复盘行动建议可执行。",
    nextAction: "补充一次真实客户跟进旁听，形成最终适岗证据。"
  },
  {
    id: "S020",
    name: "白若川",
    role: "研发",
    mentor: "邱然",
    stage: "协同",
    progress: 73,
    energy: 70,
    riskLevel: "medium",
    tags: ["目标不清", "主动提问"],
    fitSignals: { businessUnderstanding: 62, learningSpeed: 79, collaboration: 76, execution: 72, initiative: 78 },
    lastFeedback: "技术问题会主动问，但对业务目标的理解还停留在任务层面。",
    nextAction: "请导师在需求背景上多补一层 WHY，并让其写一段业务影响说明。"
  }
];
