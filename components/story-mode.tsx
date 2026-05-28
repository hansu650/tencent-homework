"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Download,
  FileCode2,
  FileText,
  Loader2,
  Map,
  MessageSquareText,
  Printer,
  Radar as RadarIcon,
  Rocket,
  ShieldCheck,
  Sparkles,
  Upload,
  UserRound,
  WandSparkles
} from "lucide-react";
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import type { GrowthStudent, MentorFeedback } from "@/lib/growth";
import { getCompletedTasks, getFitAverage, getRiskMeta, getRiskReasons } from "@/lib/growth";
import {
  defaultMentorByRole,
  defaultStudentByRole,
  getDefaultStoryProfile,
  roleAvatars,
  storyStages,
  storyTasks,
  type StoryProfile,
  type StoryRole,
  type StoryTaskDetail
} from "@/lib/story-content";
import { cn } from "@/lib/utils";

const profileKey = "emiao-story-profile";
const storyRoleOptions: StoryRole[] = ["产品", "研发", "销售"];

const chapterLinks = [
  ["/", "开场"],
  ["/briefing", "简报"],
  ["/profile", "档案"],
  ["/mission", "任务"],
  ["/mentor", "导师"],
  ["/hrbp", "证据"],
  ["/report", "报告"]
];

const chartTooltipStyle = {
  background: "#07111F",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 12,
  color: "#fff"
};

function getStoredProfile(): StoryProfile {
  if (typeof window === "undefined") return getDefaultStoryProfile();

  try {
    const raw = window.localStorage.getItem(profileKey);
    return raw ? { ...getDefaultStoryProfile(), ...JSON.parse(raw) } : getDefaultStoryProfile();
  } catch {
    return getDefaultStoryProfile();
  }
}

function saveProfile(profile: StoryProfile) {
  window.localStorage.setItem(profileKey, JSON.stringify(profile));
}

function useStoryProfile() {
  const [profile, setProfile] = useState<StoryProfile>(() => getDefaultStoryProfile());

  useEffect(() => {
    setProfile(getStoredProfile());
  }, []);

  const updateProfile = useCallback((next: StoryProfile) => {
    saveProfile(next);
    setProfile(next);
  }, []);

  return { profile, updateProfile };
}

function useStoryStudent(profile: StoryProfile) {
  const [student, setStudent] = useState<GrowthStudent | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStudent = useCallback(async () => {
    setLoading(true);
    const response = await fetch("/api/students", { cache: "no-store" });
    const payload = (await response.json()) as { students: GrowthStudent[] };
    const nextStudent =
      payload.students.find((item) => item.id === profile.studentId) ??
      payload.students.find((item) => item.role === profile.role) ??
      payload.students[0] ??
      null;
    setStudent(nextStudent);
    setLoading(false);
  }, [profile.role, profile.studentId]);

  useEffect(() => {
    loadStudent().catch(() => setLoading(false));
  }, [loadStudent]);

  return { student, setStudent, loading, reload: loadStudent };
}

function StoryTransition({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -18 }}
      transition={{ duration: 0.36, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.main>
  );
}

function StoryTopNav({ current }: { current: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
            <Map className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-base font-semibold text-slate-950">鹅苗星图</span>
            <span className="block truncate text-xs text-slate-500">Story Mode · 作业四「实习能量站」</span>
          </span>
        </Link>
        <nav className="flex gap-2 overflow-x-auto">
          {chapterLinks.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700",
                current === href ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-500"
              )}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/dashboard"
            className="shrink-0 rounded-full border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-slate-800"
          >
            高级工作台
          </Link>
        </nav>
      </div>
    </header>
  );
}

function StoryFrame({
  current,
  eyebrow,
  title,
  description,
  children
}: {
  current: string;
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F7FAFF] text-slate-950">
      <StoryTopNav current={current} />
      <StoryTransition className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6">
          <Badge variant="blue">{eyebrow}</Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl">{title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{description}</p>
        </div>
        {children}
      </StoryTransition>
    </div>
  );
}

function PixelGoose({ role, selected = false, photo }: { role: StoryRole; selected?: boolean; photo?: string }) {
  const avatar = roleAvatars[role];

  if (photo) {
    return <img src={photo} alt="上传头像" className="h-16 w-16 rounded-2xl object-cover" />;
  }

  return (
    <div
      className={cn(
        "grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br font-mono text-xl font-black text-white shadow-sm transition",
        avatar.tone,
        selected && "scale-105 shadow-glow"
      )}
    >
      {avatar.face}
    </div>
  );
}

