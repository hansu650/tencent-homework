import {
  buildEvaluationMetrics,
  buildGrowthPlan,
  type GrowthProfile
} from "@/lib/growth-script";

function escapeLatex(value: string) {
  return value
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/&/g, "\\&")
    .replace(/%/g, "\\%")
    .replace(/\$/g, "\\$")
    .replace(/#/g, "\\#")
    .replace(/_/g, "\\_")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}");
}

function itemize(items: string[]) {
  return [
    "\\begin{itemize}",
    ...items.map((item) => `  \\item ${escapeLatex(item)}`),
    "\\end{itemize}"
  ].join("\n");
}

export function buildLatexReport(profile: Partial<GrowthProfile>) {
  const plan = buildGrowthPlan(profile);
  const metrics = buildEvaluationMetrics(plan.profile);
  const stageSections = plan.stages
    .map(
      (stage) => `
\\subsection*{${escapeLatex(stage.title)}}
\\textbf{目标：}${escapeLatex(stage.goal)}

\\textbf{关键任务}
${itemize(stage.tasks)}

\\textbf{交付物：}${escapeLatex(stage.deliverable)}

\\textbf{导师检查点}
${itemize(stage.mentorChecks)}

\\textbf{AI 工具建议}
${itemize(stage.tools)}
`
    )
    .join("\n");

  return String.raw`\documentclass[UTF8]{ctexart}
\usepackage[a4paper, margin=2.2cm]{geometry}
\usepackage{enumitem}
\usepackage{xcolor}
\usepackage{hyperref}
\setlist[itemize]{leftmargin=1.6em}
\definecolor{tencentblue}{HTML}{176BFF}
\hypersetup{colorlinks=true, linkcolor=tencentblue, urlcolor=tencentblue}

\title{\textbf{AI Native 新人 30-60-90 成长副本报告}}
\author{鹅苗成长副本}
\date{\today}

\begin{document}
\maketitle

\section*{一、基本信息}
\begin{itemize}
  \item 岗位方向：${escapeLatex(plan.role.label)}
  \item AI 基础：${escapeLatex(plan.aiLevel.label)}（${escapeLatex(plan.aiLevel.description)}）
  \item 成长目标：${escapeLatex(plan.growthGoal.label)}
  \item 导师风格：${escapeLatex(plan.mentorStyle.label)}
\end{itemize}

\section*{二、岗位成长目标}
这份成长副本帮助 HR 为 AI Native 组织的新员工设计三个月学习与融入计划，让新人从“会用 AI”走向“能和 AI 协作共创”。

\section*{三、30-60-90 成长副本}
${stageSections}

\section*{四、导师验收卡}
\subsection*{30 天看融入}
${itemize(["能否说清业务目标和团队角色", "能否独立使用基础 AI 工具完成信息整理", "能否主动提出 2-3 个有效问题"])}

\subsection*{60 天看协作}
${itemize(["能否用 AI 辅助拆解一个真实任务", "能否和同事对齐问题、进度和交付物", "能否记录 AI 使用过程和反思"])}

\subsection*{90 天看产出}
${itemize(["能否独立完成一个可展示的小项目", "能否说明项目价值、方法和风险", "能否形成下一阶段成长计划"])}

\section*{五、AI 工具建议}
AI 可以辅助生成学习路径、整理任务、提出导师检查点和报告初稿，但每一项结果都需要结合真实业务场景复核。

\section*{六、HR 评估指标}
${itemize(metrics)}

\section*{七、AI 边界说明}
AI 只辅助生成学习路径、整理任务和建议检查点，不替代导师与 HR 对新人真实表现的判断。对新人的评价应基于任务、交付物、导师观察和本人复盘，而不是凭感觉贴标签。

\section*{八、课程内容映射}
${itemize([
    "创意型 HR：把新人培养从普通清单变成成长副本，让抽象路径变得可感知。",
    "分析型 HR：根据岗位、AI 基础和成长目标拆解阶段任务、交付物和验收指标。",
    "沟通型 HR：让新人、导师、HR 对齐同一份成长路径和检查标准。",
    "技术应用型 HR：用系统和 AI 把培养计划生成、导师验收和报告导出产品化。"
  ])}

\section*{九、腾讯文化映射}
${itemize([
    "用户为本：新人和导师都能看懂下一步。",
    "科技向善：AI 辅助成长，不替代人的判断。",
    "正直：评估基于任务、交付物和导师观察，不凭感觉贴标签。",
    "进取：30-60-90 阶段推动持续成长。",
    "协作：新人、导师、HR 对齐同一份成长副本。",
    "创造：用 AI Native 方式重塑新人培养。"
  ])}

\end{document}
`;
}

export function buildHtmlReport(profile: Partial<GrowthProfile>) {
  const plan = buildGrowthPlan(profile);
  const metrics = buildEvaluationMetrics(plan.profile);

  return {
    plan,
    metrics,
    sections: [
      "基本信息",
      "岗位成长目标",
      "30 天入门副本",
      "60 天协作副本",
      "90 天产出副本",
      "导师验收卡",
      "AI 工具建议",
      "HR 评估指标",
      "AI 边界说明",
      "课程内容映射",
      "腾讯文化映射"
    ]
  };
}

export function reportFilename(profile: Partial<GrowthProfile>) {
  const plan = buildGrowthPlan(profile);
  return `emiao-growth-script-${plan.profile.role}-${plan.profile.aiLevel}.tex`;
}

