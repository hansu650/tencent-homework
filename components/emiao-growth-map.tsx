"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BookOpenCheck,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  ClipboardCheck,
  Clock3,
  Copy,
  Download,
  FileText,
  Filter,
  GraduationCap,
  Handshake,
  Home,
  Layers3,
  Loader2,
  Map,
  MessageSquareText,
  PanelLeft,
  RefreshCw,
  Rocket,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  UserRound,
  UsersRound,
  WandSparkles
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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
import { Textarea } from "@/components/ui/textarea";
import type { GrowthStage, InternshipRole, RiskLevel } from "@/data/mockStudents";
import type { DemoEvent, WeeklyReport } from "@/lib/demo-store";
import {
  getCoachAdvice,
  getCompletedTasks,
  getFitAverage,
  getPriorityActions,
  getRiskMeta,
  getRiskReasons,
  growthStages,
  roleTasks,
  type GrowthStudent,
  type MentorFeedback
} from "@/lib/growth";
import { average, cn } from "@/lib/utils";

type ViewId = "overview" | "student" | "mentor" | "hrbp" | "report" | "events" | "solution";
type Identity = "实习生" | "导师" | "HRBP";
type RoleFilter = "全部" | InternshipRole;
type StatusFilter = "全部" | "稳定成长" | "需关注" | "高适岗";
type StageFilter = "全部" | GrowthStage;

type DashboardMetrics = {
  total: number;
  averageProgress: number;
  feedbackTimelyRate: number;
  focusCount: number;
  highFitCount: number;
  riskCounts: { name: string; value: number }[];
  roleDistribution: { name: string; value: number }[];
  stageDistribution: { name: string; value: number }[];
};

type StudentsResponse = {
  students: GrowthStudent[];
  metrics: DashboardMetrics;
};

const chartColors = ["#1664FF", "#00C2FF", "#22C55E", "#F59E0B", "#EF4444"];
const loadingSteps = ["正在汇总任务进度", "正在归纳导师反馈", "正在识别风险信号", "正在生成 HRBP 行动建议"];
const roleOptions: RoleFilter[] = ["全部", "研发", "产品", "销售"];
const statusOptions: StatusFilter[] = ["全部", "稳定成长", "需关注", "高适岗"];
const stageOptions: StageFilter[] = ["全部", ...growthStages];

const tooltipStyle = {
  background: "#07111F",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 12,
  color: "#fff",
  boxShadow: "0 16px 40px rgba(15,23,42,0.24)"
};

const navItems: { id: ViewId; label: string; icon: ReactNode; hint: string }[] = [
  { id: "overview", label: "总览", icon: <Home className="h-4 w-4" />, hint: "产品驾驶舱" },
  { id: "student", label: "实习生工作台", icon: <GraduationCap className="h-4 w-4" />, hint: "成长陪跑" },
  { id: "mentor", label: "导师工作台", icon: <Handshake className="h-4 w-4" />, hint: "反馈工具" },
  { id: "hrbp", label: "HRBP 工作台", icon: <UsersRound className="h-4 w-4" />, hint: "适岗证据链" },
  { id: "report", label: "AI 周报", icon: <FileText className="h-4 w-4" />, hint: "可复制导出" },
  { id: "events", label: "数据日志", icon: <Activity className="h-4 w-4" />, hint: "模拟后端记录" },
  { id: "solution", label: "方案说明", icon: <Layers3 className="h-4 w-4" />, hint: "作业四映射" }
];

function buildMetrics(students: GrowthStudent[]): DashboardMetrics {
  const total = students.length || 1;
  const focusStudents = students.filter((student) => student.riskLevel !== "low");
  const highFitCount = students.filter((student) => getFitAverage(student) >= 85 && student.riskLevel === "low").length;
  const riskTypes = ["任务滞后", "反馈缺失", "目标不清", "融入慢"];

  return {
    total: students.length,
    averageProgress: average(students.map((student) => student.progress)),
    feedbackTimelyRate: Math.round((students.filter((student) => student.feedbackCount >= 2).length / total) * 100),
    focusCount: focusStudents.length,
    highFitCount,
    riskCounts: riskTypes.map((name) => ({
      name,
      value: students.filter((student) => getRiskReasons(student).includes(name)).length
    })),
    roleDistribution: roleOptions
      .filter((role): role is InternshipRole => role !== "全部")
      .map((role) => ({ name: role, value: students.filter((student) => student.role === role).length })),
    stageDistribution: growthStages.map((stage) => ({
      name: stage,
      value: students.filter((student) => student.stage === stage).length
    }))
  };
}

function getStudentStatus(student: GrowthStudent): Exclude<StatusFilter, "全部"> {
  if (getFitAverage(student) >= 85 && student.riskLevel === "low") return "高适岗";
  if (student.riskLevel !== "low") return "需关注";
  return "稳定成长";
}

function getRiskBadgeVariant(level: RiskLevel) {
  if (level === "high") return "red" as const;
  if (level === "medium") return "yellow" as const;
  return "green" as const;
}

