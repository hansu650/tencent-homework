"use client";

import { useMemo, useState } from "react";
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
  Gauge,
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
  WandSparkles,
  Zap
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

import { students, type InternshipRole, type Student } from "@/data/mockStudents";
import { average, cn } from "@/lib/utils";
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

type ActiveRole = "student" | "mentor" | "hr";
type RoleFilter = "全部" | InternshipRole;
type GrowthFilter = "全部" | "稳定成长" | "需关注" | "高适岗";

const stages = ["入营", "上手", "协同", "产出", "适岗复盘"];
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

function getFitAverage(student: Student) {
  return average(Object.values(student.fitSignals));
}

function getRiskMeta(level: Student["riskLevel"]) {
  if (level === "high") {
    return { label: "高风险", variant: "red" as const, color: "text-red-200" };
  }
  if (level === "medium") {
    return { label: "需关注", variant: "yellow" as const, color: "text-amber-200" };
  }
  return { label: "稳定成长", variant: "green" as const, color: "text-emerald-200" };
}

function SectionTitle({
  eyebrow,
  title,
  description
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto mb-8 max-w-3xl text-center">
      <Badge variant="blue" className="mb-4">
        {eyebrow}
      </Badge>
      <h2 className="text-balance text-3xl font-semibold tracking-normal text-white sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-7 text-slate-300">{description}</p>
    </div>
  );
}

