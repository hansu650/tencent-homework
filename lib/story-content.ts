import type { GrowthStage, InternshipRole } from "@/data/mockStudents";

export type StoryRole = InternshipRole;

export type StoryProfile = {
  avatar: StoryRole;
  name: string;
  role: StoryRole;
  mentor: string;
  confusion: string;
  photo?: string;
  studentId: string;
};

export type StoryTaskDetail = {
  id: string;
  title: string;
  deliverable: string;
  mentorSignal: string;
  hrbpSignal: string;
  goal: string;
  steps: string[];
};

export const roleAvatars: Record<StoryRole, { name: string; title: string; tone: string; face: string }> = {
  产品: {
    name: "产品鹅",
    title: "先问清用户、场景和指标",
    tone: "from-blue-500 to-cyan-500",
    face: "产"
  },
  研发: {
    name: "研发鹅",
    title: "先跑通链路，再验证边界",
    tone: "from-emerald-500 to-cyan-500",
    face: "研"
  },
  销售: {
    name: "销售鹅",
    title: "先听懂客户，再沉淀反馈",
    tone: "from-amber-400 to-orange-500",
    face: "销"
  }
};

export const defaultMentorByRole: Record<StoryRole, string> = {
  产品: "周凯",
  研发: "邱然",
  销售: "韩笑"
};

export const defaultStudentByRole: Record<StoryRole, string> = {
  产品: "S014",
  研发: "S007",
  销售: "S003"
};

export const storyStages: { stage: GrowthStage; mark: string }[] = [
  { stage: "入营", mark: "W1" },
  { stage: "上手", mark: "W2" },
  { stage: "协同", mark: "W3" },
  { stage: "产出", mark: "W4" },
  { stage: "适岗复盘", mark: "复盘" }
];

export const confusionOptions = [
  {
    value: "目标不清",
    title: "不知道该学什么",
    diagnosis: "目标不清",
    description: "新人还没把业务目标、用户角色和本周重点对齐。"
  },
  {
    value: "交付不清",
    title: "不知道怎么交付",
    diagnosis: "交付不清",
    description: "任务没有被拆成可验收的小交付，导师也难以检视。"
  },
  {
    value: "反馈不清",
    title: "不知道是否适合岗位",
    diagnosis: "反馈不清",
    description: "导师反馈和 HRBP 判断没有沉淀成清晰证据链。"
  }
] as const;