export function EmiaoGrowthMap() {
  const [students, setStudents] = useState<GrowthStudent[]>([]);
  const [events, setEvents] = useState<DemoEvent[]>([]);
  const [activeView, setActiveView] = useState<ViewId>("overview");
  const [identity, setIdentity] = useState<Identity>("HRBP");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [mentorTargetId, setMentorTargetId] = useState("");
  const [mentorNote, setMentorNote] = useState("");
  const [feedbackResult, setFeedbackResult] = useState<MentorFeedback | null>(null);
  const [feedbackStudentName, setFeedbackStudentName] = useState("");
  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportStep, setReportStep] = useState(0);
  const [taskLoadingId, setTaskLoadingId] = useState<string | null>(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2400);
  }, []);

  const loadDemo = useCallback(async () => {
    setPageLoading(true);
    const [studentsResponse, eventsResponse] = await Promise.all([
      fetch("/api/students", { cache: "no-store" }).then((res) => res.json() as Promise<StudentsResponse>),
      fetch("/api/events", { cache: "no-store" }).then((res) => res.json() as Promise<{ events: DemoEvent[] }>)
    ]);

    setStudents(studentsResponse.students);
    setEvents(eventsResponse.events);
    setSelectedStudentId((current) => current || studentsResponse.students[0]?.id || "");
    setMentorTargetId((current) => current || studentsResponse.students[0]?.id || "");
    setPageLoading(false);
  }, []);

  useEffect(() => {
    loadDemo().catch(() => {
      setPageLoading(false);
      showToast("演示数据加载失败，请刷新重试");
    });
  }, [loadDemo, showToast]);

  const metrics = useMemo(() => buildMetrics(students), [students]);
  const selectedStudent = students.find((student) => student.id === selectedStudentId) ?? students[0];
  const mentorTarget = students.find((student) => student.id === mentorTargetId) ?? students[0];

  const handleIdentityChange = (next: Identity) => {
    setIdentity(next);
    setActiveView(next === "实习生" ? "student" : next === "导师" ? "mentor" : "hrbp");
  };

  const handleTaskToggle = async (student: GrowthStudent, taskId: string) => {
    const completed = !student.completedTaskIds.includes(taskId);
    setTaskLoadingId(taskId);

    try {
      const response = await fetch(`/api/students/${student.id}/tasks`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, completed })
      });
      const result = (await response.json()) as { students: GrowthStudent[]; events: DemoEvent[] };
      if (!response.ok) throw new Error("update failed");
      setStudents(result.students);
      setEvents(result.events);
      showToast("已更新成长进度");
    } catch {
      showToast("任务更新失败，请稍后重试");
    } finally {
      setTaskLoadingId(null);
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!mentorTarget) return;
    setFeedbackLoading(true);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: mentorTarget.id, mentorNote })
      });
      const result = (await response.json()) as {
        feedback: MentorFeedback;
        student: GrowthStudent;
        students: GrowthStudent[];
        events: DemoEvent[];
      };
      if (!response.ok) throw new Error("feedback failed");
      setFeedbackResult(result.feedback);
      setFeedbackStudentName(result.student.name);
      setStudents(result.students);
      setEvents(result.events);
      setMentorNote("");
      showToast("反馈已写入学生档案");
    } catch {
      showToast("反馈生成失败，请稍后重试");
    } finally {
      setFeedbackLoading(false);
    }
  };

  const handleGenerateReport = async (switchToReport = true) => {
    if (switchToReport) setActiveView("report");
    setReportLoading(true);
    setReportStep(0);

    try {
      for (let index = 0; index < loadingSteps.length; index += 1) {
        setReportStep(index);
        await new Promise((resolve) => window.setTimeout(resolve, 420));
      }

      const response = await fetch("/api/weekly-report", { method: "POST" });
      const result = (await response.json()) as {
        report: WeeklyReport;
        events: DemoEvent[];
      };
      if (!response.ok) throw new Error("report failed");
      setReport(result.report);
      setEvents(result.events);
      showToast("AI 周报已生成");
    } catch {
      showToast("周报生成失败，请稍后重试");
    } finally {
      setReportLoading(false);
    }
  };

  const handleReset = async () => {
    setResetLoading(true);
    try {
      const response = await fetch("/api/reset", { method: "POST" });
      const result = (await response.json()) as { students: GrowthStudent[]; events: DemoEvent[] };
      if (!response.ok) throw new Error("reset failed");
      setStudents(result.students);
      setEvents(result.events);
      setSelectedStudentId(result.students[0]?.id ?? "");
      setMentorTargetId(result.students[0]?.id ?? "");
      setReport(null);
      setFeedbackResult(null);
      showToast("演示数据已重置");
    } catch {
      showToast("重置失败，请稍后重试");
    } finally {
      setResetLoading(false);
    }
  };

  const handleCopyReport = async () => {
    if (!report) return;
    await navigator.clipboard.writeText(report.markdown);
    showToast("周报已复制");
  };

  const handleExportMarkdown = () => {
    if (!report) return;
    const blob = new Blob([report.markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "emiao-growth-weekly-report.md";
    link.click();
    URL.revokeObjectURL(url);
    showToast("Markdown 已导出");
  };

  return (
    <div className="min-h-screen bg-[#F7FAFF] text-slate-950">
      <Topbar
        identity={identity}
        onIdentityChange={handleIdentityChange}
        onGenerateReport={() => handleGenerateReport(true)}
        onReset={handleReset}
        onShowSolution={() => {
          setActiveView("solution");
          showToast("已打开作业提交说明");
        }}
        reportLoading={reportLoading}
        resetLoading={resetLoading}
      />

      <div className="mx-auto flex w-full max-w-[1500px] gap-4 px-3 pb-8 pt-3 sm:px-4 lg:px-6">
        <Sidebar activeView={activeView} onChange={setActiveView} />
        <div className="min-w-0 flex-1">
          <MobileNav activeView={activeView} onChange={setActiveView} />
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22 }}
              className="min-w-0"
            >
              {pageLoading ? (
                <LoadingPanel />
              ) : (
                <>
                  {activeView === "overview" && (
                    <OverviewPage
                      students={students}
                      metrics={metrics}
                      events={events}
                      report={report}
                      onNavigate={setActiveView}
                      onGenerateReport={() => handleGenerateReport(true)}
                    />
                  )}
                  {activeView === "student" && selectedStudent && (
                    <StudentWorkspace
                      students={students}
                      student={selectedStudent}
                      selectedStudentId={selectedStudentId}
                      onSelectStudent={setSelectedStudentId}
                      onToggleTask={handleTaskToggle}
                      taskLoadingId={taskLoadingId}
                    />
                  )}
                  {activeView === "mentor" && mentorTarget && (
                    <MentorWorkspace
                      students={students}
                      target={mentorTarget}
                      targetId={mentorTargetId}
                      note={mentorNote}
                      feedbackResult={feedbackResult}
                      feedbackStudentName={feedbackStudentName}
                      loading={feedbackLoading}
                      onSelectTarget={setMentorTargetId}
                      onNoteChange={setMentorNote}
                      onSubmit={handleFeedbackSubmit}
                    />
                  )}
                  {activeView === "hrbp" && <HrbpWorkspace students={students} />}
                  {activeView === "report" && (
                    <WeeklyReportPage
                      report={report}
                      loading={reportLoading}
                      loadingStep={reportStep}
                      onGenerate={() => handleGenerateReport(false)}
                      onCopy={handleCopyReport}
                      onExport={handleExportMarkdown}
                    />
                  )}
                  {activeView === "events" && <EventsPage events={events} />}
                  {activeView === "solution" && <SolutionPage />}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 18 }}
            className="fixed bottom-5 left-1/2 z-[80] flex -translate-x-1/2 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-xl"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Topbar({
  identity,
  onIdentityChange,
  onGenerateReport,
  onReset,
  onShowSolution,
  reportLoading,
  resetLoading
}: {
  identity: Identity;
  onIdentityChange: (identity: Identity) => void;
  onGenerateReport: () => void;
  onReset: () => void;
  onShowSolution: () => void;
  reportLoading: boolean;
  resetLoading: boolean;
}) {
  const identities: { label: Identity; icon: ReactNode }[] = [
    { label: "实习生", icon: <GraduationCap className="h-4 w-4" /> },
    { label: "导师", icon: <Handshake className="h-4 w-4" /> },
    { label: "HRBP", icon: <UsersRound className="h-4 w-4" /> }
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/92 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-3 px-3 py-3 sm:px-4 lg:flex-row lg:items-center lg:justify-between lg:px-6">
        <div className="flex min-w-0 items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1664FF] text-white shadow-glow">
              <Map className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-base font-semibold text-slate-950 sm:text-lg">鹅苗星图</h1>
                <Badge variant="blue">Emiao Growth Map</Badge>
              </div>
              <p className="truncate text-xs text-slate-500">腾讯 AI-HR 作业四 · 实习能量站成长导航智能看板</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          <div className="flex overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-1">
            {identities.map((item) => (
              <button
                key={item.label}
                onClick={() => onIdentityChange(item.label)}
                className={cn(
                  "flex shrink-0 cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition",
                  identity === item.label
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-slate-600 hover:bg-white/80 hover:text-slate-950"
                )}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={onGenerateReport} disabled={reportLoading} className="cursor-pointer">
              {reportLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <WandSparkles className="mr-2 h-4 w-4" />}
              生成周报
            </Button>
            <Button variant="secondary" onClick={onReset} disabled={resetLoading} className="cursor-pointer">
              {resetLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RotateCcw className="mr-2 h-4 w-4" />}
              重置演示
            </Button>
            <Button variant="outline" onClick={onShowSolution} className="cursor-pointer">
              <Download className="mr-2 h-4 w-4" />
              导出说明
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

function Sidebar({ activeView, onChange }: { activeView: ViewId; onChange: (view: ViewId) => void }) {
  return (
    <aside className="sticky top-[88px] hidden h-[calc(100vh-110px)] w-72 shrink-0 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm lg:block">
      <div className="mb-3 flex items-center gap-2 px-2 py-2 text-sm font-semibold text-slate-700">
        <PanelLeft className="h-4 w-4 text-blue-600" />
        产品模块
      </div>
      <nav className="space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={cn(
              "flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-3 text-left transition",
              activeView === item.id
                ? "bg-blue-50 text-blue-700 ring-1 ring-blue-100"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
            )}
          >
            <span className="flex items-center gap-3">
              {item.icon}
              <span>
                <span className="block text-sm font-medium">{item.label}</span>
                <span className="block text-xs text-slate-400">{item.hint}</span>
              </span>
            </span>
            <ChevronRight className="h-4 w-4" />
          </button>
        ))}
      </nav>
      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-6 text-amber-800">
        AI 风险判断只作为沟通线索，不直接作为留用、淘汰或评价依据。
      </div>
    </aside>
  );
}

function MobileNav({ activeView, onChange }: { activeView: ViewId; onChange: (view: ViewId) => void }) {
  return (
    <div className="mb-3 flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm lg:hidden">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onChange(item.id)}
          className={cn(
            "flex shrink-0 cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition",
            activeView === item.id ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"
          )}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </div>
  );
}