export function EmiaoGrowthMap() {
  const [activeRole, setActiveRole] = useState<ActiveRole>("student");
  const [weeklyLoading, setWeeklyLoading] = useState(false);
  const [weeklyReport, setWeeklyReport] = useState(
    "本周 20 名实习生中，16 人完成核心任务；4 人需要关注，主要集中在目标理解不清和导师反馈缺失。建议 HR 优先约谈 2 名连续两周未完成打卡的同学，并提醒 3 位导师补充反馈。"
  );
  const [exported, setExported] = useState(false);

  const regenerateReport = () => {
    setWeeklyLoading(true);
    window.setTimeout(() => {
      setWeeklyReport(
        "AI 已更新本周成长简报：本周整体完成率 78%，研发组任务进度稳定，产品组出现 2 个目标澄清需求，销售组需要补充客户跟进反馈。建议 HRBP 先同步导师反馈口径，再对 4 位需关注同学做一次轻量关怀。"
      );
      setWeeklyLoading(false);
    }, 900);
  };

  const roleDistribution = useMemo(
    () =>
      ["研发", "产品", "销售"].map((role) => ({
        name: role,
        value: students.filter((student) => student.role === role).length
      })),
    []
  );

  const stageDistribution = useMemo(
    () =>
      stages.map((stage) => ({
        name: stage,
        value: students.filter((student) => student.stage === stage).length
      })),
    []
  );

  const riskDistribution = [
    { name: "任务滞后", value: 2 },
    { name: "反馈缺失", value: 4 },
    { name: "目标不清", value: 5 },
    { name: "融入慢", value: 3 }
  ];

  return (
    <TooltipProvider>
      <main className="min-h-screen overflow-hidden bg-transparent">
        <Hero />
        <ProblemDiagnosis />
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
                {activeRole === "student" && <StudentWorkbench />}
                {activeRole === "mentor" && <MentorWorkbench />}
                {activeRole === "hr" && <HrWorkbench />}
              </motion.div>
            </AnimatePresence>
          </div>
        </section>
        <OverviewDashboard
          roleDistribution={roleDistribution}
          stageDistribution={stageDistribution}
          riskDistribution={riskDistribution}
          weeklyLoading={weeklyLoading}
          weeklyReport={weeklyReport}
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

function Hero() {
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
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/20 text-cyan-100">
            <Map className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">鹅苗星图</p>
            <p className="text-xs text-slate-400">Emiao Growth Map</p>
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
        <div>
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
        <StarMap />
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

function ProblemDiagnosis() {
  const problems = [
    {
      title: "实习生迷茫",
      desc: "不知道不同阶段该学什么、做到什么程度。",
      consequence: "成长靠猜，主动性容易被误判。",
      ai: "AI 根据阶段、任务和反馈生成下一步建议。",
      icon: CircleAlert
    },
    {
      title: "导师凭经验",
      desc: "带教节奏和反馈标准不统一。",
      consequence: "同一批新人获得的支持不均衡。",
      ai: "AI 提醒反馈节点，把观察转成结构化成长标签。",
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
      icon: UserRound
    },
    {
      id: "mentor" as const,
      label: "我是导师",
      desc: "看带教清单，快速生成有温度的反馈",
      icon: Handshake
    },
    {
      id: "hr" as const,
      label: "我是 HR / HRBP",
      desc: "看 20 位实习生全景、风险和适岗信号",
      icon: UsersRound
    }
  ];

  return (
    <div>
      <SectionTitle
        eyebrow="角色入口"
        title="同一张成长地图，三种角色工作台"
        description="实习生看到下一步，导师看到带教节奏，HR 看到过程数据。AI 不替代任何人，只负责把信息整理到该出现的位置。"
      />
      <div className="grid gap-4 md:grid-cols-3">
        {roles.map((role) => {
          const isActive = role.id === activeRole;
          return (
            <button
              key={role.id}
              onClick={() => onChange(role.id)}
              className={cn(
                "rounded-xl border p-5 text-left transition focus:outline-none focus:ring-2 focus:ring-cyan-300",
                isActive
                  ? "border-cyan-300/50 bg-cyan-400/[0.12] shadow-glow"
                  : "border-white/10 bg-white/[0.06] hover:border-white/20 hover:bg-white/[0.1]"
              )}
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/10 text-cyan-100">
                  <role.icon className="h-6 w-6" />
                </div>
                {isActive && <Badge variant="green">当前视角</Badge>}
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
  roleDistribution,
  stageDistribution,
  riskDistribution,
  weeklyLoading,
  weeklyReport,
  onRegenerate
}: {
  roleDistribution: { name: string; value: number }[];
  stageDistribution: { name: string; value: number }[];
  riskDistribution: { name: string; value: number }[];
  weeklyLoading: boolean;
  weeklyReport: string;
  onRegenerate: () => void;
}) {
  const kpis = [
    { label: "实习生总数", value: "20", icon: UsersRound, color: "text-cyan-200" },
    { label: "本周任务完成率", value: "78%", icon: CheckCircle2, color: "text-emerald-200" },
    { label: "导师反馈及时率", value: "64%", icon: Clock3, color: "text-amber-200" },
    { label: "需关注人数", value: "4", icon: CircleAlert, color: "text-red-200" },
    { label: "高适岗信号", value: "6", icon: BadgeCheck, color: "text-blue-200" }
  ];

  return (
    <section id="overview" className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionTitle
          eyebrow="总览看板"
          title="HRBP 能一眼看懂这批新人的状态"
          description="这里不是冷冰冰排名，而是把任务完成、导师反馈、风险类型和适岗线索放到同一张可行动的工作台上。"
        />
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
                  <CardTitle>AI 本周成长简报</CardTitle>
                  <CardDescription>自动汇总任务、反馈和风险信号</CardDescription>
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
                <p className="text-sm leading-7 text-slate-200">{weeklyReport}</p>
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

function StudentWorkbench() {
  const tasks = [
    "完成业务背景学习",
    "参与一次需求评审",
    "输出一份竞品观察",
    "和导师进行一次 1v1"
  ];
  const [completed, setCompleted] = useState([true, true, false, false]);
  const doneCount = completed.filter(Boolean).length;
  const progress = Math.round((doneCount / tasks.length) * 100);
  const energy = 72 + doneCount * 3;

  return (
    <Card className="border-cyan-300/20">
      <CardHeader>
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <Badge variant="green" className="mb-3">实习生工作台</Badge>
            <CardTitle className="text-2xl">产品实习生 / 第 3 周</CardTitle>
            <CardDescription>当前阶段：上手期。重点不是多做，而是把业务问题问清楚。</CardDescription>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:min-w-[280px]">
            <div className="rounded-xl bg-white/[0.07] p-4">
              <p className="text-xs text-slate-400">成长能量值</p>
              <p className="mt-1 text-3xl font-semibold text-cyan-100">{energy}</p>
            </div>
            <div className="rounded-xl bg-white/[0.07] p-4">
              <p className="text-xs text-slate-400">本周任务</p>
              <p className="mt-1 text-3xl font-semibold text-emerald-100">{progress}%</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-white">我的成长地图</h3>
              <Badge variant="blue">Day 14</Badge>
            </div>
            <div className="grid gap-2 sm:grid-cols-5">
              {stages.map((stage, index) => (
                <div
                  key={stage}
                  className={cn(
                    "rounded-xl border p-3 text-center text-sm",
                    index === 1
                      ? "border-cyan-300/50 bg-cyan-300/[0.12] text-cyan-50"
                      : index < 1
                        ? "border-emerald-300/25 bg-emerald-300/10 text-emerald-100"
                        : "border-white/10 bg-white/[0.05] text-slate-300"
                  )}
                >
                  {stage}
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-white">本周任务 checklist</h3>
              <span className="text-sm text-slate-300">{doneCount}/{tasks.length}</span>
            </div>
            <Progress value={progress} className="mb-4" />
            <div className="grid gap-3">
              {tasks.map((task, index) => (
                <button
                  key={task}
                  onClick={() =>
                    setCompleted((current) =>
                      current.map((item, itemIndex) => (itemIndex === index ? !item : item))
                    )
                  }
                  className={cn(
                    "flex items-center gap-3 rounded-xl border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-cyan-300",
                    completed[index]
                      ? "border-emerald-300/30 bg-emerald-400/10"
                      : "border-white/10 bg-white/[0.05] hover:bg-white/[0.09]"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border",
                      completed[index]
                        ? "border-emerald-300 bg-emerald-400 text-slate-950"
                        : "border-white/20 text-transparent"
                    )}
                  >
                    <Check className="h-4 w-4" />
                  </span>
                  <span className="text-sm text-slate-100">{task}</span>
                </button>
              ))}
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
              <p className="text-xs text-slate-300">根据阶段与任务生成</p>
            </div>
          </div>
          <p className="text-sm leading-7 text-cyan-50">
            你本周的任务重点不是多做，而是把业务问题问清楚。建议你在需求评审前准备 3 个问题：用户是谁？当前卡点是什么？这个需求如何衡量效果？
          </p>
          <div className="mt-5 rounded-lg bg-white/10 p-3 text-sm text-slate-200">
            小提醒：如果听不懂会议里的业务词，可以先记下来，不用急着表现懂。把问题问清楚，本身就是很好的成长信号。
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MentorWorkbench() {
  const [observation, setObservation] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  const generateFeedback = () => {
    setLoading(true);
    window.setTimeout(() => {
      setFeedback(
        "建议反馈：你在本周表现出较强的主动性，能及时跟进任务。但在需求拆解时，可以进一步明确用户场景和判断依据。下周建议你先尝试用“背景-问题-方案-风险”框架整理需求。"
      );
      setLoading(false);
    }, 700);
  };

  return (
    <Card className="border-emerald-300/20">
      <CardHeader>
        <Badge variant="green" className="mb-3 w-fit">导师工作台</Badge>
        <CardTitle className="text-2xl">今日带教清单</CardTitle>
        <CardDescription>把经验沉淀成节奏，把观察转成可执行反馈。</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="grid gap-4">
          {[
            { title: "需要反馈的实习生", value: "3 人", desc: "林知夏、沈一诺、何以宁", icon: MessageSquareText },
            { title: "本周 1v1 提醒", value: "5 场", desc: "Day 7 / Day 14 节点优先", icon: Clock3 },
            { title: "风险待确认", value: "2 条", desc: "任务滞后、反馈缺失", icon: CircleAlert }
          ].map((item) => (
            <div key={item.title} className="rounded-xl border border-white/10 bg-white/[0.06] p-4">
              <div className="mb-3 flex items-center justify-between">
                <item.icon className="h-5 w-5 text-cyan-100" />
                <Badge variant="blue">{item.value}</Badge>
              </div>
              <h3 className="font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-300">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.06] p-5">
          <div className="mb-4 flex items-center gap-3">
            <BrainCircuit className="h-6 w-6 text-cyan-100" />
            <div>
              <h3 className="font-semibold text-white">AI 反馈生成器</h3>
              <p className="text-sm text-slate-300">保留导师判断，AI 帮你组织语言。</p>
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
              生成反馈
            </Button>
            <p className="text-xs text-slate-400">
              输入内容只用于模拟，不会上传后端。
            </p>
          </div>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 rounded-xl border border-emerald-300/25 bg-emerald-400/10 p-4 text-sm leading-7 text-emerald-50"
            >
              {feedback}
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function HrWorkbench() {
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("全部");
  const [growthFilter, setGrowthFilter] = useState<GrowthFilter>("全部");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const roleMatched = roleFilter === "全部" || student.role === roleFilter;
      const growthMatched =
        growthFilter === "全部" ||
        (growthFilter === "稳定成长" && student.riskLevel === "low") ||
        (growthFilter === "需关注" && student.riskLevel !== "low") ||
        (growthFilter === "高适岗" && getFitAverage(student) >= 85);
      return roleMatched && growthMatched;
    });
  }, [roleFilter, growthFilter]);

  return (
    <Card className="border-blue-300/20">
      <CardHeader>
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <Badge variant="blue" className="mb-3">HR / HRBP 工作台</Badge>
            <CardTitle className="text-2xl">20 名实习生全景卡片</CardTitle>
            <CardDescription>点击卡片打开右侧抽屉，看成长轨迹、导师反馈、AI 风险判断和适岗雷达图。</CardDescription>
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
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {filteredStudents.map((student) => {
            const risk = getRiskMeta(student.riskLevel);
            const fitAverage = getFitAverage(student);
            return (
              <button
                key={student.id}
                onClick={() => setSelectedStudent(student)}
                className="group rounded-xl border border-white/10 bg-white/[0.055] p-4 text-left transition hover:-translate-y-1 hover:border-cyan-300/35 hover:bg-white/[0.09] focus:outline-none focus:ring-2 focus:ring-cyan-300"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{student.name}</h3>
                    <p className="mt-1 text-xs text-slate-400">
                      {student.role} · 导师 {student.mentor}
                    </p>
                  </div>
                  <Badge variant={risk.variant}>{risk.label}</Badge>
                </div>
                <div className="mb-3 flex flex-wrap gap-2">
                  <Badge variant="default">{student.stage}</Badge>
                  {fitAverage >= 85 && <Badge variant="green">高适岗</Badge>}
                </div>
                <div className="space-y-3">
                  <MetricLine label="任务完成率" value={student.progress} />
                  <MetricLine label="成长能量" value={student.energy} />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-300">
                  <div className="rounded-lg bg-white/[0.08] p-2">反馈 {student.tags.includes("反馈缺失") ? 1 : 3} 次</div>
                  <div className="rounded-lg bg-white/[0.08] p-2">适岗 {fitAverage}</div>
                </div>
                <div className="mt-4 flex items-center text-sm text-cyan-100">
                  查看详情
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
          if (!open) setSelectedStudent(null);
        }}
      />
    </Card>
  );
}

function FilterGroup({
  icon,
  options,
  value,
  onChange
}: {
  icon: React.ReactNode;
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

function StudentDetailSheet({
  student,
  open,
  onOpenChange
}: {
  student: Student | null;
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
            <div className="rounded-xl bg-white/[0.07] p-3">
              <p className="text-xs text-slate-400">任务完成率</p>
              <p className="mt-1 text-2xl font-semibold">{student.progress}%</p>
            </div>
            <div className="rounded-xl bg-white/[0.07] p-3">
              <p className="text-xs text-slate-400">成长能量</p>
              <p className="mt-1 text-2xl font-semibold">{student.energy}</p>
            </div>
            <div className="rounded-xl bg-white/[0.07] p-3">
              <p className="text-xs text-slate-400">适岗信号</p>
              <p className="mt-1 text-2xl font-semibold">{getFitAverage(student)}</p>
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.055] p-4">
            <h3 className="mb-3 font-semibold">成长轨迹</h3>
            <div className="space-y-3">
              {stages.map((stage) => (
                <div key={stage} className="flex items-center gap-3">
                  <div className={cn("h-3 w-3 rounded-full", stage === student.stage ? "bg-cyan-300" : "bg-white/20")} />
                  <span className={cn("text-sm", stage === student.stage ? "text-cyan-100" : "text-slate-400")}>{stage}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.055] p-4">
            <h3 className="mb-2 font-semibold">导师反馈摘要</h3>
            <p className="text-sm leading-7 text-slate-300">{student.lastFeedback}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.055] p-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <h3 className="font-semibold">AI 风险判断</h3>
              <Badge variant={risk.variant}>{risk.label}</Badge>
            </div>
            <p className="text-sm leading-7 text-slate-300">
              当前风险主要来自
              <span className={cn("px-1 font-medium", risk.color)}>
                {student.tags.filter((tag) => ["任务滞后", "反馈缺失", "目标不清", "融入慢"].includes(tag)).join("、") || "暂无明显风险"}
              </span>
              。建议只把这些信号作为沟通线索，不直接给人贴标签。
            </p>
          </div>
          <div className="rounded-xl border border-cyan-300/20 bg-cyan-400/10 p-4">
            <h3 className="mb-2 font-semibold">下一步建议</h3>
            <p className="text-sm leading-7 text-cyan-50">{student.nextAction}</p>
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
              AI 适岗建议：该同学适合继续在{student.role}方向培养，优势是学习速度快、反馈响应及时；短板是业务判断仍依赖导师，需要安排一次独立小任务验证。
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
      desc: "根据阶段和任务生成下一步建议，让新人知道现在最该问清什么、交付什么。",
      icon: Sparkles
    },
    {
      title: "AI 反馈整理",
      desc: "把导师的自然语言观察整理成成长标签和可执行建议，减少反馈写作成本。",
      icon: MessageSquareText
    },
    {
      title: "AI 风险识别",
      desc: "识别任务滞后、反馈缺失、目标不清、融入慢等过程信号，提醒 HR 提前介入。",
      icon: Search
    },
    {
      title: "AI 周报生成",
      desc: "自动生成 HR 周报和行动建议，让 HRBP 把时间用在判断、沟通和机制设计上。",
      icon: FileText
    }
  ];

  return (
    <section id="ai-design" className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionTitle
          eyebrow="AI 能力设计"
          title="AI 做整理、提醒、归纳，人做判断、沟通、决策"
          description="鹅苗星图刻意保留人的位置。AI 不替代导师和 HR，而是把重复整理、提醒、归纳和初步判断交给系统，让人有更多精力处理分寸和信任。"
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
      desc: "连接实习生、导师、HR，减少信息断点，让业务需求和员工感受都被看见。",
      icon: Handshake
    },
    {
      title: "分析型 HR",
      desc: "沉淀任务完成率、反馈频次、风险标签和适岗信号，辅助 HR 做更清楚的判断。",
      icon: BarChart3
    },
    {
      title: "创意型 HR",
      desc: "把实习带教做成“鹅苗星图”和“成长能量”的体验，让企业文化不是口号，而是可以被感知。",
      icon: Lightbulb
    },
    {
      title: "技术应用型 HR",
      desc: "用系统、产品和 AI 把原本靠人工追问的带教流程，变成可复用的智能工具。",
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
    ["用户为本", "实习生、导师、HR 都是产品用户，三个角色都要被产品照顾。"],
    ["科技向善", "AI 不是为了冷冰冰管理，而是让支持更及时、更公平。"],
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
          title="文化不是写在墙上，而是落在产品判断里"
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
            已生成适合作业提交说明引用的 AI 周报摘要，可在总览看板查看。
          </motion.p>
        )}
      </div>
    </section>
  );
}
