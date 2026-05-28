"use client";

import { useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BookOpen,
  BrainCircuit,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  ClipboardCheck,
  Clock3,
  Download,
  Eye,
  FileText,
  Filter,
  GraduationCap,
  Handshake,
  HeartHandshake,
  Layers,
  Lightbulb,
  Loader2,
  Map,
  MessageSquareText,
  Network,
  RefreshCw,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  UserRound,
  UsersRound,
  WandSparkles
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis
} from "recharts";

import { StarMap } from "@/components/star-map";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import type { InternshipRole } from "@/data/mockStudents";
import {
  buildFeedbackBlocks,
  deriveRiskLevel,
  getCoachAdvice,
  getCompletedTasks,
  getFitAverage,
  getPriorityActions,
  getRiskMeta,
  getRiskReasons,
  getWeeklySummary,
  growthStages,
  hydrateStudents,
  normalizeStudent,
  roleTasks,
  type GrowthStudent,
  type MentorFeedback
} from "@/lib/growth";
import { average, cn } from "@/lib/utils";

type ActiveRole = "student" | "mentor" | "hr";
type RoleFilter = "全部" | InternshipRole;
type GrowthFilter = "全部" | "稳定成长" | "需关注" | "高适岗";

const initialStudents = hydrateStudents();
const chartColors = ["#1664FF", "#00C2FF", "#22C55E", "#F59E0B", "#EF4444"];

const tooltipStyle = {
  background: "#07111F",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 12,
  color: "#fff",
  boxShadow: "0 16px 40px rgba(0,0,0,0.28)"
};

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function calcEnergy(student: GrowthStudent, progress = student.progress) {
  return Math.min(
    100,
    Math.max(0, Math.round(34 + progress * 0.46 + student.feedbackCount * 4 + getFitAverage(student) * 0.13))
  );
}

function inferTags(note: string, student: GrowthStudent) {
  const nextTags = new Set(student.tags.filter((tag) => tag !== "反馈缺失"));
  if (note.includes("主动")) nextTags.add("主动提问");
  if (note.includes("协作") || note.includes("沟通")) nextTags.add("协作强");
  if (note.includes("需求")) nextTags.add("需求拆解");
  if (note.includes("客户")) nextTags.add("客户敏感");
  if (note.includes("代码") || note.includes("Review")) nextTags.add("代码规范");
  if (student.feedbackCount + 1 >= 3) nextTags.add("反馈及时");
  return Array.from(nextTags).slice(0, 5);
}

function SectionTitle({
  eyebrow,
  title,
  description,
  tag
}: {
  eyebrow: string;
  title: string;
  description: string;
  tag?: string;
}) {
  return (
    <div className="mx-auto mb-8 max-w-3xl text-center">
      <div className="mb-4 flex flex-wrap justify-center gap-2">
        <Badge variant="blue">{eyebrow}</Badge>
        {tag && <Badge variant="green">{tag}</Badge>}
      </div>
      <h2 className="text-balance text-3xl font-semibold tracking-normal text-white sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-7 text-slate-300">{description}</p>
    </div>
  );
}