function LoadingPanel() {
  return (
    <div className="grid min-h-[70vh] place-items-center rounded-2xl border border-slate-200 bg-white">
      <div className="text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
        <p className="mt-3 text-sm font-medium text-slate-600">正在连接鹅苗星图模拟后端...</p>
      </div>
    </div>
  );
}

function OverviewPage({
  students,
  metrics,
  events,
  report,
  onNavigate,
  onGenerateReport
}: {
  students: GrowthStudent[];
  metrics: DashboardMetrics;
  events: DemoEvent[];
  report: WeeklyReport | null;
  onNavigate: (view: ViewId) => void;
  onGenerateReport: () => void;
}) {
  return (
    <div className="space-y-4">
      <CockpitHero
        metrics={metrics}
        events={events}
        report={report}
        onNavigate={onNavigate}
        onGenerateReport={onGenerateReport}
      />
      <KpiGrid metrics={metrics} />
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-2 flex flex-wrap gap-2">
                <Badge variant="blue">分析型 HR｜从数据看问题</Badge>
                <Badge variant="green">协作：多角色同步信息</Badge>
              </div>
              <CardTitle>本周 HRBP 优先动作</CardTitle>
              <CardDescription>根据任务、反馈、风险和适岗信号动态生成</CardDescription>
            </div>
            <Button variant="outline" onClick={() => onNavigate("hrbp")} className="w-fit cursor-pointer">
              进入 HRBP 工作台
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            {getPriorityActions(students).map((action, index) => (
              <div key={action} className="rounded-xl border border-blue-100 bg-blue-50/70 p-4">
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-semibold text-white">
                  {index + 1}
                </div>
                <p className="text-sm leading-7 text-slate-700">{action}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <RecentEventsCard events={events} limit={5} />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <RiskDistributionChart metrics={metrics} />
        <StageRoleChart metrics={metrics} />
      </div>
    </div>
  );
}

function CockpitHero({
  metrics,
  events,
  report,
  onNavigate,
  onGenerateReport
}: {
  metrics: DashboardMetrics;
  events: DemoEvent[];
  report: WeeklyReport | null;
  onNavigate: (view: ViewId) => void;
  onGenerateReport: () => void;
}) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-[#07111F] p-5 text-white shadow-glow sm:p-8">
      <div className="absolute inset-0 dark-grid-pattern opacity-70" />
      <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-blue-500/25 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-52 w-52 rounded-full bg-cyan-400/15 blur-3xl" />
      <div className="relative grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="flex min-h-[430px] flex-col justify-between">
          <div>
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-medium text-cyan-100">
                作业四 · 实习能量站
              </span>
              <span className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-1 text-xs font-medium text-emerald-100">
                创意型 HR｜鹅苗星图 / 成长能量
              </span>
            </div>
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-100">Emiao Growth Map</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-normal sm:text-5xl">鹅苗星图</h2>
            <p className="mt-3 text-2xl font-semibold text-cyan-100">AI 实习生成长导航看板</p>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
              让实习生、导师、HRBP 在同一张成长地图上协作。AI 负责整理、提醒、归纳，人负责判断、沟通和信任建立。
            </p>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button onClick={() => onNavigate("hrbp")} className="cursor-pointer">
              进入 HRBP 工作台
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="dark" onClick={() => onNavigate("student")} className="cursor-pointer border border-white/15">
              体验实习生视角
              <GraduationCap className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="dark" onClick={onGenerateReport} className="cursor-pointer border border-white/15">
              生成 AI 周报
              <WandSparkles className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="relative min-w-0">
          <div className="pointer-events-none absolute -right-28 -top-16 w-[360px] opacity-25 sm:w-[430px]">
            <StarMap />
          </div>
          <div className="relative rounded-2xl border border-white/10 bg-white/[0.08] p-4 shadow-inner-glass backdrop-blur-xl">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">产品驾驶舱预览</p>
                <p className="text-xs text-slate-400">所有指标来自模拟后端 API</p>
              </div>
              <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs text-emerald-100">
                技术应用型 HR｜API / AI 周报 / 状态联动
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-4">
              <DarkMiniStat label="实习生总数" value={`${metrics.total}`} />
              <DarkMiniStat label="任务完成率" value={`${metrics.averageProgress}%`} />
              <DarkMiniStat label="需关注人数" value={`${metrics.focusCount}`} tone="warning" />
              <DarkMiniStat label="高适岗信号" value={`${metrics.highFitCount}`} tone="success" />
            </div>
            <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_0.85fr]">
              <div className="rounded-xl border border-white/10 bg-[#07111F]/72 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
                  <BrainCircuit className="h-4 w-4 text-cyan-200" />
                  AI 周报摘要
                </div>
                <p className="text-sm leading-7 text-slate-300">
                  {report?.overview ??
                    `当前平均任务完成率 ${metrics.averageProgress}%，需关注 ${metrics.focusCount} 人。建议先进入 HRBP 工作台查看适岗证据链，再生成本周周报。`}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-[#07111F]/72 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
                  <Clock3 className="h-4 w-4 text-emerald-200" />
                  最近操作动态
                </div>
                <div className="space-y-2">
                  {events.slice(0, 3).map((event) => (
                    <p key={event.id} className="line-clamp-2 rounded-lg bg-white/[0.06] px-3 py-2 text-xs leading-5 text-slate-300">
                      {event.message}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DarkMiniStat({ label, value, tone }: { label: string; value: string; tone?: "warning" | "success" }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#07111F]/70 p-3">
      <p className="text-xs text-slate-400">{label}</p>
      <p
        className={cn(
          "mt-2 text-2xl font-semibold text-white",
          tone === "warning" && "text-amber-100",
          tone === "success" && "text-emerald-100"
        )}
      >
        {value}
      </p>
    </div>
  );
}

function KpiGrid({ metrics }: { metrics: DashboardMetrics }) {
  const cards = [
    { label: "实习生总数", value: `${metrics.total}`, icon: UsersRound, desc: "来自 /api/students" },
    { label: "平均任务完成率", value: `${metrics.averageProgress}%`, icon: Target, desc: "任务勾选后实时变化" },
    { label: "导师反馈及时率", value: `${metrics.feedbackTimelyRate}%`, icon: MessageSquareText, desc: "反馈次数驱动风险变化" },
    { label: "需关注人数", value: `${metrics.focusCount}`, icon: CircleAlert, desc: "任务、反馈、目标信号综合" },
    { label: "高适岗信号", value: `${metrics.highFitCount}`, icon: BadgeCheck, desc: "适岗均分与低风险共同判断" }
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => (
        <Card key={card.label} className="group cursor-default transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
          <CardHeader className="pb-3">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <card.icon className="h-5 w-5" />
            </div>
            <CardDescription>{card.label}</CardDescription>
            <CardTitle className="text-3xl">{card.value}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">{card.desc}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function RecentEventsCard({ events, limit = 5 }: { events: DemoEvent[]; limit?: number }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>最近操作日志</CardTitle>
            <CardDescription>来自 GET /api/events</CardDescription>
          </div>
          <Badge variant="blue">真实数据感</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {events.slice(0, limit).map((event) => (
          <div key={event.id} className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
            <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-500" />
            <div className="min-w-0">
              <p className="text-sm leading-6 text-slate-700">{event.message}</p>
              <p className="mt-1 text-xs text-slate-400">{event.createdAt}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function RiskDistributionChart({ metrics }: { metrics: DashboardMetrics }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>风险分布图</CardTitle>
        <CardDescription>任务滞后 / 反馈缺失 / 目标不清 / 融入慢</CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={metrics.riskCounts} margin={{ left: -16, right: 8 }}>
            <CartesianGrid vertical={false} stroke="#E2E8F0" />
            <XAxis dataKey="name" tick={{ fill: "#475569", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fill: "#475569", fontSize: 12 }} axisLine={false} tickLine={false} />
            <ChartTooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(22,100,255,0.08)" }} />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {metrics.riskCounts.map((entry, index) => (
                <Cell key={entry.name} fill={chartColors[index + 1]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function StageRoleChart({ metrics }: { metrics: DashboardMetrics }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>岗位与阶段分布</CardTitle>
        <CardDescription>帮助 HRBP 判断支持资源投放位置</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-2">
        <MiniBarList title="岗位分布" data={metrics.roleDistribution} />
        <MiniBarList title="成长阶段" data={metrics.stageDistribution} />
      </CardContent>
    </Card>
  );
}

function MiniBarList({ title, data }: { title: string; data: { name: string; value: number }[] }) {
  const max = Math.max(...data.map((item) => item.value), 1);
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
      <p className="mb-4 text-sm font-semibold text-slate-800">{title}</p>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={item.name}>
            <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
              <span>{item.name}</span>
              <span>{item.value}</span>
            </div>
            <div className="h-2 rounded-full bg-slate-200">
              <div
                className="h-2 rounded-full"
                style={{
                  width: `${Math.max(8, (item.value / max) * 100)}%`,
                  backgroundColor: chartColors[index % chartColors.length]
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StudentWorkspace({
  students,
  student,
  selectedStudentId,
  onSelectStudent,
  onToggleTask,
  taskLoadingId
}: {
  students: GrowthStudent[];
  student: GrowthStudent;
  selectedStudentId: string;
  onSelectStudent: (id: string) => void;
  onToggleTask: (student: GrowthStudent, taskId: string) => void;
  taskLoadingId: string | null;
}) {
  const tasks = roleTasks[student.role];
  const riskReasons = getRiskReasons(student);

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="实习生工作台"
        title="今天我该先完成哪一步？"
        description="实习生端不做管理压迫，而是把阶段任务、导师反馈和 AI 陪跑建议放在一个清楚的行动面板里。"
        badges={["用户为本：新人也有自己的工作台", "进取：阶段任务推动成长"]}
      />
      <div className="grid gap-4 xl:grid-cols-[0.78fr_1.22fr]">
        <Card>
          <CardHeader>
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge variant="blue">创意型 HR｜成长能量</Badge>
              <Badge variant={getRiskBadgeVariant(student.riskLevel)}>{getRiskMeta(student.riskLevel).label}</Badge>
            </div>
            <CardTitle>选择实习生</CardTitle>
            <CardDescription>切换不同岗位，任务会自动变化</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <select
              value={selectedStudentId}
              onChange={(event) => onSelectStudent(event.target.value)}
              className="h-11 w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {students.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}｜{item.role}｜导师 {item.mentor}
                </option>
              ))}
            </select>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-500">当前身份</p>
                  <p className="mt-1 text-xl font-semibold text-slate-950">{student.role}实习生 / 第 3 周</p>
                </div>
                <div className="rounded-xl bg-white px-4 py-3 text-right shadow-sm">
                  <p className="text-xs text-slate-500">成长能量值</p>
                  <p className="text-3xl font-semibold text-blue-600">{student.energy}</p>
                </div>
              </div>
              <div className="mt-5 space-y-3">
                <MetricLine label="任务进度" value={student.progress} />
                <MetricLine label="适岗均分" value={getFitAverage(student)} />
              </div>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-800">
              AI 陪跑建议：{getCoachAdvice(student)}
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="mb-2 text-sm font-semibold text-slate-800">当前风险线索</p>
              <div className="flex flex-wrap gap-2">
                {(riskReasons.length ? riskReasons : ["暂无明显风险"]).map((reason) => (
                  <Badge key={reason} variant={riskReasons.length ? "yellow" : "green"}>
                    {reason}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle>我的成长路径</CardTitle>
                <CardDescription>入营 → 上手 → 协同 → 产出 → 适岗复盘</CardDescription>
              </div>
              <Badge variant="green">科技向善：把支持做得更及时</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <GrowthPath currentStage={student.stage} />
            <div>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-800">本周岗位任务</p>
                <Badge variant="blue">{student.role}路径</Badge>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {tasks.map((task) => {
                  const completed = student.completedTaskIds.includes(task.id);
                  return (
                    <button
                      key={task.id}
                      onClick={() => onToggleTask(student, task.id)}
                      className={cn(
                        "group flex min-h-[112px] cursor-pointer items-start gap-3 rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md",
                        completed ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-white hover:border-blue-200"
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border",
                          completed ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 text-slate-400"
                        )}
                      >
                        {taskLoadingId === task.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : completed ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-slate-900">{task.title}</span>
                        <span className="mt-2 block text-sm leading-6 text-slate-500">{task.evidence}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function GrowthPath({ currentStage }: { currentStage: GrowthStage }) {
  const timeMarks = ["Day 1", "Day 7", "Day 14", "Day 30", "Day 60"];
  const currentIndex = growthStages.indexOf(currentStage);

  return (
    <div className="grid gap-3 md:grid-cols-5">
      {growthStages.map((stage, index) => {
        const active = index <= currentIndex;
        return (
          <div
            key={stage}
            className={cn(
              "relative rounded-2xl border p-4",
              active ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-slate-50"
            )}
          >
            <p className={cn("text-xs", active ? "text-blue-600" : "text-slate-400")}>{timeMarks[index]}</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">{stage}</p>
            {stage === currentStage && (
              <span className="mt-3 inline-flex rounded-full bg-blue-600 px-2.5 py-1 text-xs font-medium text-white">当前阶段</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function MentorWorkspace({
  students,
  target,
  targetId,
  note,
  feedbackResult,
  feedbackStudentName,
  loading,
  onSelectTarget,
  onNoteChange,
  onSubmit
}: {
  students: GrowthStudent[];
  target: GrowthStudent;
  targetId: string;
  note: string;
  feedbackResult: MentorFeedback | null;
  feedbackStudentName: string;
  loading: boolean;
  onSelectTarget: (id: string) => void;
  onNoteChange: (value: string) => void;
  onSubmit: () => void;
}) {
  const pendingStudents = [...students]
    .filter((student) => student.feedbackCount < 2 || student.riskLevel !== "low")
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 7);
  const feedbackRate = Math.round((students.filter((student) => student.feedbackCount >= 2).length / students.length) * 100);

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="导师工作台"
        title="把自然观察变成可沉淀的成长反馈"
        description="AI 只整理反馈线索，真正的沟通分寸、信任建立和关键判断仍由导师完成。"
        badges={["沟通型 HR｜连接业务、导师与新人", "科技向善：AI 辅助支持"]}
      />
      <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>导师反馈及时率</CardTitle>
              <CardDescription>反馈生成后会写回学生档案和 HRBP 看板</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-semibold text-blue-600">{feedbackRate}%</div>
              <Progress value={feedbackRate} className="mt-4" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>待反馈列表</CardTitle>
              <CardDescription>优先处理反馈少、风险高的同学</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {pendingStudents.map((student) => (
                <button
                  key={student.id}
                  onClick={() => onSelectTarget(student.id)}
                  className={cn(
                    "flex w-full cursor-pointer items-center justify-between rounded-xl border p-3 text-left transition hover:border-blue-200 hover:bg-blue-50",
                    targetId === student.id ? "border-blue-200 bg-blue-50" : "border-slate-100 bg-white"
                  )}
                >
                  <span>
                    <span className="block text-sm font-semibold text-slate-900">{student.name}</span>
                    <span className="block text-xs text-slate-500">
                      {student.role} · 反馈 {student.feedbackCount} 次
                    </span>
                  </span>
                  <Badge variant={getRiskBadgeVariant(student.riskLevel)}>{getRiskMeta(student.riskLevel).label}</Badge>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle>AI 反馈生成器</CardTitle>
                <CardDescription>选择对象，输入观察，生成“肯定 / 建议 / 下周行动”三段反馈</CardDescription>
              </div>
              <Badge variant="blue">技术应用型 HR｜AI 反馈</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-[260px_1fr]">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">选择反馈对象</label>
                <select
                  value={targetId}
                  onChange={(event) => onSelectTarget(event.target.value)}
                  className="h-11 w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name}｜{student.role}｜{student.stage}
                    </option>
                  ))}
                </select>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">{target.name} 的当前上下文</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  进度 {target.progress}% · 能量 {target.energy} · 风险 {getRiskReasons(target).join("、") || "暂无明显风险"} ·
                  下一步：{target.nextAction}
                </p>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">输入你的观察</label>
              <Textarea
                value={note}
                onChange={(event) => onNoteChange(event.target.value)}
                placeholder="例如：能主动提问，但需求拆解还不够深入。"
                className="min-h-[132px] bg-white text-slate-900 placeholder:text-slate-400"
              />
            </div>
            <Button onClick={onSubmit} disabled={loading} className="cursor-pointer">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <WandSparkles className="mr-2 h-4 w-4" />}
              生成并写入反馈
            </Button>
            {feedbackResult && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid gap-3 lg:grid-cols-3">
                <FeedbackBlock title={`肯定｜${feedbackStudentName}`} content={feedbackResult.praise} tone="green" />
                <FeedbackBlock title="建议" content={feedbackResult.suggestion} tone="blue" />
                <FeedbackBlock title="下周行动" content={feedbackResult.action} tone="yellow" />
              </motion.div>
            )}
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-800">
              AI 只是把观察整理成反馈草稿。真正是否这样说、什么时候说、用什么语气说，仍由导师根据关系和场景把握。
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function HrbpWorkspace({ students }: { students: GrowthStudent[] }) {
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("全部");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("全部");
  const [stageFilter, setStageFilter] = useState<StageFilter>("全部");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const filteredStudents = students.filter((student) => {
    const matchRole = roleFilter === "全部" || student.role === roleFilter;
    const matchStage = stageFilter === "全部" || student.stage === stageFilter;
    const matchStatus = statusFilter === "全部" || getStudentStatus(student) === statusFilter;
    return matchRole && matchStage && matchStatus;
  });
  const selectedStudent = students.find((student) => student.id === selectedStudentId) ?? null;

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="HRBP 工作台"
        title="把适岗判断从感觉变成证据链"
        description="这是最适合作品截图的页面：20 名实习生卡片、筛选器、右侧详情抽屉和醒目的适岗证据链。"
        badges={["正直：风险判断有证据", "用户为本：HRBP 有自己的工作流"]}
      />
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <CardTitle>实习生适岗看板</CardTitle>
              <CardDescription>点击卡片或“查看详情”打开右侧抽屉</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <FilterGroup label="岗位" options={roleOptions} value={roleFilter} onChange={(value) => setRoleFilter(value as RoleFilter)} />
              <FilterGroup label="状态" options={statusOptions} value={statusFilter} onChange={(value) => setStatusFilter(value as StatusFilter)} />
              <FilterGroup label="阶段" options={stageOptions} value={stageFilter} onChange={(value) => setStageFilter(value as StageFilter)} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm leading-7 text-blue-800">
            本周 HRBP 优先动作：{getPriorityActions(students).join(" ")}
          </div>
          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {filteredStudents.map((student) => {
              const status = getStudentStatus(student);
              const reasons = getRiskReasons(student);
              return (
                <button
                  key={student.id}
                  onClick={() => setSelectedStudentId(student.id)}
                  className="group min-w-0 cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-slate-950">{student.name}</h3>
                        <Badge variant="blue">{student.role}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">导师 {student.mentor} · {student.stage}</p>
                    </div>
                    <Badge variant={status === "高适岗" ? "green" : status === "需关注" ? "yellow" : "blue"}>
                      {status}
                    </Badge>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <SmallMetric label="进度" value={`${student.progress}%`} />
                    <SmallMetric label="能量" value={`${student.energy}`} />
                    <SmallMetric label="反馈" value={`${student.feedbackCount} 次`} />
                  </div>
                  <div className="mt-4 space-y-3">
                    <MetricLine label="适岗信号" value={getFitAverage(student)} />
                    <div className="flex flex-wrap gap-2">
                      {(reasons.length ? reasons : ["稳定成长"]).map((reason) => (
                        <Badge key={reason} variant={reasons.length ? "yellow" : "green"}>
                          {reason}
                        </Badge>
                      ))}
                    </div>
                    <p className="line-clamp-2 text-sm leading-6 text-slate-600">下一步动作：{student.nextAction}</p>
                  </div>
                  <div className="mt-4 flex items-center text-sm font-medium text-blue-700">
                    查看详情
                    <ChevronRight className="ml-1 h-4 w-4 transition group-hover:translate-x-1" />
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
      <StudentDetailSheet
        student={selectedStudent}
        open={Boolean(selectedStudent)}
        onOpenChange={(open) => {
          if (!open) setSelectedStudentId(null);
        }}
      />
    </div>
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
  if (!student) return <Sheet open={open} onOpenChange={onOpenChange} />;

  const radarData = [
    { subject: "业务理解", value: student.fitSignals.businessUnderstanding },
    { subject: "学习速度", value: student.fitSignals.learningSpeed },
    { subject: "协作沟通", value: student.fitSignals.collaboration },
    { subject: "执行质量", value: student.fitSignals.execution },
    { subject: "主动性", value: student.fitSignals.initiative }
  ];
  const completedTasks = getCompletedTasks(student);
  const reasons = getRiskReasons(student);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="max-w-2xl sm:max-w-[720px]">
        <SheetHeader>
          <SheetTitle>{student.name} · 适岗证据链</SheetTitle>
          <SheetDescription>
            {student.role}实习生，导师 {student.mentor}，当前阶段 {student.stage}
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <DarkDetailStat label="进度" value={`${student.progress}%`} />
            <DarkDetailStat label="能量" value={`${student.energy}`} />
            <DarkDetailStat label="反馈" value={`${student.feedbackCount} 次`} />
            <DarkDetailStat label="适岗" value={`${getFitAverage(student)}`} />
          </div>
          <div className="rounded-xl border border-amber-300/30 bg-amber-400/12 p-4 text-sm font-medium leading-7 text-amber-50">
            AI 风险判断仅作为 HRBP 与导师沟通线索，不直接作为留用、淘汰或评价依据。
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.06] p-4">
            <h3 className="mb-3 font-semibold text-white">成长轨迹</h3>
            <GrowthPathDark currentStage={student.stage} history={student.taskHistory} />
          </div>
          <div className="rounded-2xl border border-cyan-300/30 bg-cyan-400/10 p-4 shadow-glow">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="font-semibold text-white">适岗证据链</h3>
              <Badge variant="dark">正直：不凭感觉贴标签</Badge>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <EvidencePanel
                title="任务证据"
                items={completedTasks.map((task) => `${task.title}：${task.evidence}`)}
              />
              <EvidencePanel
                title="导师证据"
                items={student.feedbackHistory.slice(0, 3).map((item) => `${item.createdAt}：${item.praise}`)}
              />
              <EvidencePanel
                title="行为信号"
                items={(reasons.length ? reasons : ["反馈及时", "任务稳定"]).map((item) => `# ${item}`)}
              />
              <EvidencePanel title="AI 建议" items={[student.nextAction]} />
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.06] p-4">
            <h3 className="mb-3 font-semibold text-white">适岗雷达图</h3>
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

function WeeklyReportPage({
  report,
  loading,
  loadingStep,
  onGenerate,
  onCopy,
  onExport
}: {
  report: WeeklyReport | null;
  loading: boolean;
  loadingStep: number;
  onGenerate: () => void;
  onCopy: () => void;
  onExport: () => void;
}) {
  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="AI 周报"
        title="可生成、可复制、可导出的 HRBP 行动周报"
        description="周报来自当前任务、反馈和风险状态，不是写死文案。演示时可以先勾选任务、生成反馈，再重新生成周报。"
        badges={["分析型 HR｜从数据看问题", "技术应用型 HR｜AI 周报生成"]}
      />
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>本周成长周报</CardTitle>
            <CardDescription>{report ? `生成时间：${report.generatedAt}` : "点击按钮后调用 POST /api/weekly-report"}</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={onGenerate} disabled={loading} className="cursor-pointer">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <WandSparkles className="mr-2 h-4 w-4" />}
              {report ? "重新生成" : "生成本周周报"}
            </Button>
            <Button variant="secondary" onClick={onCopy} disabled={!report || loading} className="cursor-pointer">
              <Copy className="mr-2 h-4 w-4" />
              复制周报
            </Button>
            <Button variant="outline" onClick={onExport} disabled={!report || loading} className="cursor-pointer">
              <Download className="mr-2 h-4 w-4" />
              导出 Markdown
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid gap-3 md:grid-cols-4">
              {loadingSteps.map((step, index) => (
                <div
                  key={step}
                  className={cn(
                    "rounded-xl border p-4 text-sm font-medium",
                    index <= loadingStep ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 bg-slate-50 text-slate-500"
                  )}
                >
                  <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm">
                    {index < loadingStep ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Loader2 className="h-4 w-4 animate-spin" />}
                  </div>
                  {step}
                </div>
              ))}
            </div>
          ) : report ? (
            <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
              <div className="space-y-4">
                <ReportSection title="本周概览" items={[report.overview]} />
                <ReportSection title="风险学生" items={report.riskStudents.length ? report.riskStudents : ["暂无高风险集中信号。"]} />
                <ReportSection title="高适岗学生" items={report.highFitStudents.length ? report.highFitStudents : ["暂无新增高适岗信号。"]} />
              </div>
              <div className="space-y-4">
                <ReportSection title="导师待办" items={report.mentorTodos} />
                <ReportSection title="HRBP 优先动作" items={report.hrbpActions} />
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-800">
                  <p className="mb-2 font-semibold">AI 边界说明</p>
                  {report.boundary}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid min-h-[280px] place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-center">
              <div>
                <FileText className="mx-auto h-10 w-10 text-blue-600" />
                <p className="mt-3 text-lg font-semibold text-slate-900">还没有生成周报</p>
                <p className="mt-2 text-sm text-slate-500">建议先体验任务勾选和导师反馈，再生成一版更有数据变化的周报。</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function EventsPage({ events }: { events: DemoEvent[] }) {
  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="数据日志"
        title="模拟后端正在记录每一次关键动作"
        description="评委点击任务、生成反馈、生成周报后，都能在这里看到数据变化记录。"
        badges={["技术应用型 HR｜模拟后端 API", "协作：多角色共享同一张成长地图"]}
      />
      <Card>
        <CardHeader>
          <CardTitle>最近操作记录</CardTitle>
          <CardDescription>GET /api/events 返回最近事件</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {events.map((event) => (
            <div key={event.id} className="flex flex-col gap-2 rounded-xl border border-slate-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Activity className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium leading-6 text-slate-800">{event.message}</p>
                  <p className="mt-1 text-xs text-slate-400">{event.type}</p>
                </div>
              </div>
              <span className="text-xs text-slate-400">{event.createdAt}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function SolutionPage() {
  const apiItems = [
    "GET /api/students：读取 20 名实习生和看板指标",
    "PATCH /api/students/[id]/tasks：更新任务并重算进度、能量、风险、阶段",
    "POST /api/feedback：生成结构化反馈并写入学生档案",
    "POST /api/weekly-report：基于当前数据生成 AI 周报",
    "GET /api/events：读取最近操作日志",
    "POST /api/reset：重置演示数据，方便录视频"
  ];
  const highlights = [
    "三角色工作台：实习生、导师、HRBP 都有明确任务和入口。",
    "数据闭环：任务 → 反馈 → 风险 → KPI → 周报全部联动。",
    "适岗证据链：任务证据、导师证据、行为信号、AI 建议在详情抽屉里集中呈现。",
    "AI 边界：明确说明 AI 只提供沟通线索，不直接用于留用或淘汰。"
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="方案说明"
        title="作业四：实习能量站，而不是作业三 30-60-90"
        description="本 Demo 保留阶段化成长思想，但主线是业务部新人成长导航智能看板，核心解决多角色协同和适岗证据沉淀。"
        badges={["用户为本", "科技向善", "正直", "进取", "协作", "创造"]}
      />
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>项目亮点</CardTitle>
            <CardDescription>适合写入作业提交说明</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {highlights.map((item) => (
              <div key={item} className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm leading-7 text-slate-700">
                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-500" />
                {item}
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>模拟后端 API</CardTitle>
            <CardDescription>Demo 阶段使用内存 store，真实落地可接 HRIS / 招聘系统 / 员工系统</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {apiItems.map((item) => (
              <div key={item} className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm font-medium leading-7 text-blue-800">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>课程与腾讯文化嵌入方式</CardTitle>
          <CardDescription>不堆口号，而是把能力放到功能旁边</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <CultureCourseCard title="沟通型 HR" desc="三角色协同连接业务、导师与新人，减少信息断点。" icon={<Handshake className="h-5 w-5" />} />
          <CultureCourseCard title="分析型 HR" desc="KPI、风险、周报让 HRBP 从数据看问题。" icon={<BarChart3 className="h-5 w-5" />} />
          <CultureCourseCard title="创意型 HR" desc="鹅苗星图和成长能量让成长体验变得可感知。" icon={<Sparkles className="h-5 w-5" />} />
          <CultureCourseCard title="技术应用型 HR" desc="API、AI 反馈、AI 周报和状态联动改变工作方式。" icon={<BrainCircuit className="h-5 w-5" />} />
        </CardContent>
      </Card>
    </div>
  );
}

function PageHeader({
  eyebrow,
  title,
  description,
  badges
}: {
  eyebrow: string;
  title: string;
  description: string;
  badges: string[];
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex flex-wrap gap-2">
        <Badge variant="blue">{eyebrow}</Badge>
        {badges.map((badge) => (
          <Badge key={badge} variant={badge.includes("风险") || badge.includes("正直") ? "yellow" : "default"}>
            {badge}
          </Badge>
        ))}
      </div>
      <h2 className="text-2xl font-semibold tracking-normal text-slate-950 sm:text-3xl">{title}</h2>
      <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-600">{description}</p>
    </div>
  );
}

function FilterGroup({
  label,
  options,
  value,
  onChange
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex max-w-full items-center gap-2 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-1">
      <span className="shrink-0 px-2 text-xs font-medium text-slate-500">{label}</span>
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={cn(
            "shrink-0 cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium transition",
            value === option ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:bg-white/80 hover:text-slate-950"
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
      <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <Progress value={value} />
    </div>
  );
}

function SmallMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
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
        tone === "green" && "border-emerald-200 bg-emerald-50 text-emerald-800",
        tone === "blue" && "border-blue-200 bg-blue-50 text-blue-800",
        tone === "yellow" && "border-amber-200 bg-amber-50 text-amber-800"
      )}
    >
      <p className="mb-1 font-semibold text-slate-950">{title}</p>
      {content}
    </div>
  );
}

function ReportSection({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="mb-3 font-semibold text-slate-950">{title}</p>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item} className="rounded-lg bg-slate-50 p-3 text-sm leading-7 text-slate-700">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function DarkDetailStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.07] p-4">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 truncate text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

function GrowthPathDark({ currentStage, history }: { currentStage: GrowthStage; history: string[] }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-5">
        {growthStages.map((stage) => (
          <div
            key={stage}
            className={cn(
              "rounded-xl border p-3 text-sm",
              stage === currentStage ? "border-cyan-300/40 bg-cyan-300/12 text-cyan-50" : "border-white/10 bg-white/[0.04] text-slate-300"
            )}
          >
            {stage}
          </div>
        ))}
      </div>
      <div className="space-y-2">
        {(history.length ? history.slice(0, 4) : ["暂无任务完成记录"]).map((item) => (
          <div key={item} className="rounded-lg bg-white/[0.06] p-3 text-sm leading-6 text-slate-300">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function EvidencePanel({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#07111F]/55 p-4">
      <p className="mb-3 text-sm font-semibold text-cyan-50">{title}</p>
      <div className="space-y-2">
        {(items.length ? items : ["暂无可用证据"]).map((item) => (
          <div key={item} className="rounded-lg bg-white/[0.08] p-3 text-sm leading-6 text-slate-200">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function CultureCourseCard({ title, desc, icon }: { title: string; desc: string; icon: ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">{icon}</div>
      <p className="font-semibold text-slate-950">{title}</p>
      <p className="mt-2 text-sm leading-7 text-slate-600">{desc}</p>
    </div>
  );
}