function Toast({ message }: { message: string | null }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 18 }}
          className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-xl"
        >
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function OpeningPage() {
  const lines = [
    "公元 2030 年，业务部迎来 20 名新入职的校招实习生。",
    "导师忙于项目，带教节奏全凭经验；",
    "实习生频繁私聊 HR：“我到底该学什么？”",
    "招聘同学追问：“这批人最近适岗情况如何？”",
    "暴雨入营夜，你作为 AI-HRBP，需要启动「鹅苗星图」。"
  ];

  return (
    <StoryTransition className="relative min-h-screen overflow-hidden bg-[#07111F] text-white">
      <div className="rain-field" />
      <div className="data-rain" />
      <div className="absolute inset-0 dark-grid-pattern opacity-60" />
      <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-4 py-12">
        <div className="mb-5 flex flex-wrap gap-2">
          <Badge variant="dark">Story Mode</Badge>
          <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-medium text-cyan-100">
            作业四 · 实习能量站
          </span>
        </div>
        <div className="grid gap-10 lg:grid-cols-[1fr_360px] lg:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-cyan-200">Emiao Growth Map</p>
            <h1 className="mt-4 text-5xl font-semibold tracking-normal sm:text-7xl">鹅苗星图</h1>
            <p className="mt-4 text-2xl font-semibold text-cyan-100">AI 实习生成长导航看板</p>
            <div className="mt-8 space-y-4 text-base leading-8 text-slate-300">
              {lines.map((line, index) => (
                <motion.p
                  key={line}
                  initial={{ opacity: 0, x: -18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + index * 0.35, duration: 0.5 }}
                >
                  {line}
                </motion.p>
              ))}
            </div>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="cursor-pointer">
                <Link href="/briefing">
                  启动鹅苗星图
                  <Rocket className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="dark" className="cursor-pointer border border-white/15">
                <Link href="/dashboard">进入高级工作台</Link>
              </Button>
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-6 shadow-glow backdrop-blur-xl">
            <PixelGoose role="产品" />
            <p className="mt-5 text-xl font-semibold">AI-HRBP 终端</p>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              {["20 名鹅苗待连接", "导师反馈信号弱", "适岗证据链未生成"].map((item) => (
                <div key={item} className="flex items-center gap-2 rounded-xl bg-white/[0.06] p-3">
                  <AlertTriangle className="h-4 w-4 text-amber-200" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </StoryTransition>
  );
}

export function BriefingPage() {
  const cards = [
    ["实习生迷茫", "不知道本周该学什么、做到什么程度。", UserRound],
    ["导师凭经验", "带教节奏和反馈标准不统一。", MessageSquareText],
    ["HRBP 信息断点", "进度、风险、适岗情况散落在私聊里。", RadarIcon]
  ] as const;

  return (
    <StoryFrame
      current="/briefing"
      eyebrow="任务简报"
      title="暴雨入营夜，三条信号同时告警"
      description="你要做的不是搭一个普通后台，而是把新人、导师和 HRBP 拉回同一张成长地图。"
    >
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map(([title, desc, Icon], index) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.12 }}
          >
            <Card className="h-full transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Icon className="h-6 w-6" />
                </div>
                <CardTitle>{title}</CardTitle>
                <CardDescription className="leading-7">{desc}</CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        ))}
      </div>
      <Card className="mt-6 border-blue-100 bg-blue-50/70">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium leading-7 text-blue-900">
            你的任务：设计一套 AI 成长导航工具，让新人、导师和 HRBP 在同一张成长地图上协作。
          </p>
          <Button asChild className="shrink-0 cursor-pointer">
            <Link href="/profile">
              接收第一位鹅苗档案
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </StoryFrame>
  );
}