export function EmiaoGrowthMap() {
  const [studentsState, setStudentsState] = useState<GrowthStudent[]>(() => initialStudents);
  const [activeRole, setActiveRole] = useState<ActiveRole>("student");
  const [selectedStudentId, setSelectedStudentId] = useState(initialStudents[0]?.id ?? "");
  const [weeklyLoading, setWeeklyLoading] = useState(false);
  const [reportVariant, setReportVariant] = useState(0);
  const [exported, setExported] = useState(false);

  const currentStudent = studentsState.find((student) => student.id === selectedStudentId) ?? studentsState[0];

  const updateStudent = (studentId: string, updater: (student: GrowthStudent) => GrowthStudent) => {
    setStudentsState((current) =>
      current.map((student) => (student.id === studentId ? normalizeStudent(updater(student)) : student))
    );
  };

  const handleToggleTask = (studentId: string, taskId: string) => {
    updateStudent(studentId, (student) => {
      const wasCompleted = student.completedTaskIds.includes(taskId);
      const completedTaskIds = wasCompleted
        ? student.completedTaskIds.filter((id) => id !== taskId)
        : [...student.completedTaskIds, taskId];
      const progress = Math.round((completedTaskIds.length / roleTasks[student.role].length) * 100);
      const nextTags = progress >= 75
        ? student.tags.filter((tag) => tag !== "任务滞后")
        : student.tags;

      return {
        ...student,
        completedTaskIds,
        progress,
        tags: nextTags,
        energy: calcEnergy({ ...student, completedTaskIds, progress, tags: nextTags }, progress)
      };
    });
  };

  const handleFeedbackSaved = (studentId: string, feedback: MentorFeedback) => {
    updateStudent(studentId, (student) => {
      const feedbackCount = student.feedbackCount + 1;
      const tags = inferTags(feedback.sourceNote, { ...student, feedbackCount });
      const progress = Math.min(100, student.progress + 3);

      return {
        ...student,
        feedbackCount,
        tags,
        progress,
        energy: calcEnergy({ ...student, feedbackCount, tags, progress }, progress),
        lastFeedback: `${feedback.praise} ${feedback.suggestion}`,
        nextAction: feedback.action,
        feedbackHistory: [feedback, ...student.feedbackHistory].slice(0, 4)
      };
    });
  };

  const regenerateReport = () => {
    setWeeklyLoading(true);
    window.setTimeout(() => {
      setReportVariant((variant) => variant + 1);
      setWeeklyLoading(false);
    }, 850);
  };

  return (
    <TooltipProvider>
      <main className="min-h-screen overflow-hidden bg-transparent">
        <Hero studentsState={studentsState} />
        <ProblemDiagnosis />
        <BeforeAfterSection />
        <section id="demo" className="relative px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <RoleEntrance activeRole={activeRole} onChange={setActiveRole} />
            <AnimatePresence mode="wait">
              <motion.div
                key={activeRole}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                transition={{ duration: 0.35 }}
                className="mt-8"
              >
                {activeRole === "student" && currentStudent && (
                  <StudentWorkbench
                    students={studentsState}
                    selectedStudentId={currentStudent.id}
                    onSelectStudent={setSelectedStudentId}
                    onToggleTask={handleToggleTask}
                  />
                )}
                {activeRole === "mentor" && (
                  <MentorWorkbench students={studentsState} onFeedbackSaved={handleFeedbackSaved} />
                )}
                {activeRole === "hr" && <HrWorkbench students={studentsState} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </section>
        <OverviewDashboard
          students={studentsState}
          weeklyLoading={weeklyLoading}
          reportVariant={reportVariant}
          onRegenerate={regenerateReport}
        />
        <AiCapabilitySection />
        <CourseMappingSection />
        <CultureSection />
        <ImpactSection />
        <ClosingCta
          exported={exported}
          onExport={() => {
            setExported(true);
            scrollToSection("overview");
          }}
        />
      </main>
    </TooltipProvider>
  );
}

function Hero({ studentsState }: { studentsState: GrowthStudent[] }) {
  const focusCount = studentsState.filter((student) => student.riskLevel !== "low").length;
  const highFit = studentsState.filter((student) => getFitAverage(student) >= 85 && student.riskLevel === "low").length;
  const avgProgress = average(studentsState.map((student) => student.progress));

  const valueCards = [
    {
      title: "实习生",
      desc: "知道下一步该做什么",
      icon: GraduationCap,
      color: "text-cyan-200"
    },
    {
      title: "导师",
      desc: "标准化带教，不再全凭经验",
      icon: HeartHandshake,
      color: "text-emerald-200"
    },
    {
      title: "HR",
      desc: "看见过程数据，提前识别风险",
      icon: BarChart3,
      color: "text-amber-200"
    }
  ];

  return (
    <section className="relative min-h-screen px-4 pb-12 pt-6 sm:px-6 lg:px-8">
      <div className="absolute inset-0 grid-pattern opacity-80" />
      <div className="absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-blue-500/20 blur-3xl" />
      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 shadow-inner-glass backdrop-blur-xl">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/20 text-cyan-100">
            <Map className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white">鹅苗星图</p>
            <p className="truncate text-xs text-slate-400">Emiao Growth Map</p>
          </div>
        </div>
        <div className="hidden items-center gap-2 text-sm text-slate-300 md:flex">
          <button className="rounded-lg px-3 py-2 hover:bg-white/10" onClick={() => scrollToSection("overview")}>
            总览
          </button>
          <button className="rounded-lg px-3 py-2 hover:bg-white/10" onClick={() => scrollToSection("ai-design")}>
            AI 设计
          </button>
          <button className="rounded-lg px-3 py-2 hover:bg-white/10" onClick={() => scrollToSection("impact")}>
            效果评估
          </button>
        </div>
      </nav>

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-10 pt-16 lg:min-h-[calc(100vh-120px)] lg:grid-cols-[1.02fr_0.98fr] lg:pt-8">
        <div className="min-w-0">
          <Badge variant="blue" className="mb-5">
            作业四 · 实习能量站
          </Badge>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <h1 className="text-balance text-5xl font-semibold tracking-normal text-white sm:text-6xl lg:text-7xl">
              鹅苗星图
            </h1>
            <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-medium text-cyan-100">
              Emiao Growth Map
            </span>
          </div>
          <h2 className="text-balance text-3xl font-semibold tracking-normal text-cyan-100 sm:text-4xl">
            AI 实习生成长导航看板
          </h2>
          <p className="mt-5 max-w-2xl text-xl leading-8 text-slate-200">
            让每个新人被看见、被支持、被更好地成长
          </p>
          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300">
            把实习生、导师和 HR 放到同一张成长地图上，用 AI 连接任务、反馈、风险和适岗信号。
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Badge variant="green">科技向善：AI 辅助支持，不替代人的判断</Badge>
            <Badge variant="blue">星图视觉 = 创意型 HR</Badge>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" className="shimmer-surface" onClick={() => scrollToSection("demo")}>
              开始体验
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="secondary" onClick={() => scrollToSection("ai-design")}>
              查看方案逻辑
              <Sparkles className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
        <ProductPreview avgProgress={avgProgress} focusCount={focusCount} highFit={highFit} />
      </div>

      <div className="relative z-10 mx-auto mt-8 grid max-w-7xl gap-4 md:grid-cols-3">
        {valueCards.map((card) => (
          <Card key={card.title} className="border-beam">
            <CardHeader className="pb-3">
              <card.icon className={cn("h-6 w-6", card.color)} />
              <CardTitle>{card.title}</CardTitle>
              <CardDescription>{card.desc}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
}

function ProductPreview({
  avgProgress,
  focusCount,
  highFit
}: {
  avgProgress: number;
  focusCount: number;
  highFit: number;
}) {
  const miniCards = [
    {
      title: "AI 周报",
      value: `${avgProgress}%`,
      desc: "平均成长进度",
      icon: FileText,
      color: "text-cyan-100"
    },
    {
      title: "风险提醒",
      value: `${focusCount} 人`,
      desc: "需 HRBP 关注",
      icon: CircleAlert,
      color: "text-amber-100"
    },
    {
      title: "成长路径",
      value: `${highFit} 人`,
      desc: "高适岗信号",
      icon: BadgeCheck,
      color: "text-emerald-100"
    }
  ];

  return (
    <div className="border-beam relative mx-auto w-full max-w-[560px] rounded-2xl border border-white/10 bg-white/[0.075] p-3 shadow-glow backdrop-blur-xl sm:p-4">
      <div className="mb-3 flex items-center justify-between gap-3 px-1">
        <div>
          <p className="text-sm font-semibold text-white">真实产品预览</p>
          <p className="text-xs text-slate-400">任务、反馈、风险在同一张图里流动</p>
        </div>
        <Badge variant="green">创造：带教流程产品化</Badge>
      </div>
      <StarMap />
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {miniCards.map((item) => (
          <div key={item.title} className="rounded-xl border border-white/10 bg-[#07111F]/75 p-3">
            <div className="mb-2 flex items-center justify-between">
              <item.icon className={cn("h-4 w-4", item.color)} />
              <span className="text-lg font-semibold text-white">{item.value}</span>
            </div>
            <p className="text-sm font-medium text-white">{item.title}</p>
            <p className="mt-1 text-xs text-slate-400">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProblemDiagnosis() {
  const problems = [
    {
      title: "实习生迷茫",
      desc: "不知道不同阶段该学什么、交付什么、做到什么程度。",
      consequence: "成长靠猜，主动性容易被误判。",
      ai: "AI 根据阶段、岗位任务和风险信号生成下一步建议。",
      icon: CircleAlert
    },
    {
      title: "导师凭经验",
      desc: "带教节奏和反馈标准不统一。",
      consequence: "同一批新人获得的支持不均衡。",
      ai: "AI 提醒反馈节点，把观察转成结构化成长证据。",
      icon: ClipboardCheck
    },
    {
      title: "HR 信息断点",
      desc: "进度、风险、适岗情况散落在私聊里。",
      consequence: "HRBP 很难提前识别风险和高潜信号。",
      ai: "AI 汇总任务、反馈、风险，形成可追溯周报。",
      icon: Network
    }
  ];

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionTitle
          eyebrow="问题诊断"
          title="这不是“做一张表”，而是把新人支持机制产品化"
          description="作业四的核心不是更严地管理实习生，而是让成长过程从私聊和经验里浮出来，让每个角色都能在合适时间做出更好的支持动作。"
        />
        <div className="grid gap-4 md:grid-cols-3">
          {problems.map((problem) => (
            <Card key={problem.title} className="group transition hover:-translate-y-1 hover:border-cyan-300/30">
              <CardHeader>
                <problem.icon className="h-7 w-7 text-cyan-200" />
                <CardTitle>{problem.title}</CardTitle>
                <CardDescription>{problem.desc}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="rounded-lg bg-red-500/10 p-3 text-red-100">
                  后果：{problem.consequence}
                </div>
                <div className="rounded-lg bg-blue-500/10 p-3 text-blue-100">
                  AI 介入点：{problem.ai}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function BeforeAfterSection() {
  const before = ["私聊问进度", "导师凭经验", "HR 看不到风险"];
  const after = ["任务上墙", "反馈沉淀", "风险可追踪", "适岗有证据"];

  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border-red-300/15">
            <CardHeader>
              <Badge variant="red" className="w-fit">Before</Badge>
              <CardTitle>原来的带教流程散落在私聊里</CardTitle>
              <CardDescription>每个人都在努力，但信息没有沉淀成共同视图。</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {before.map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-xl bg-white/[0.055] p-3 text-sm text-slate-200">
                  <CircleAlert className="h-4 w-4 shrink-0 text-red-200" />
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="border-emerald-300/20">
            <CardHeader>
              <Badge variant="green" className="w-fit">After</Badge>
              <CardTitle>鹅苗星图把成长闭环拉到同一张看板</CardTitle>
              <CardDescription>多角色同步信息，风险有证据，适岗判断有过程。</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {after.map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-xl bg-emerald-400/10 p-3 text-sm text-emerald-50">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-200" />
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

function RoleEntrance({
  activeRole,
  onChange
}: {
  activeRole: ActiveRole;
  onChange: (role: ActiveRole) => void;
}) {
  const roles = [
    {
      id: "student" as const,
      label: "我是实习生",
      desc: "看清本周任务、阶段目标和 AI 陪跑建议",
      icon: UserRound,
      culture: "用户为本"
    },
    {
      id: "mentor" as const,
      label: "我是导师",
      desc: "看带教清单，快速生成有温度的反馈",
      icon: Handshake,
      culture: "协作"
    },
    {
      id: "hr" as const,
      label: "我是 HR / HRBP",
      desc: "看 20 位实习生全景、风险和适岗信号",
      icon: UsersRound,
      culture: "正直"
    }
  ];

  return (
    <div>
      <SectionTitle
        eyebrow="角色入口"
        tag="沟通型 HR"
        title="同一张成长地图，三种角色工作台"
        description="用户为本不是只服务一个角色。实习生看到下一步，导师看到带教节奏，HR 看到过程数据。"
      />
      <div className="grid gap-4 md:grid-cols-3">
        {roles.map((role) => {
          const isActive = role.id === activeRole;
          return (
            <button
              key={role.id}
              onClick={() => onChange(role.id)}
              className={cn(
                "min-w-0 rounded-xl border p-5 text-left transition focus:outline-none focus:ring-2 focus:ring-cyan-300",
                isActive
                  ? "border-cyan-300/50 bg-cyan-400/[0.12] shadow-glow"
                  : "border-white/10 bg-white/[0.06] hover:border-white/20 hover:bg-white/[0.1]"
              )}
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/10 text-cyan-100">
                  <role.icon className="h-6 w-6" />
                </div>
                <Badge variant={isActive ? "green" : "default"}>{role.culture}</Badge>
              </div>
              <h3 className="text-lg font-semibold text-white">{role.label}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">{role.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function OverviewDashboard({
  students,
  weeklyLoading,
  reportVariant,
  onRegenerate
}: {
  students: GrowthStudent[];
  weeklyLoading: boolean;
  reportVariant: number;
  onRegenerate: () => void;
}) {
  const total = students.length;
  const taskRate = average(students.map((student) => student.progress));
  const feedbackRate = Math.round((students.filter((student) => student.feedbackCount >= 2).length / total) * 100);
  const focusCount = students.filter((student) => student.riskLevel !== "low").length;
  const highFit = students.filter((student) => getFitAverage(student) >= 85 && student.riskLevel === "low").length;

  const roleDistribution = ["研发", "产品", "销售"].map((role) => ({
    name: role,
    value: students.filter((student) => student.role === role).length
  }));

  const stageDistribution = growthStages.map((stage) => ({
    name: stage,
    value: students.filter((student) => student.stage === stage).length
  }));

  const riskDistribution = ["任务滞后", "反馈缺失", "目标不清", "融入慢"].map((reason) => ({
    name: reason,
    value: students.filter((student) => getRiskReasons(student).includes(reason)).length
  }));

  const kpis = [
    { label: "实习生总数", value: `${total}`, icon: UsersRound, color: "text-cyan-200" },
    { label: "本周任务完成率", value: `${taskRate}%`, icon: CheckCircle2, color: "text-emerald-200" },
    { label: "导师反馈及时率", value: `${feedbackRate}%`, icon: Clock3, color: "text-amber-200" },
    { label: "需关注人数", value: `${focusCount}`, icon: CircleAlert, color: "text-red-200" },
    { label: "高适岗信号", value: `${highFit}`, icon: BadgeCheck, color: "text-blue-200" }
  ];

  return (
    <section id="overview" className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionTitle
          eyebrow="总览看板"
          tag="分析型 HR"
          title="HRBP 能一眼看懂这批新人的状态"
          description="总览 KPI、风险图表和 AI 周报都来自当前 studentsState；任务和反馈变化后，这里会同步更新。"
        />
        <div className="mb-4 grid gap-3 lg:grid-cols-[1fr_1fr]">
          <CultureRibbon
            items={[
              "进取：阶段任务推动成长",
              "正直：风险判断有证据",
              "科技向善：AI 只辅助支持"
            ]}
          />
          <HrPriorityCard students={students} compact />
        </div>
        <div className="grid gap-4 md:grid-cols-5">
          {kpis.map((kpi) => (
            <Card key={kpi.label} className="min-h-[132px]">
              <CardHeader className="pb-2">
                <kpi.icon className={cn("h-5 w-5", kpi.color)} />
                <CardDescription>{kpi.label}</CardDescription>
                <CardTitle className="text-3xl">{kpi.value}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr_1.08fr]">
          <Card>
            <CardHeader>
              <CardTitle>岗位分布</CardTitle>
              <CardDescription>研发 / 产品 / 销售</CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={roleDistribution} innerRadius={56} outerRadius={88} dataKey="value" paddingAngle={4}>
                    {roleDistribution.map((entry, index) => (
                      <Cell key={entry.name} fill={chartColors[index]} />
                    ))}
                  </Pie>
                  <ChartTooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>成长阶段分布</CardTitle>
              <CardDescription>入营 → 上手 → 协同 → 产出 → 适岗复盘</CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stageDistribution}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: "#CBD5E1", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#CBD5E1", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <ChartTooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="#00C2FF" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="border-beam">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="mb-2 flex flex-wrap gap-2">
                    <Badge variant="blue">技术应用型 HR</Badge>
                    <Badge variant="green">AI 周报联动</Badge>
                  </div>
                  <CardTitle>AI 本周成长简报</CardTitle>
                  <CardDescription>根据当前任务、反馈和风险实时生成</CardDescription>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={onRegenerate}
                      disabled={weeklyLoading}
                      aria-label="重新生成周报"
                    >
                      {weeklyLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>重新生成周报</TooltipContent>
                </Tooltip>
              </div>
            </CardHeader>
            <CardContent>
              {weeklyLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-11/12" />
                  <Skeleton className="h-4 w-10/12" />
                </div>
              ) : (
                <p className="text-sm leading-7 text-slate-200">{getWeeklySummary(students, reportVariant)}</p>
              )}
              <div className="mt-5 h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={riskDistribution} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" tick={{ fill: "#CBD5E1", fontSize: 12 }} axisLine={false} tickLine={false} width={72} />
                    <ChartTooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="value" radius={[0, 8, 8, 0]} fill="#F59E0B" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

function StudentWorkbench({
  students,
  selectedStudentId,
  onSelectStudent,
  onToggleTask
}: {
  students: GrowthStudent[];
  selectedStudentId: string;
  onSelectStudent: (studentId: string) => void;
  onToggleTask: (studentId: string, taskId: string) => void;
}) {
  const student = students.find((item) => item.id === selectedStudentId) ?? students[0];
  const tasks = roleTasks[student.role];
  const doneCount = student.completedTaskIds.length;
  const risk = getRiskMeta(student.riskLevel);

  return (
    <Card className="border-cyan-300/20">
      <CardHeader>
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge variant="green">实习生工作台</Badge>
              <Badge variant="blue">进取：阶段任务推动成长</Badge>
            </div>
            <CardTitle className="text-2xl">{student.role}实习生 / {student.stage}</CardTitle>
            <CardDescription>不同岗位看到不同任务，AI 陪跑建议会跟随岗位和风险变化。</CardDescription>
          </div>
          <label className="w-full min-w-0 md:w-72">
            <span className="mb-2 block text-xs text-slate-400">选择实习生</span>
            <select
              value={student.id}
              onChange={(event) => onSelectStudent(event.target.value)}
              className="h-11 w-full rounded-lg border border-white/[0.12] bg-[#07111F] px-3 text-sm text-white outline-none ring-blue-400 transition focus:ring-2"
            >
              {students.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} · {item.role} · {item.stage}
                </option>
              ))}
            </select>
          </label>
        </div>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MiniStat label="成长能量值" value={`${student.energy}`} />
            <MiniStat label="任务完成率" value={`${student.progress}%`} />
            <MiniStat label="导师反馈" value={`${student.feedbackCount} 次`} />
            <MiniStat label="风险状态" value={risk.label} tone={student.riskLevel} />
          </div>
          <div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-semibold text-white">我的成长地图</h3>
              <Badge variant="blue">Day 1 / 7 / 14 / 30 / 60 / 90</Badge>
            </div>
            <div className="grid gap-2 sm:grid-cols-5">
              {growthStages.map((stage) => {
                const activeIndex = growthStages.indexOf(student.stage);
                const stageIndex = growthStages.indexOf(stage);
                return (
                  <div
                    key={stage}
                    className={cn(
                      "rounded-xl border p-3 text-center text-sm",
                      stage === student.stage
                        ? "border-cyan-300/50 bg-cyan-300/[0.12] text-cyan-50"
                        : stageIndex < activeIndex
                          ? "border-emerald-300/25 bg-emerald-300/10 text-emerald-100"
                          : "border-white/10 bg-white/[0.05] text-slate-300"
                    )}
                  >
                    {stage}
                  </div>
                );
              })}
            </div>
          </div>
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-white">{student.role}岗位本周任务</h3>
              <span className="text-sm text-slate-300">{doneCount}/{tasks.length}</span>
            </div>
            <Progress value={student.progress} className="mb-4" />
            <div className="grid gap-3">
              {tasks.map((task) => {
                const completed = student.completedTaskIds.includes(task.id);
                return (
                  <button
                    key={task.id}
                    onClick={() => onToggleTask(student.id, task.id)}
                    className={cn(
                      "flex min-w-0 items-start gap-3 rounded-xl border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-cyan-300",
                      completed
                        ? "border-emerald-300/30 bg-emerald-400/10"
                        : "border-white/10 bg-white/[0.05] hover:bg-white/[0.09]"
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border",
                        completed
                          ? "border-emerald-300 bg-emerald-400 text-slate-950"
                          : "border-white/20 text-transparent"
                      )}
                    >
                      <Check className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-slate-100">{task.title}</span>
                      <span className="mt-1 block text-xs leading-5 text-slate-400">{task.evidence}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-cyan-300/20 bg-cyan-400/10 p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-300/15">
              <WandSparkles className="h-5 w-5 text-cyan-100" />
            </div>
            <div>
              <h3 className="font-semibold text-white">AI 陪跑建议</h3>
              <p className="text-xs text-slate-300">根据岗位、进度、风险动态生成</p>
            </div>
          </div>
          <p className="text-sm leading-7 text-cyan-50">{getCoachAdvice(student)}</p>
          <div className="mt-5 rounded-lg bg-white/10 p-3 text-sm leading-6 text-slate-200">
            这不是管理提醒，而是成长提醒：把问题说清楚、把反馈记下来，本身就是被看见的成长证据。
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {getRiskReasons(student).length ? (
              getRiskReasons(student).map((reason) => (
                <Badge key={reason} variant="yellow">{reason}</Badge>
              ))
            ) : (
              <Badge variant="green">节奏稳定</Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MentorWorkbench({
  students,
  onFeedbackSaved
}: {
  students: GrowthStudent[];
  onFeedbackSaved: (studentId: string, feedback: MentorFeedback) => void;
}) {
  const waitingList = students.filter((student) => student.feedbackCount < 2 || getRiskReasons(student).includes("反馈缺失"));
  const initialTarget = waitingList[0]?.id ?? students[0]?.id ?? "";
  const [targetId, setTargetId] = useState(initialTarget);
  const [observation, setObservation] = useState("");
  const [feedback, setFeedback] = useState<MentorFeedback | null>(null);
  const [loading, setLoading] = useState(false);
  const target = students.find((student) => student.id === targetId) ?? students[0];
  const timelyRate = Math.round((students.filter((student) => student.feedbackCount >= 2).length / students.length) * 100);

  const generateFeedback = () => {
    if (!target) return;
    setLoading(true);
    window.setTimeout(() => {
      const generated = buildFeedbackBlocks(target, observation);
      setFeedback(generated);
      onFeedbackSaved(target.id, generated);
      setObservation("");
      setLoading(false);
    }, 700);
  };

  return (
    <Card className="border-emerald-300/20">
      <CardHeader>
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge variant="green">导师工作台</Badge>
              <Badge variant="blue">技术应用型 HR</Badge>
              <Badge variant="green">协作：导师与 HR 同步信息</Badge>
            </div>
            <CardTitle className="text-2xl">今日带教清单</CardTitle>
            <CardDescription>把经验沉淀成节奏，把观察转成可写回学生档案的反馈。</CardDescription>
          </div>
          <label className="w-full min-w-0 lg:w-80">
            <span className="mb-2 block text-xs text-slate-400">选择反馈对象</span>
            <select
              value={target?.id}
              onChange={(event) => {
                setTargetId(event.target.value);
                setFeedback(null);
              }}
              className="h-11 w-full rounded-lg border border-white/[0.12] bg-[#07111F] px-3 text-sm text-white outline-none ring-blue-400 transition focus:ring-2"
            >
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} · {student.role} · 已反馈 {student.feedbackCount} 次
                </option>
              ))}
            </select>
          </label>
        </div>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="grid gap-4">
          <MiniStat label="反馈及时率" value={`${timelyRate}%`} />
          <div className="rounded-xl border border-white/10 bg-white/[0.06] p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-white">待反馈列表</h3>
              <Badge variant={waitingList.length ? "yellow" : "green"}>{waitingList.length} 人</Badge>
            </div>
            <div className="space-y-2">
              {(waitingList.length ? waitingList : students.slice(0, 3)).map((student) => (
                <button
                  key={student.id}
                  onClick={() => {
                    setTargetId(student.id);
                    setFeedback(null);
                  }}
                  className="flex w-full items-center justify-between gap-3 rounded-lg bg-white/[0.055] px-3 py-2 text-left text-sm transition hover:bg-white/10"
                >
                  <span className="min-w-0 truncate text-slate-200">{student.name} · {student.role}</span>
                  <span className="shrink-0 text-xs text-slate-400">{student.feedbackCount} 次</span>
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.06] p-4">
            <h3 className="mb-2 font-semibold text-white">本周 1v1 提醒</h3>
            <p className="text-sm leading-6 text-slate-300">
              优先覆盖反馈少于 2 次、目标不清、任务滞后的同学。AI 只整理线索，真正的沟通仍由导师完成。
            </p>
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.06] p-5">
          <div className="mb-4 flex items-center gap-3">
            <BrainCircuit className="h-6 w-6 text-cyan-100" />
            <div>
              <h3 className="font-semibold text-white">AI 反馈生成器</h3>
              <p className="text-sm text-slate-300">生成后会写入 {target?.name} 的学生详情。</p>
            </div>
          </div>
          <Textarea
            value={observation}
            onChange={(event) => setObservation(event.target.value)}
            placeholder="输入你观察到的实习生表现，例如：能主动提问，但需求拆解还不够深入。"
          />
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button onClick={generateFeedback} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              生成并写入反馈
            </Button>
            <p className="text-xs text-slate-400">反馈会更新 lastFeedback、feedbackCount、tags 和风险状态。</p>
          </div>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 grid gap-3"
            >
              <FeedbackBlock title="肯定" content={feedback.praise} tone="green" />
              <FeedbackBlock title="建议" content={feedback.suggestion} tone="blue" />
              <FeedbackBlock title="下周行动" content={feedback.action} tone="yellow" />
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function HrWorkbench({ students }: { students: GrowthStudent[] }) {
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("全部");
  const [growthFilter, setGrowthFilter] = useState<GrowthFilter>("全部");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const roleMatched = roleFilter === "全部" || student.role === roleFilter;
      const growthMatched =
        growthFilter === "全部" ||
        (growthFilter === "稳定成长" && student.riskLevel === "low") ||
        (growthFilter === "需关注" && student.riskLevel !== "low") ||
        (growthFilter === "高适岗" && getFitAverage(student) >= 85 && student.riskLevel === "low");
      return roleMatched && growthMatched;
    });
  }, [roleFilter, growthFilter, students]);

  const selectedStudent = students.find((student) => student.id === selectedStudentId) ?? null;

  return (
    <Card className="border-blue-300/20">
      <CardHeader>
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge variant="blue">HR / HRBP 工作台</Badge>
              <Badge variant="green">正直：风险判断有证据</Badge>
            </div>
            <CardTitle className="text-2xl">20 名实习生全景卡片</CardTitle>
            <CardDescription>卡片展示进度、反馈次数、风险原因和下一步动作；点击查看适岗证据链。</CardDescription>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <FilterGroup
              icon={<BriefcaseBusiness className="h-4 w-4" />}
              options={["全部", "研发", "产品", "销售"]}
              value={roleFilter}
              onChange={(value) => setRoleFilter(value as RoleFilter)}
            />
            <FilterGroup
              icon={<Filter className="h-4 w-4" />}
              options={["全部", "稳定成长", "需关注", "高适岗"]}
              value={growthFilter}
              onChange={(value) => setGrowthFilter(value as GrowthFilter)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <HrPriorityCard students={students} />
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {filteredStudents.map((student) => {
            const risk = getRiskMeta(student.riskLevel);
            const fitAverage = getFitAverage(student);
            const reasons = getRiskReasons(student);
            return (
              <button
                key={student.id}
                onClick={() => setSelectedStudentId(student.id)}
                className="group min-w-0 rounded-xl border border-white/10 bg-white/[0.055] p-4 text-left transition hover:-translate-y-1 hover:border-cyan-300/35 hover:bg-white/[0.09] focus:outline-none focus:ring-2 focus:ring-cyan-300"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-semibold text-white">{student.name}</h3>
                    <p className="mt-1 text-xs text-slate-400">{student.role} · 导师 {student.mentor}</p>
                  </div>
                  <Badge variant={risk.variant}>{risk.label}</Badge>
                </div>
                <div className="mb-3 flex flex-wrap gap-2">
                  <Badge variant="default">{student.stage}</Badge>
                  {fitAverage >= 85 && <Badge variant="green">高适岗 {fitAverage}</Badge>}
                </div>
                <div className="space-y-3">
                  <MetricLine label="任务进度" value={student.progress} />
                  <MetricLine label="成长能量" value={student.energy} />
                </div>
                <div className="mt-4 grid gap-2 text-xs text-slate-300">
                  <div className="rounded-lg bg-white/[0.08] p-2">导师反馈：{student.feedbackCount} 次</div>
                  <div className="rounded-lg bg-white/[0.08] p-2">
                    风险原因：{reasons.length ? reasons.join("、") : "暂无明显风险"}
                  </div>
                  <div className="line-clamp-2 rounded-lg bg-cyan-400/10 p-2 text-cyan-50">
                    下一步：{student.nextAction}
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-cyan-100">
                  查看证据链
                  <ChevronRight className="ml-1 h-4 w-4 transition group-hover:translate-x-1" />
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
      <StudentDetailSheet
        student={selectedStudent}
        open={Boolean(selectedStudent)}
        onOpenChange={(open) => {
          if (!open) setSelectedStudentId(null);
        }}
      />
    </Card>
  );
}

function StudentDetailSheet({
  student,
  open,
  onOpenChange
}: {
  student: GrowthStudent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!student) {
    return <Sheet open={open} onOpenChange={onOpenChange} />;
  }

  const radarData = [
    { subject: "业务理解", value: student.fitSignals.businessUnderstanding },
    { subject: "学习速度", value: student.fitSignals.learningSpeed },
    { subject: "协作沟通", value: student.fitSignals.collaboration },
    { subject: "执行质量", value: student.fitSignals.execution },
    { subject: "主动性", value: student.fitSignals.initiative }
  ];
  const risk = getRiskMeta(student.riskLevel);
  const reasons = getRiskReasons(student);
  const completedTasks = getCompletedTasks(student);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{student.name} · 成长详情</SheetTitle>
          <SheetDescription>
            {student.role}实习生，导师 {student.mentor}，当前阶段 {student.stage}
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-3">
            <MiniStat label="任务进度" value={`${student.progress}%`} />
            <MiniStat label="反馈次数" value={`${student.feedbackCount}`} />
            <MiniStat label="适岗信号" value={`${getFitAverage(student)}`} />
          </div>
          <div className="rounded-xl border border-amber-300/25 bg-amber-400/10 p-4 text-sm leading-7 text-amber-50">
            AI 风险判断只作为沟通线索，不直接作为录用或淘汰依据；最终判断必须结合导师访谈、业务反馈和 HRBP 的人情分寸。
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.055] p-4">
            <h3 className="mb-3 font-semibold">成长轨迹</h3>
            <div className="space-y-3">
              {growthStages.map((stage) => (
                <div key={stage} className="flex items-center gap-3">
                  <div className={cn("h-3 w-3 rounded-full", stage === student.stage ? "bg-cyan-300" : "bg-white/20")} />
                  <span className={cn("text-sm", stage === student.stage ? "text-cyan-100" : "text-slate-400")}>{stage}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.055] p-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <h3 className="font-semibold">AI 风险判断</h3>
              <Badge variant={risk.variant}>{risk.label}</Badge>
            </div>
            <p className="text-sm leading-7 text-slate-300">
              当前风险原因：{reasons.length ? reasons.join("、") : "暂无明显风险"}。风险来自任务进度、反馈次数、目标清晰度和融入信号的综合判断。
            </p>
          </div>
          <div className="rounded-xl border border-cyan-300/20 bg-cyan-400/10 p-4">
            <h3 className="mb-3 font-semibold">适岗证据链</h3>
            <EvidenceList
              sections={[
                {
                  title: "已完成任务",
                  items: completedTasks.map((task) => `${task.title}：${task.evidence}`)
                },
                {
                  title: "导师反馈",
                  items: student.feedbackHistory.slice(0, 2).map((item) => `${item.createdAt}：${item.praise}`)
                },
                {
                  title: "行为信号",
                  items: student.tags.map((tag) => `# ${tag}`)
                },
                {
                  title: "AI 建议",
                  items: [student.nextAction]
                }
              ]}
            />
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.055] p-4">
            <h3 className="mb-3 font-semibold">适岗雷达图</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.16)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "#CBD5E1", fontSize: 12 }} />
                  <Radar dataKey="value" stroke="#00C2FF" fill="#1664FF" fillOpacity={0.35} />
                  <ChartTooltip contentStyle={tooltipStyle} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              AI 适岗建议：该同学适合继续在{student.role}方向培养，优势是学习速度和反馈响应；短板需要通过独立小任务继续验证。
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function AiCapabilitySection() {
  const capabilities = [
    {
      title: "AI 成长陪跑",
      desc: "根据阶段、岗位任务和风险状态生成下一步建议，让新人知道现在最该问清什么、交付什么。",
      icon: Sparkles
    },
    {
      title: "AI 反馈整理",
      desc: "把导师的自然语言观察拆成肯定、建议和下周行动，并写回学生详情。",
      icon: MessageSquareText
    },
    {
      title: "AI 风险识别",
      desc: "根据任务进度、反馈次数、目标不清和融入信号动态识别风险原因。",
      icon: Search
    },
    {
      title: "AI 周报生成",
      desc: "自动生成 HRBP 周报和优先动作，让 HR 把时间用在判断、沟通和机制设计上。",
      icon: FileText
    }
  ];

  return (
    <section id="ai-design" className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionTitle
          eyebrow="AI 能力设计"
          tag="技术应用型 HR"
          title="AI 做整理、提醒、归纳，人做判断、沟通、决策"
          description="鹅苗星图刻意保留人的位置。AI 不替代导师和 HR，而是把重复整理、提醒、归纳和初步判断交给系统。"
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {capabilities.map((item) => (
            <Card key={item.title} className="min-h-[220px]">
              <CardHeader>
                <item.icon className="h-7 w-7 text-cyan-100" />
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-7 text-slate-300">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function CourseMappingSection() {
  const courseCards = [
    {
      title: "沟通型 HR",
      desc: "角色入口连接实习生、导师、HR，减少信息断点，让业务需求和员工感受都被看见。",
      icon: Handshake
    },
    {
      title: "分析型 HR",
      desc: "总览看板沉淀任务完成率、反馈频次、风险标签和适岗信号，辅助 HR 做更清楚的判断。",
      icon: BarChart3
    },
    {
      title: "创意型 HR",
      desc: "星图视觉和成长能量把实习带教做成可感知体验，让企业文化不是口号。",
      icon: Lightbulb
    },
    {
      title: "技术应用型 HR",
      desc: "AI 反馈、周报和状态联动把原本靠人工追问的流程，变成可复用的智能工具。",
      icon: Layers
    }
  ];

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionTitle
          eyebrow="课程内容映射"
          title="把训练营里的四类 HR 能力落到一个产品里"
          description="这个 Demo 的重点不是炫技，而是把课程里的沟通、分析、创意和技术应用串成一个能解释业务问题的作品。"
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {courseCards.map((card) => (
            <Card key={card.title} className="bg-white/[0.07]">
              <CardHeader>
                <card.icon className="h-7 w-7 text-cyan-100" />
                <CardTitle>{card.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-7 text-slate-300">{card.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function CultureSection() {
  const culture = [
    ["用户为本", "三类用户都有工作台，实习生、导师、HR 的任务都被产品照顾。"],
    ["科技向善", "AI 辅助支持，不替代人的判断，让关怀更及时、更公平。"],
    ["协作", "多角色在同一张看板同步信息，减少来回追问和口径偏差。"],
    ["进取", "阶段任务推动新人持续成长，让努力方向更清楚。"],
    ["创造", "用产品化方式重塑实习带教流程，把文化变成可感知体验。"],
    ["正直", "风险判断有证据，不凭感觉给人贴标签。"]
  ];

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionTitle
          eyebrow="腾讯文化映射"
          title="文化不是写在墙上，而是嵌进功能里"
          description="页面不使用任何腾讯 Logo，只把文化关键词转化为看板里的设计原则和交互选择。"
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {culture.map(([title, desc]) => (
            <Card key={title}>
              <CardHeader className="pb-3">
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/15">
                  <ShieldCheck className="h-5 w-5 text-cyan-100" />
                </div>
                <CardTitle>{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-7 text-slate-300">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function ImpactSection() {
  const data = [
    { name: "上线前", value: 34 },
    { name: "第 2 周", value: 48 },
    { name: "第 4 周", value: 67 },
    { name: "第 8 周", value: 82 }
  ];
  const metrics = [
    { title: "HR 重复咨询减少", value: "42%", icon: MessageSquareText },
    { title: "导师反馈及时率提升", value: "+28%", icon: TrendingUp },
    { title: "实习生目标清晰度提升", value: "+36%", icon: Target },
    { title: "适岗判断信息完整度提升", value: "86%", icon: Eye }
  ];

  return (
    <section id="impact" className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionTitle
          eyebrow="效果评估"
          title="用过程指标证明它真的能落地"
          description="评估不只看最终留用结果，也看过程中支持是否更及时、判断证据是否更完整、每个角色是否少做重复追问。"
        />
        <div className="grid gap-4 md:grid-cols-4">
          {metrics.map((metric) => (
            <Card key={metric.title}>
              <CardHeader className="pb-2">
                <metric.icon className="h-6 w-6 text-cyan-100" />
                <CardDescription>{metric.title}</CardDescription>
                <CardTitle className="text-3xl">{metric.value}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>目标清晰度趋势</CardTitle>
            <CardDescription>模拟问卷得分：从“我知道下一步该做什么”追踪新人体验</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="impactGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#00C2FF" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#00C2FF" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "#CBD5E1", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#CBD5E1", fontSize: 12 }} axisLine={false} tickLine={false} />
                <ChartTooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="value" stroke="#00C2FF" fill="url(#impactGradient)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function ClosingCta({
  exported,
  onExport
}: {
  exported: boolean;
  onExport: () => void;
}) {
  return (
    <section className="px-4 pb-20 pt-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl rounded-2xl border border-cyan-300/20 bg-gradient-to-br from-blue-500/[0.18] via-cyan-500/10 to-emerald-500/10 p-8 text-center shadow-glow backdrop-blur-xl sm:p-12">
        <Badge variant="blue" className="mb-5">结尾 CTA</Badge>
        <h2 className="text-balance text-3xl font-semibold tracking-normal text-white sm:text-5xl">
          让实习成长不再散落在私聊里
        </h2>
        <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-slate-200">
          鹅苗星图不是为了“管住新人”，而是让每一次任务、反馈、困惑和成长信号被及时看见。
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button size="lg" onClick={() => scrollToSection("demo")}>
            查看 Demo 工作台
            <Rocket className="ml-2 h-5 w-5" />
          </Button>
          <Button size="lg" variant="secondary" onClick={onExport}>
            导出 AI 周报
            <Download className="ml-2 h-5 w-5" />
          </Button>
        </div>
        {exported && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 text-sm text-emerald-100"
          >
            已跳转到根据当前学生状态实时生成的 AI 周报，可直接作为作业说明素材。
          </motion.p>
        )}
      </div>
    </section>
  );
}

function HrPriorityCard({ students, compact = false }: { students: GrowthStudent[]; compact?: boolean }) {
  const actions = getPriorityActions(students);
  return (
    <Card className={cn("border-cyan-300/20", compact && "h-full")}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base">本周 HRBP 优先动作</CardTitle>
            <CardDescription>来自当前风险、反馈和适岗信号</CardDescription>
          </div>
          <Badge variant="blue">分析型 HR</Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-2">
        {actions.map((action) => (
          <div key={action} className="flex items-start gap-2 rounded-lg bg-white/[0.06] p-3 text-sm leading-6 text-slate-200">
            <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-cyan-100" />
            {action}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function CultureRibbon({ items }: { items: string[] }) {
  return (
    <div className="flex h-full flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-white/[0.055] p-4">
      {items.map((item) => (
        <Badge key={item} variant="default">{item}</Badge>
      ))}
    </div>
  );
}

function MiniStat({
  label,
  value,
  tone
}: {
  label: string;
  value: string;
  tone?: GrowthStudent["riskLevel"];
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.07] p-4">
      <p className="text-xs text-slate-400">{label}</p>
      <p
        className={cn(
          "mt-1 truncate text-2xl font-semibold text-white",
          tone === "high" && "text-red-100",
          tone === "medium" && "text-amber-100",
          tone === "low" && "text-emerald-100"
        )}
      >
        {value}
      </p>
    </div>
  );
}

function FeedbackBlock({
  title,
  content,
  tone
}: {
  title: string;
  content: string;
  tone: "green" | "blue" | "yellow";
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4 text-sm leading-7",
        tone === "green" && "border-emerald-300/25 bg-emerald-400/10 text-emerald-50",
        tone === "blue" && "border-cyan-300/25 bg-cyan-400/10 text-cyan-50",
        tone === "yellow" && "border-amber-300/25 bg-amber-400/10 text-amber-50"
      )}
    >
      <p className="mb-1 font-semibold text-white">{title}</p>
      {content}
    </div>
  );
}

function FilterGroup({
  icon,
  options,
  value,
  onChange
}: {
  icon: ReactNode;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] p-2">
      <span className="hidden text-slate-300 sm:inline-flex">{icon}</span>
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={cn(
            "rounded-lg px-3 py-1.5 text-sm transition",
            value === option
              ? "bg-cyan-300/[0.18] text-cyan-50"
              : "text-slate-300 hover:bg-white/10 hover:text-white"
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

function MetricLine({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <Progress value={value} />
    </div>
  );
}

function EvidenceList({
  sections
}: {
  sections: { title: string; items: string[] }[];
}) {
  return (
    <div className="grid gap-4">
      {sections.map((section) => (
        <div key={section.title}>
          <p className="mb-2 text-sm font-semibold text-white">{section.title}</p>
          <div className="space-y-2">
            {(section.items.length ? section.items : ["暂无可用证据"]).map((item) => (
              <div key={item} className="rounded-lg bg-white/[0.08] p-3 text-sm leading-6 text-slate-200">
                {item}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
