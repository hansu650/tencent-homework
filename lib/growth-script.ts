export type RoleId = "product" | "engineering" | "operations" | "hr" | "design";
export type AiLevelId = "starter" | "basic" | "advanced" | "coCreate";
export type GrowthGoalId =
  | "teamFit"
  | "aiToolchain"
  | "businessRole"
  | "showcaseProject"
  | "humanAiHabit";
export type MentorStyleId = "light" | "project" | "challenge" | "coCreate";

export type GrowthProfile = {
  role: RoleId;
  aiLevel: AiLevelId;
  growthGoal: GrowthGoalId;
  mentorStyle: MentorStyleId;
  generatedAt?: string;
};

export type Option<T extends string> = {
  id: T;
  label: string;
  description: string;
  feedback: string;
};

export type GrowthStage = {
  id: "30" | "60" | "90";
  title: string;
  subtitle: string;
  goal: string;
  tasks: string[];
  deliverable: string;
  mentorChecks: string[];
  tools: string[];
};

export const storageKey = "emiao-growth-script-profile";

export const roleOptions: Option<RoleId>[] = [
  {
    id: "product",
    label: "产品新人",
    description: "业务理解、需求拆解、AI 辅助分析",
    feedback: "将重点生成业务地图、需求分析卡和产品优化小项目。"
  },
  {
    id: "engineering",
    label: "研发新人",
    description: "代码理解、AI 辅助开发、质量意识",
    feedback: "将重点生成模块阅读、低风险 issue、测试用例和小功能 Demo。"
  },
  {
    id: "operations",
    label: "运营新人",
    description: "指标理解、用户洞察、运营实验",
    feedback: "将重点生成指标学习、用户画像、方案初稿和小型运营实验。"
  },
  {
    id: "hr",
    label: "HR 新人",
    description: "HR 流程、员工服务、AI-HR 工具",
    feedback: "将重点生成流程地图、SOP、反馈模板和 AI-HR 小工具。"
  },
  {
    id: "design",
    label: "设计新人",
    description: "设计规范、AI 灵感、方案表达",
    feedback: "将重点生成视觉分析、草图方向和设计改版 Demo。"
  }
];

export const aiLevelOptions: Option<AiLevelId>[] = [
  {
    id: "starter",
    label: "AI 小白",
    description: "只用过问答工具",
    feedback: "前 30 天会增加提示词入门和工具练习。"
  },
  {
    id: "basic",
    label: "AI 入门",
    description: "会用 AI 写文案、整理资料",
    feedback: "路径会从资料整理过渡到岗位任务拆解。"
  },
  {
    id: "advanced",
    label: "AI 进阶",
    description: "能用 AI 做分析、原型或代码辅助",
    feedback: "路径会更快进入真实任务和工作流沉淀。"
  },
  {
    id: "coCreate",
    label: "AI 共创",
    description: "能把 AI 融入完整工作流",
    feedback: "路径会设置更高挑战，强调可复用的 AI Native 小项目。"
  }
];

export const growthGoalOptions: Option<GrowthGoalId>[] = [
  {
    id: "teamFit",
    label: "快速融入团队",
    description: "理解角色、节奏和协作方式",
    feedback: "会增加团队沟通、业务地图和导师同步点。"
  },
  {
    id: "aiToolchain",
    label: "掌握 AI 工具链",
    description: "从会用工具到会设计工作流",
    feedback: "会强化 AI 工具建议、提示词练习和工具复盘。"
  },
  {
    id: "businessRole",
    label: "理解业务和岗位要求",
    description: "把岗位能力和业务目标连起来",
    feedback: "会突出业务目标、岗位交付物和阶段验收标准。"
  },
  {
    id: "showcaseProject",
    label: "完成可展示小项目",
    description: "最终形成可复盘、可展示的产出",
    feedback: "会围绕 90 天小项目倒推阶段任务。"
  },
  {
    id: "humanAiHabit",
    label: "建立人机协作习惯",
    description: "记录 AI 参与过程和人的判断",
    feedback: "会要求沉淀 AI 使用过程、反思和边界判断。"
  }
];

export const mentorStyleOptions: Option<MentorStyleId>[] = [
  {
    id: "light",
    label: "轻陪伴",
    description: "每周一次反馈",
    feedback: "导师检查点会更轻量，适合稳定跟进。"
  },
  {
    id: "project",
    label: "项目制",
    description: "围绕一个小项目推进",
    feedback: "30/60/90 会串成一个小项目推进过程。"
  },
  {
    id: "challenge",
    label: "高挑战",
    description: "阶段验收 + 明确交付物",
    feedback: "会强化阶段交付物、验收标准和复盘。"
  },
  {
    id: "coCreate",
    label: "共创型",
    description: "导师和新人一起用 AI 做小项目",
    feedback: "会突出导师共创、AI 协作和方法沉淀。"
  }
];

export const defaultProfile: GrowthProfile = {
  role: "product",
  aiLevel: "basic",
  growthGoal: "showcaseProject",
  mentorStyle: "project"
};