export function ProfilePage() {
  const router = useRouter();
  const { profile, updateProfile } = useStoryProfile();
  const [draft, setDraft] = useState<StoryProfile>(profile);

  useEffect(() => {
    setDraft(profile);
  }, [profile]);

  const canSubmit = draft.name.trim().length > 0 && Boolean(draft.role);

  const setRole = (role: StoryRole) => {
    setDraft((current) => ({
      ...current,
      avatar: role,
      role,
      mentor: current.mentor || defaultMentorByRole[role],
      studentId: defaultStudentByRole[role]
    }));
  };

  const handlePhoto = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setDraft((current) => ({ ...current, photo: String(reader.result) }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <StoryFrame
      current="/profile"
      eyebrow="创建鹅苗档案"
      title="接收第一位鹅苗，生成成长导航卡"
      description="这个表单不是登录，也不是数据库录入。它让评委进入一个具体角色：一名新人、一位导师、一条成长路径。"
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>选择角色形象</CardTitle>
            <CardDescription>选择后会高亮，并同步岗位方向。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-3 md:grid-cols-3">
              {storyRoleOptions.map((role) => (
                <button
                  key={role}
                  onClick={() => setRole(role)}
                  className={cn(
                    "cursor-pointer rounded-2xl border p-4 text-left transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-md",
                    draft.avatar === role ? "border-blue-400 bg-blue-50 shadow-sm" : "border-slate-200 bg-white"
                  )}
                >
                  <PixelGoose role={role} selected={draft.avatar === role} />
                  <p className="mt-4 font-semibold text-slate-950">{roleAvatars[role].name}</p>
                  <p className="mt-1 text-sm text-slate-500">{roleAvatars[role].title}</p>
                </button>
              ))}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="姓名">
                <input
                  value={draft.name}
                  onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="例如：林知夏"
                />
              </Field>
              <Field label="岗位方向">
                <select
                  value={draft.role}
                  onChange={(event) => setRole(event.target.value as StoryRole)}
                  className="h-11 w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  {storyRoleOptions.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="导师">
                <input
                  value={draft.mentor}
                  onChange={(event) => setDraft((current) => ({ ...current, mentor: event.target.value }))}
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </Field>
              <Field label="头像或照片（可选）">
                <label className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-600 transition hover:border-blue-300 hover:bg-blue-50">
                  <Upload className="h-4 w-4" />
                  上传头像
                  <input className="hidden" type="file" accept="image/*" onChange={(event) => handlePhoto(event.target.files?.[0])} />
                </label>
              </Field>
            </div>
            <Field label="当前困惑">
              <div className="grid gap-2 sm:grid-cols-3">
                {["不知道该学什么", "不知道怎么交付", "不知道是否适合岗位"].map((item) => (
                  <button
                    key={item}
                    onClick={() => setDraft((current) => ({ ...current, confusion: item }))}
                    className={cn(
                      "cursor-pointer rounded-xl border px-3 py-3 text-sm transition hover:border-blue-300 hover:bg-blue-50",
                      draft.confusion === item ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-600"
                    )}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </Field>
            <Button
              disabled={!canSubmit}
              onClick={() => {
                updateProfile({ ...draft, name: draft.name.trim(), mentor: draft.mentor || defaultMentorByRole[draft.role] });
                router.push("/mission");
              }}
              className="w-full cursor-pointer"
              size="lg"
            >
              生成成长导航卡
              <Sparkles className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
        <Card className="h-fit border-blue-100 bg-blue-50/70">
          <CardHeader>
            <CardTitle>档案预览</CardTitle>
            <CardDescription>这张卡会贯穿后续任务、导师反馈和 HRBP 证据链。</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <PixelGoose role={draft.avatar} photo={draft.photo} selected />
              <div>
                <p className="text-xl font-semibold text-slate-950">{draft.name || "未命名鹅苗"}</p>
                <p className="mt-1 text-sm text-slate-600">
                  {draft.role}方向 · 导师 {draft.mentor || defaultMentorByRole[draft.role]}
                </p>
              </div>
            </div>
            <div className="mt-5 rounded-xl border border-blue-100 bg-white p-4 text-sm leading-7 text-slate-700">
              当前困惑：{draft.confusion}
            </div>
          </CardContent>
        </Card>
      </div>
    </StoryFrame>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

export function MissionPage() {
  const { profile } = useStoryProfile();
  const { student, setStudent, loading } = useStoryStudent(profile);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [busyTask, setBusyTask] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [feedbackSent, setFeedbackSent] = useState<string | null>(null);
  const tasks = storyTasks[profile.role];

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2400);
  };

  const submitTask = async (task: StoryTaskDetail) => {
    if (!student) return;
    setBusyTask(task.id);
    const completed = !student.completedTaskIds.includes(task.id);
    const response = await fetch(`/api/students/${student.id}/tasks`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId: task.id, completed })
    });
    const result = (await response.json()) as { student: GrowthStudent };
    setStudent(result.student);
    setBusyTask(null);
    showToast(completed ? "进展已提交，成长能量已更新" : "已取消该任务进展");
  };

  const requestFeedback = async (task: StoryTaskDetail) => {
    if (!student) return;
    setBusyTask(task.id);
    await fetch("/api/feedback/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: student.id, taskId: task.id })
    });
    setFeedbackSent(task.id);
    setBusyTask(null);
    showToast("导师已收到检查点");
  };

  return (
    <StoryFrame
      current="/mission"
      eyebrow="成长导航任务"
      title="让新人知道本周该做什么"
      description="这一页解决实习生迷茫：任务不是清单，而是带着导师标准和 HRBP 适岗信号的成长导航。"
    >
      {loading || !student ? (
        <LoadingCard text="正在读取鹅苗成长状态..." />
      ) : (
        <div className="space-y-5">
          <Card className="border-blue-100 bg-blue-50/70">
            <CardContent className="grid gap-4 p-5 md:grid-cols-[1fr_240px] md:items-center">
              <div className="flex items-center gap-4">
                <PixelGoose role={profile.avatar} photo={profile.photo} selected />
                <div>
                  <h2 className="text-2xl font-semibold text-slate-950">{profile.name}</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {profile.role}鹅苗 · 导师 {profile.mentor} · {student.stage}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <MiniStat label="成长能量" value={student.energy} />
                <MiniStat label="任务进度" value={`${student.progress}%`} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>带教节奏导航</CardTitle>
              <CardDescription>入营 → 上手 → 协同 → 产出 → 适岗复盘，不使用 30-60-90 作为主线。</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 md:grid-cols-5">
                {storyStages.map(({ stage, mark }) => (
                  <div
                    key={stage}
                    className={cn(
                      "rounded-2xl border p-3",
                      stage === student.stage ? "border-blue-300 bg-blue-50" : "border-slate-200 bg-white"
                    )}
                  >
                    <p className="text-xs text-slate-500">{mark}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-950">{stage}</p>
                    {stage === student.stage && <Badge variant="blue" className="mt-2">当前</Badge>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {tasks.map((task) => {
              const completed = student.completedTaskIds.includes(task.id);
              const expanded = expandedTask === task.id;
              return (
                <Card key={task.id} className="transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle>{task.title}</CardTitle>
                        <CardDescription className="mt-2 leading-6">{task.goal}</CardDescription>
                      </div>
                      <Badge variant={completed ? "green" : "blue"}>{completed ? "已完成" : "本周任务"}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <TaskSignal title="交付物" value={task.deliverable} />
                    <TaskSignal title="导师看什么" value={task.mentorSignal} tone="blue" />
                    <TaskSignal title="HRBP 看什么信号" value={task.hrbpSignal} tone="green" />
                    <AnimatePresence>
                      {expanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                            <p className="mb-3 text-sm font-semibold text-blue-900">AI 拆解</p>
                            <div className="space-y-2">
                              {task.steps.map((step, index) => (
                                <div key={step} className="rounded-lg bg-white p-3 text-sm text-blue-800">
                                  第{index + 1}步：{step}
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <div className="grid gap-2 sm:grid-cols-3">
                      <Button variant="secondary" onClick={() => setExpandedTask(expanded ? null : task.id)} className="cursor-pointer">
                        <Sparkles className="mr-2 h-4 w-4" />
                        AI 拆解
                      </Button>
                      <Button onClick={() => submitTask(task)} disabled={busyTask === task.id} className="cursor-pointer">
                        {busyTask === task.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ClipboardCheck className="mr-2 h-4 w-4" />}
                        提交进展
                      </Button>
                      <Button variant="outline" onClick={() => requestFeedback(task)} disabled={busyTask === task.id} className="cursor-pointer">
                        <MessageSquareText className="mr-2 h-4 w-4" />
                        请求导师反馈
                      </Button>
                    </div>
                    {feedbackSent === task.id && (
                      <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">导师已收到检查点。</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="flex justify-end">
            <Button asChild size="lg" className="cursor-pointer">
              <Link href="/mentor">
                前往导师检查点
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      )}
      <Toast message={toast} />
    </StoryFrame>
  );
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function TaskSignal({ title, value, tone }: { title: string; value: string; tone?: "blue" | "green" }) {
  return (
    <div
      className={cn(
        "rounded-xl border p-3",
        tone === "blue" && "border-blue-100 bg-blue-50 text-blue-800",
        tone === "green" && "border-emerald-100 bg-emerald-50 text-emerald-800",
        !tone && "border-slate-100 bg-slate-50 text-slate-700"
      )}
    >
      <p className="text-xs font-semibold">{title}</p>
      <p className="mt-1 text-sm leading-6">{value}</p>
    </div>
  );
}

function LoadingCard({ text }: { text: string }) {
  return (
    <Card>
      <CardContent className="grid min-h-[320px] place-items-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-3 text-sm text-slate-600">{text}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function MentorCheckpointPage() {
  const router = useRouter();
  const { profile } = useStoryProfile();
  const { student, loading } = useStoryStudent(profile);
  const [note, setNote] = useState("");
  const [feedback, setFeedback] = useState<MentorFeedback | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const generateFeedback = async () => {
    if (!student) return;
    setBusy(true);
    const response = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: student.id, mentorNote: note })
    });
    const result = (await response.json()) as { feedback: MentorFeedback };
    setFeedback(result.feedback);
    setBusy(false);
    setToast("结构化反馈已写入成长档案");
    window.setTimeout(() => setToast(null), 2400);
  };

  return (
    <StoryFrame
      current="/mentor"
      eyebrow="导师检查点"
      title="把经验式观察变成结构化反馈"
      description="导师收到鹅苗的反馈请求。请把你的观察输入给 AI，生成一段结构化、可执行、有温度的反馈。"
    >
      {loading || !student ? (
        <LoadingCard text="正在读取导师检查点..." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>当前鹅苗档案</CardTitle>
              <CardDescription>{profile.role}方向 · 导师 {profile.mentor}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <PixelGoose role={profile.avatar} photo={profile.photo} selected />
                <div>
                  <p className="text-xl font-semibold text-slate-950">{profile.name}</p>
                  <p className="text-sm text-slate-500">{student.stage} · 能量 {student.energy}</p>
                </div>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="mb-2 text-sm font-semibold text-slate-800">已提交任务</p>
                <div className="space-y-2">
                  {(getCompletedTasks(student).length ? getCompletedTasks(student) : storyTasks[profile.role].slice(0, 1)).map((task) => (
                    <div key={task.id} className="rounded-lg bg-white p-3 text-sm text-slate-700">
                      {task.title}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>导师观察输入</CardTitle>
              <CardDescription>AI 会拆成肯定、建议、下周行动三段。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="例如：能主动提问，但需求拆解还不够深入。"
                className="min-h-[150px] bg-white text-slate-900 placeholder:text-slate-400"
              />
              <Button onClick={generateFeedback} disabled={busy} className="cursor-pointer">
                {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <WandSparkles className="mr-2 h-4 w-4" />}
                生成结构化反馈
              </Button>
              {feedback && (
                <div className="grid gap-3 md:grid-cols-3">
                  <FeedbackCard title="肯定" value={feedback.praise} tone="green" />
                  <FeedbackCard title="建议" value={feedback.suggestion} tone="blue" />
                  <FeedbackCard title="下周行动" value={feedback.action} tone="yellow" />
                </div>
              )}
              {feedback && (
                <div className="flex justify-end">
                  <Button onClick={() => router.push("/hrbp")} size="lg" className="cursor-pointer">
                    写入成长档案并通知 HRBP
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
      <Toast message={toast} />
    </StoryFrame>
  );
}

function FeedbackCard({ title, value, tone }: { title: string; value: string; tone: "green" | "blue" | "yellow" }) {
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
      {value}
    </div>
  );
}

export function HrbpEvidencePage() {
  const { profile } = useStoryProfile();
  const { student, loading } = useStoryStudent(profile);

  if (loading || !student) {
    return (
      <StoryFrame current="/hrbp" eyebrow="HRBP 证据页" title="正在整理适岗证据链" description="请稍候。">
        <LoadingCard text="正在读取 HRBP 证据链..." />
      </StoryFrame>
    );
  }

  const radarData = [
    { subject: "业务理解", value: student.fitSignals.businessUnderstanding },
    { subject: "学习速度", value: student.fitSignals.learningSpeed },
    { subject: "协作沟通", value: student.fitSignals.collaboration },
    { subject: "执行质量", value: student.fitSignals.execution },
    { subject: "主动性", value: student.fitSignals.initiative }
  ];
  const completed = getCompletedTasks(student);
  const risks = getRiskReasons(student);

  return (
    <StoryFrame
      current="/hrbp"
      eyebrow="HRBP 适岗证据"
      title="让适岗判断有证据，而不是凭感觉"
      description="这一页解决 HRBP 和招聘同学想看的核心问题：最近适岗情况如何，证据在哪里。"
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <Card className="border-blue-100 bg-blue-50/60">
            <CardContent className="grid gap-4 p-5 md:grid-cols-[1fr_260px] md:items-center">
              <div className="flex items-center gap-4">
                <PixelGoose role={profile.avatar} photo={profile.photo} selected />
                <div>
                  <h2 className="text-2xl font-semibold text-slate-950">{profile.name}</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {profile.role}方向 · 导师 {profile.mentor} · {student.stage}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <MiniStat label="能量" value={student.energy} />
                <MiniStat label="进度" value={`${student.progress}%`} />
                <MiniStat label="适岗" value={getFitAverage(student)} />
              </div>
            </CardContent>
          </Card>
          <Card className="border-cyan-100">
            <CardHeader>
              <CardTitle>适岗证据链</CardTitle>
              <CardDescription>任务、反馈、行为和 AI 建议放在同一个判断链路里。</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              <EvidenceBlock title="任务证据" items={(completed.length ? completed : storyTasks[profile.role].slice(0, 1)).map((task) => task.title)} />
              <EvidenceBlock
                title="导师证据"
                items={student.feedbackHistory.slice(0, 3).map((item) => `${item.createdAt}：${item.praise}`)}
              />
              <EvidenceBlock title="行为信号" items={(student.tags.length ? student.tags : risks).map((item) => `# ${item}`)} />
              <EvidenceBlock title="AI 建议" items={[student.nextAction]} />
            </CardContent>
          </Card>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium leading-7 text-amber-800">
            AI 风险判断仅作为 HRBP 与导师沟通线索，不直接作为留用、淘汰或评价依据。
          </div>
        </div>
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>适岗雷达图</CardTitle>
            <CardDescription>基于当前 mock 学生数据和反馈状态。</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#CBD5E1" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "#475569", fontSize: 12 }} />
                  <Radar dataKey="value" stroke="#1664FF" fill="#1664FF" fillOpacity={0.24} />
                  <ChartTooltip contentStyle={chartTooltipStyle} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <Button asChild size="lg" className="mt-4 w-full cursor-pointer">
              <Link href="/report">
                生成成长复盘报告
                <FileText className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </StoryFrame>
  );
}

function EvidenceBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <p className="mb-3 font-semibold text-slate-950">{title}</p>
      <div className="space-y-2">
        {(items.length ? items : ["暂无证据"]).map((item) => (
          <div key={item} className="rounded-xl bg-white p-3 text-sm leading-6 text-slate-700">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ReportPage() {
  const { profile } = useStoryProfile();
  const { student, loading } = useStoryStudent(profile);
  const [tex, setTex] = useState("");
  const [filename, setFilename] = useState("emiao-growth-report.tex");
  const [generating, setGenerating] = useState(false);
  const [activeStep, setActiveStep] = useState(-1);
  const [pdfMessage, setPdfMessage] = useState("");
  const steps = ["正在整理任务证据", "正在归纳导师反馈", "正在生成适岗证据链", "正在写入 AI 边界说明", "正在生成 LaTeX", "正在编译 PDF"];

  const generateLatex = async () => {
    if (!student) return;
    setGenerating(true);
    setPdfMessage("");
    for (let index = 0; index < steps.length - 1; index += 1) {
      setActiveStep(index);
      await new Promise((resolve) => window.setTimeout(resolve, 360));
    }
    const response = await fetch("/api/report/latex", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: student.id, profile })
    });
    const result = (await response.json()) as { tex: string; filename: string };
    setTex(result.tex);
    setFilename(result.filename);
    setActiveStep(4);
    setGenerating(false);
  };

  const downloadTex = () => {
    window.location.href = "/api/report/tex";
  };

  const downloadPdf = async () => {
    if (!student) return;
    setGenerating(true);
    setActiveStep(5);
    const response = await fetch("/api/report/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: student.id, profile })
    });
    const result = (await response.json()) as { ok: boolean; filename: string; pdfBase64?: string; message?: string };
    setGenerating(false);
    if (result.ok && result.pdfBase64) {
      const link = document.createElement("a");
      link.href = `data:application/pdf;base64,${result.pdfBase64}`;
      link.download = result.filename;
      link.click();
      setPdfMessage("PDF 已生成并开始下载。");
      return;
    }
    setPdfMessage(result.message ?? "当前环境无法编译 PDF，可下载 .tex 或使用浏览器打印为 PDF。");
  };

  return (
    <StoryFrame
      current="/report"
      eyebrow="最终产出"
      title="生成《鹅苗成长导航复盘报告》"
      description="最终产出不只是一个页面，而是一份可下载的 LaTeX 源文件和 PDF fallback，适合放进作业提交材料。"
    >
      {loading || !student ? (
        <LoadingCard text="正在准备报告数据..." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <Card className="min-h-[680px]">
            <CardHeader>
              <CardTitle>报告预览</CardTitle>
              <CardDescription>{filename}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mx-auto max-w-2xl rounded-sm border border-slate-200 bg-white p-8 shadow-lg print:shadow-none">
                <div className="text-center">
                  <h2 className="text-2xl font-semibold text-slate-950">鹅苗成长导航复盘报告</h2>
                  <p className="mt-2 text-sm text-slate-500">Emiao Growth Map · AI-HR Demo</p>
                </div>
                <div className="mt-8 space-y-5 text-sm leading-7 text-slate-700">
                  <ReportPreviewSection title="1. 基本信息" value={`${profile.name}｜${profile.role}方向｜导师 ${profile.mentor}｜成长能量 ${student.energy}`} />
                  <ReportPreviewSection title="2. 岗位任务完成情况" value={(getCompletedTasks(student).map((task) => task.title).join("、") || "待补充任务证据")} />
                  <ReportPreviewSection title="3. 导师结构化反馈" value={student.feedbackHistory[0]?.praise ?? "待导师补充结构化反馈。"} />
                  <ReportPreviewSection title="4. HRBP 适岗证据链" value={`${student.tags.join("、") || "暂无标签"}；适岗均分 ${getFitAverage(student)}。`} />
                  <ReportPreviewSection title="5. AI 风险判断与边界" value="AI 风险判断仅作为沟通线索，不直接作为留用、淘汰或评价依据。" />
                  <ReportPreviewSection title="6. 下一步成长建议" value={student.nextAction} />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>生成步骤</CardTitle>
              <CardDescription>LaTeX 优先，PDF 编译失败时提供 fallback。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {steps.map((step, index) => (
                  <div
                    key={step}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border p-3 text-sm",
                      index <= activeStep ? "border-blue-200 bg-blue-50 text-blue-800" : "border-slate-200 bg-slate-50 text-slate-500"
                    )}
                  >
                    {generating && index === activeStep ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : index <= activeStep ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <span className="h-4 w-4 rounded-full border border-slate-300" />
                    )}
                    {step}
                  </div>
                ))}
              </div>
              <div className="grid gap-2">
                <Button onClick={generateLatex} disabled={generating} className="cursor-pointer">
                  <FileCode2 className="mr-2 h-4 w-4" />
                  生成 LaTeX
                </Button>
                <Button variant="secondary" onClick={downloadTex} disabled={!tex} className="cursor-pointer">
                  <Download className="mr-2 h-4 w-4" />
                  下载 .tex
                </Button>
                <Button variant="outline" onClick={downloadPdf} disabled={generating || !tex} className="cursor-pointer">
                  <Printer className="mr-2 h-4 w-4" />
                  下载 PDF
                </Button>
                <Button asChild variant="secondary">
                  <Link href="/hrbp">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    返回 HRBP 证据页
                  </Link>
                </Button>
                <Button asChild variant="dark">
                  <Link href="/dashboard">查看高级工作台</Link>
                </Button>
              </div>
              {pdfMessage && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-800">
                  {pdfMessage}
                  <Button variant="outline" size="sm" onClick={() => window.print()} className="mt-3 w-full cursor-pointer">
                    使用浏览器打印 PDF
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </StoryFrame>
  );
}

function ReportPreviewSection({ title, value }: { title: string; value: string }) {
  return (
    <section>
      <h3 className="font-semibold text-slate-950">{title}</h3>
      <p className="mt-1">{value}</p>
    </section>
  );
}