export const storyTasks: Record<StoryRole, StoryTaskDetail[]> = {
  产品: [
    {
      id: "product-context",
      title: "完成业务背景学习",
      deliverable: "业务背景笔记 + 3 个关键问题",
      mentorSignal: "能否讲清用户是谁、业务目标是什么、当前卡点是什么。",
      hrbpSignal: "业务理解、主动提问、学习速度。",
      goal: "先理解业务目标、用户角色和核心指标，不急着输出方案。",
      steps: ["阅读业务材料和历史需求", "写下用户、目标、卡点 3 个问题", "输出一页业务背景笔记", "请导师按业务理解给出反馈"]
    },
    {
      id: "product-review",
      title: "参与一次需求评审",
      deliverable: "评审纪要 + 3 条风险点",
      mentorSignal: "是否能区分事实、判断和建议。",
      hrbpSignal: "协作沟通、结构化表达、业务敏感度。",
      goal: "在真实会议中观察业务如何讨论问题和取舍。",
      steps: ["会前看需求背景", "会上记录事实、判断和建议", "会后整理 3 条风险点", "把纪要发给导师确认"]
    },
    {
      id: "product-competitor",
      title: "输出一份竞品观察",
      deliverable: "1 页竞品观察卡",
      mentorSignal: "是否能把竞品功能和本业务场景联系起来。",
      hrbpSignal: "分析能力、用户视角、主动性。",
      goal: "从外部产品中学习解决类似问题的方式。",
      steps: ["选择 2 个相关竞品", "观察相同问题的处理方式", "写出可借鉴和不可照搬点", "请导师判断业务相关性"]
    },
    {
      id: "product-1v1",
      title: "和导师进行一次 1v1",
      deliverable: "1v1 纪要 + 下周行动清单",
      mentorSignal: "是否能主动复盘问题并提出下一步动作。",
      hrbpSignal: "自我驱动、反馈吸收、成长意愿。",
      goal: "对齐当前成长卡点和下周验证动作。",
      steps: ["整理本周任务证据", "写出当前卡点", "提出一个下周验证动作", "请导师确认行动是否可执行"]
    }
  ],
  研发: [
    {
      id: "dev-env",
      title: "完成开发环境配置",
      deliverable: "环境配置截图 + 问题记录",
      mentorSignal: "能否独立定位基础问题。",
      hrbpSignal: "执行质量、问题记录习惯。",
      goal: "先跑通开发环境，降低后续任务的不确定性。",
      steps: ["阅读环境文档", "记录安装和报错", "跑通核心服务", "请导师确认阻塞点是否清晰"]
    },
    {
      id: "dev-code-reading",
      title: "阅读一个核心模块代码",
      deliverable: "模块流程图 + 关键接口说明",
      mentorSignal: "能否讲清模块输入、处理和输出。",
      hrbpSignal: "学习速度、技术理解。",
      goal: "理解模块输入、处理和输出，而不是只看局部代码。",
      steps: ["找到核心模块入口", "画出输入处理输出", "标记关键接口", "向导师复述模块链路"]
    },
    {
      id: "dev-issue",
      title: "修复一个低风险 issue",
      deliverable: "PR 链接 / 修改说明",
      mentorSignal: "代码是否清晰、是否考虑边界。",
      hrbpSignal: "执行质量、责任心。",
      goal: "通过小范围修复验证端到端交付意识。",
      steps: ["复现 issue", "写出影响范围", "提交修复和自测", "请导师 Review 修改说明"]
    },
    {
      id: "dev-review",
      title: "参加一次代码 Review",
      deliverable: "Review 记录 + 2 条改进点",
      mentorSignal: "是否能理解 Review 反馈并调整。",
      hrbpSignal: "协作沟通、反馈吸收。",
      goal: "在 Review 中学习团队标准和反馈吸收方式。",
      steps: ["记录导师反馈", "复述反馈原因", "完成修改", "沉淀 2 条团队规范"]
    }
  ],
  销售: [
    {
      id: "sales-profile",
      title: "学习客户画像和产品卖点",
      deliverable: "客户画像卡 + 产品卖点表",
      mentorSignal: "能否说清客户痛点和对应价值。",
      hrbpSignal: "业务理解、表达能力。",
      goal: "先理解客户痛点和产品价值，再进入真实沟通场景。",
      steps: ["阅读客户分层材料", "梳理典型痛点", "匹配产品卖点", "请导师检查表达是否像客户语言"]
    },
    {
      id: "sales-shadowing",
      title: "旁听一次客户沟通",
      deliverable: "客户问题清单 + 沟通复盘",
      mentorSignal: "是否能识别客户真实关注点。",
      hrbpSignal: "倾听能力、信息捕捉。",
      goal: "在真实沟通里观察客户问题、异议和导师回应方式。",
      steps: ["会前了解客户背景", "旁听时记录原话", "标记真实关注点", "和导师复盘沟通节奏"]
    },
    {
      id: "sales-tags",
      title: "输出 3 条客户反馈标签",
      deliverable: "客户反馈标签表",
      mentorSignal: "标签是否准确、是否有业务价值。",
      hrbpSignal: "分析能力、客户敏感度。",
      goal: "把零散客户反馈沉淀成可复盘的业务标签。",
      steps: ["收集客户反馈原文", "归类 3 个标签", "说明业务价值", "请导师判断是否可复用"]
    },
    {
      id: "sales-review",
      title: "进行一次模拟客户拜访复盘",
      deliverable: "拜访脚本 + 复盘记录",
      mentorSignal: "表达是否清晰，回应是否有逻辑。",
      hrbpSignal: "沟通表达、临场反应。",
      goal: "通过低风险模拟验证表达、回应和复盘能力。",
      steps: ["写出拜访目标", "准备关键话术", "模拟回应客户异议", "复盘表达和临场反应"]
    }
  ]
};

export function getDefaultStoryProfile(): StoryProfile {
  return {
    avatar: "产品",
    name: "",
    role: "产品",
    mentor: "周凯",
    confusion: "目标不清",
    studentId: "S014"
  };
}