export const sampleProfiles: Array<{
  name: string;
  note: string;
  profile: GrowthProfile;
}> = [
  {
    name: "产品新人测试组",
    note: "AI 入门，目标是做出可展示的小项目",
    profile: {
      role: "product",
      aiLevel: "basic",
      growthGoal: "showcaseProject",
      mentorStyle: "project"
    }
  },
  {
    name: "研发新人测试组",
    note: "AI 进阶，导师采用高挑战方式",
    profile: {
      role: "engineering",
      aiLevel: "advanced",
      growthGoal: "aiToolchain",
      mentorStyle: "challenge"
    }
  },
  {
    name: "HR 新人测试组",
    note: "AI 小白，先快速融入团队",
    profile: {
      role: "hr",
      aiLevel: "starter",
      growthGoal: "teamFit",
      mentorStyle: "light"
    }
  }
];

const roleStageContent: Record<
  RoleId,
  Record<GrowthStage["id"], Omit<GrowthStage, "id" | "title" | "subtitle">>
> = {
  product: {
    "30": {
      goal: "理解业务、熟悉团队、掌握基础 AI 工具。",
      tasks: ["业务地图学习", "用户问题整理", "AI 辅助竞品分析"],
      deliverable: "业务地图 + 3 个关键用户问题",
      mentorChecks: ["能否说清用户、场景和核心指标", "能否区分事实、判断和建议"],
      tools: ["AI 搜集竞品信息", "AI 整理用户访谈纪要"]
    },
    "60": {
      goal: "参与真实需求讨论，开始用 AI 辅助完成产品分析。",
      tasks: ["参与需求评审", "用 AI 拆解用户反馈", "输出需求分析卡"],
      deliverable: "需求分析卡",
      mentorChecks: ["能否讲清业务问题", "能否提出可验证的方案假设"],
      tools: ["AI 聚类用户反馈", "AI 生成需求澄清问题"]
    },
    "90": {
      goal: "完成一个 AI 辅助产品优化小项目并复盘。",
      tasks: ["定义优化目标", "验证一个小方案", "沉淀项目复盘"],
      deliverable: "产品优化小项目复盘",
      mentorChecks: ["能否说明项目价值、方法和风险", "能否总结下一阶段计划"],
      tools: ["AI 辅助方案对比", "AI 生成复盘提纲"]
    }
  },
  engineering: {
    "30": {
      goal: "完成环境配置，理解代码结构，用 AI 辅助阅读模块。",
      tasks: ["开发环境配置", "代码结构阅读", "AI 辅助理解核心模块"],
      deliverable: "模块流程图 + 环境问题记录",
      mentorChecks: ["能否讲清模块输入、处理和输出", "能否独立定位基础问题"],
      tools: ["AI 解释代码片段", "AI 生成模块阅读问题"]
    },
    "60": {
      goal: "参与真实开发任务，建立代码质量和协作意识。",
      tasks: ["修复低风险 issue", "参与 Code Review", "用 AI 辅助测试用例"],
      deliverable: "PR 修改说明 + 测试用例清单",
      mentorChecks: ["代码是否清晰并考虑边界", "能否吸收 Review 反馈"],
      tools: ["AI 生成单测思路", "AI 检查边界条件"]
    },
    "90": {
      goal: "独立完成一个小功能或自动化工具 Demo。",
      tasks: ["定义小功能范围", "完成开发和测试", "整理技术复盘"],
      deliverable: "小功能或自动化工具 Demo",
      mentorChecks: ["能否说明实现思路和风险", "能否形成可复用经验"],
      tools: ["AI 对比技术方案", "AI 生成技术文档初稿"]
    }
  },
  operations: {
    "30": {
      goal: "理解业务指标和用户画像，用 AI 辅助内容分析。",
      tasks: ["业务指标学习", "用户画像整理", "AI 辅助内容分析"],
      deliverable: "用户画像卡 + 指标观察笔记",
      mentorChecks: ["能否说清关键指标含义", "能否识别用户真实需求"],
      tools: ["AI 整理用户评论", "AI 生成指标解释"]
    },
    "60": {
      goal: "参与一次真实运营任务，开始用 AI 生成方案并复盘数据。",
      tasks: ["参与运营任务", "用 AI 生成方案初稿", "复盘基础数据"],
      deliverable: "运营方案初稿 + 数据复盘表",
      mentorChecks: ["方案是否围绕目标用户", "复盘是否能解释数据变化"],
      tools: ["AI 生成内容方向", "AI 归纳复盘结论"]
    },
    "90": {
      goal: "独立完成一个小型运营实验。",
      tasks: ["定义实验假设", "执行小规模测试", "输出实验复盘"],
      deliverable: "小型运营实验报告",
      mentorChecks: ["能否说明实验目标和结果", "能否提出下一步优化动作"],
      tools: ["AI 生成实验方案", "AI 分析实验结果"]
    }
  },
  hr: {
    "30": {
      goal: "理解招聘、培养和员工服务流程，用 AI 辅助整理 SOP。",
      tasks: ["学习 HR 流程地图", "AI 辅助整理 SOP", "观察员工服务场景"],
      deliverable: "HR 流程地图 + SOP 摘要",
      mentorChecks: ["能否说清流程节点和责任人", "能否识别重复性工作"],
      tools: ["AI 整理制度文本", "AI 生成流程检查清单"]
    },
    "60": {
      goal: "参与一次候选人沟通或培训设计，用 AI 辅助生成反馈模板。",
      tasks: ["参与沟通或培训设计", "用 AI 生成反馈模板", "复盘沟通记录"],
      deliverable: "反馈模板 + 沟通复盘",
      mentorChecks: ["能否把业务需求转化为 HR 行动", "反馈是否具体且有温度"],
      tools: ["AI 生成访谈提纲", "AI 归纳反馈标签"]
    },
    "90": {
      goal: "完成一个 AI-HR 小工具 Demo 或流程优化方案。",
      tasks: ["识别 HR 场景痛点", "设计 AI 辅助方案", "输出流程优化 Demo"],
      deliverable: "AI-HR 小工具 Demo 或优化方案",
      mentorChecks: ["方案是否解决真实问题", "是否说明 AI 边界和人工判断"],
      tools: ["AI 生成原型文案", "AI 撰写方案说明"]
    }
  },
  design: {
    "30": {
      goal: "熟悉设计规范，用 AI 辅助灵感收集和视觉分析。",
      tasks: ["学习设计规范", "AI 辅助灵感收集", "输出视觉分析"],
      deliverable: "视觉分析卡 + 规范摘要",
      mentorChecks: ["能否说清规范使用场景", "能否说明参考案例优缺点"],
      tools: ["AI 生成灵感关键词", "AI 整理竞品观察"]
    },
    "60": {
      goal: "参与一次真实需求设计，用 AI 生成多版草图和文案。",
      tasks: ["参与需求设计", "用 AI 生成草图方向", "输出交互说明"],
      deliverable: "设计方案草图 + 交互说明",
      mentorChecks: ["方案是否回应用户问题", "表达是否清楚并能接受反馈"],
      tools: ["AI 生成界面文案", "AI 辅助方案对比"]
    },
    "90": {
      goal: "完成一个可展示的设计改版或交互优化 Demo。",
      tasks: ["定义改版目标", "完成方案迭代", "沉淀设计复盘"],
      deliverable: "设计改版或交互优化 Demo",
      mentorChecks: ["能否说明改版价值和取舍", "能否形成下一轮优化计划"],
      tools: ["AI 生成测试问题", "AI 整理设计复盘"]
    }
  }
};

