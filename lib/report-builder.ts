import { getStudents } from "@/lib/demo-store";
import { getCompletedTasks, getFitAverage, getRiskReasons, type GrowthStudent } from "@/lib/growth";
import { getDefaultStoryProfile, type StoryProfile } from "@/lib/story-content";

function escapeTex(value: string) {
  return value
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/&/g, "\\&")
    .replace(/%/g, "\\%")
    .replace(/\$/g, "\\$")
    .replace(/#/g, "\\#")
    .replace(/_/g, "\\_")
    .replace(/{/g, "\\{")
    .replace(/}/g, "\\}")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}");
}

function list(items: string[]) {
  const safeItems = items.length ? items : ["暂无记录"];
  return ["\\begin{itemize}", ...safeItems.map((item) => `  \\item ${escapeTex(item)}`), "\\end{itemize}"].join("\n");
}

export function findReportStudent(studentId?: string) {
  const students = getStudents();
  return students.find((student) => student.id === studentId) ?? students[0];
}

export function buildLatexReport(student: GrowthStudent, profile?: Partial<StoryProfile>) {
  const displayProfile = { ...getDefaultStoryProfile(), ...profile };
  const completedTasks = getCompletedTasks(student).map((task) => `${task.title}：${task.evidence}`);
  const feedback = student.feedbackHistory.slice(0, 4).map((item) => `${item.createdAt}：${item.praise} ${item.suggestion}`);
  const risks = getRiskReasons(student);
  const signals = student.tags.length ? student.tags : ["任务稳定", "反馈可追踪"];
  const filename = `emiao-growth-report-${student.id}.tex`;

  const tex = String.raw`\documentclass[UTF8]{ctexart}
\usepackage[a4paper,margin=2.4cm]{geometry}
\usepackage{xcolor}
\usepackage{enumitem}
\usepackage{hyperref}
\definecolor{TencentBlue}{HTML}{1664FF}
\definecolor{SoftGray}{HTML}{F6F8FB}
\title{\textbf{\textcolor{TencentBlue}{鹅苗成长导航复盘报告}}}
\author{鹅苗星图 Emiao Growth Map}
\date{\today}

\begin{document}
\maketitle

\section{基本信息}
\begin{itemize}[leftmargin=*]
  \item 姓名：${escapeTex(displayProfile.name || student.name)}
  \item 岗位方向：${escapeTex(displayProfile.role || student.role)}
  \item 导师：${escapeTex(displayProfile.mentor || student.mentor)}
  \item 当前阶段：${escapeTex(student.stage)}
  \item 成长能量：${student.energy}
  \item 任务完成率：${student.progress}\%
  \item 适岗信号均分：${getFitAverage(student)}
\end{itemize}

\section{岗位任务完成情况}
${list(completedTasks)}

\section{导师结构化反馈}
${list(feedback)}

\section{HRBP 适岗证据链}
\subsection{任务证据}
${list(completedTasks)}
\subsection{导师证据}
${list(feedback)}
\subsection{行为信号}
${list(signals)}
\subsection{AI 建议}
${escapeTex(student.nextAction)}

\section{AI 风险判断与边界}
当前风险线索：${escapeTex(risks.length ? risks.join("、") : "暂无明显风险")}。

\textbf{边界说明：}AI 风险判断仅作为 HRBP 与导师沟通线索，不直接作为留用、淘汰或评价依据。AI 不替代导师和 HRBP，只负责整理、提醒、归纳和初步判断，最终沟通、分寸和决策仍由人完成。

\section{下一步成长建议}
${escapeTex(student.nextAction)}

\section{课程内容映射}
\begin{itemize}[leftmargin=*]
  \item 沟通型 HR：把实习生、导师、HRBP 从私聊中连接到同一张成长地图。
  \item 分析型 HR：通过任务、反馈、行为信号形成适岗证据链。
  \item 创意型 HR：用故事、角色、星图、报告让企业文化和成长过程可感知。
  \item 技术应用型 HR：用 API、AI 反馈、LaTeX 报告和工作台把带教流程产品化。
\end{itemize}

\section{腾讯文化映射}
\begin{itemize}[leftmargin=*]
  \item 用户为本：实习生、导师、HRBP 都有清晰路径。
  \item 科技向善：AI 只辅助支持，不替代人的判断。
  \item 正直：适岗判断必须有证据链，不凭感觉贴标签。
  \item 进取：阶段任务推动新人成长。
  \item 协作：导师、实习生、HRBP 共享同一套信息。
  \item 创造：把原本散落在私聊里的带教流程做成产品。
\end{itemize}

\end{document}
`;

  return { tex, filename };
}