export function getOption<T extends string>(options: Option<T>[], id: T) {
  return options.find((option) => option.id === id) ?? options[0];
}

export function completeProfile(profile: Partial<GrowthProfile>): GrowthProfile {
  return {
    role: profile.role ?? defaultProfile.role,
    aiLevel: profile.aiLevel ?? defaultProfile.aiLevel,
    growthGoal: profile.growthGoal ?? defaultProfile.growthGoal,
    mentorStyle: profile.mentorStyle ?? defaultProfile.mentorStyle,
    generatedAt: profile.generatedAt
  };
}

export function buildGrowthPlan(input: Partial<GrowthProfile>) {
  const profile = completeProfile(input);
  const role = getOption(roleOptions, profile.role);
  const aiLevel = getOption(aiLevelOptions, profile.aiLevel);
  const growthGoal = getOption(growthGoalOptions, profile.growthGoal);
  const mentorStyle = getOption(mentorStyleOptions, profile.mentorStyle);
  const stages = (["30", "60", "90"] as const).map((id) => {
    const content = roleStageContent[profile.role][id];
    const title =
      id === "30" ? "30 天：入门副本" : id === "60" ? "60 天：协作副本" : "90 天：产出副本";
    const subtitle =
      id === "30"
        ? "理解业务与 AI 工具"
        : id === "60"
          ? "参与协作与真实任务"
          : "完成可复盘小项目";

    return {
      id,
      title,
      subtitle,
      ...content,
      mentorChecks:
        profile.mentorStyle === "challenge"
          ? [...content.mentorChecks, "阶段交付物是否达到可验收标准"]
          : content.mentorChecks,
      tools:
        profile.aiLevel === "starter"
          ? ["AI 提示词入门练习", ...content.tools]
          : profile.aiLevel === "coCreate"
            ? [...content.tools, "AI 工作流复盘记录"]
            : content.tools
    };
  });

  return {
    profile,
    role,
    aiLevel,
    growthGoal,
    mentorStyle,
    stages
  };
}

export function buildEvaluationMetrics(profile: Partial<GrowthProfile>) {
  const plan = buildGrowthPlan(profile);
  return [
    `能否围绕「${plan.role.label}」说清岗位目标和阶段交付物`,
    `能否把 AI 从工具使用推进到「${plan.growthGoal.label}」`,
    "能否记录 AI 使用过程、人的判断依据和复盘结论",
    `是否适配「${plan.mentorStyle.label}」的导师陪伴方式`
  ];
}

