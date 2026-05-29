"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
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
  Sparkles,
  Terminal,
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
  confusionOptions,
  defaultMentorByRole,
  defaultStudentByRole,
  getDefaultStoryProfile,
  roleAvatars,
  storyStages,
  storyTasks,
  type StoryProfile,
  type StoryRole
} from "@/lib/story-content";
import { cn } from "@/lib/utils";

const profileKey = "emiao-story-profile";
const storyRoleOptions: StoryRole[] = ["产品", "研发", "销售"];

const chapters = [
  { href: "/", label: "接入" },
  { href: "/briefing", label: "简报" },
  { href: "/profile", label: "建档" },
  { href: "/diagnosis", label: "诊断" },
  { href: "/mission", label: "任务" },
  { href: "/mentor", label: "反馈" },
  { href: "/hrbp", label: "证据" },
  { href: "/report", label: "报告" }
];

const chartTooltipStyle = {
  background: "#0F172A",
  border: "1px solid rgba(148,163,184,0.32)",
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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.main>
  );
}

function StoryTopNav({ current }: { current: string }) {
  const activeIndex = Math.max(0, chapters.findIndex((chapter) => chapter.href === current));

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
            <Map className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-slate-950">鹅苗星图</span>
            <span className="block truncate text-xs text-slate-500">AI-HRBP 单人主线体验</span>
          </span>
        </Link>
        <div className="flex items-center gap-3 overflow-x-auto">
          <div className="flex items-center gap-1.5">
            {chapters.map((chapter, index) => (
              <Link
                key={chapter.href}
                href={chapter.href}
                className={cn(
                  "h-2.5 w-8 shrink-0 rounded-full transition",
                  index <= activeIndex ? "bg-blue-600" : "bg-slate-200 hover:bg-slate-300"
                )}
                aria-label={chapter.label}
              />
            ))}
          </div>
          <Link
            href="/dashboard"
            className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          >
            高级工作台
          </Link>
        </div>
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
    <div className="min-h-screen bg-[#F7F8FA] text-slate-950">
      <StoryTopNav current={current} />
      <StoryTransition className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
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

function RoleMark({ role, selected = false, photo }: { role: StoryRole; selected?: boolean; photo?: string }) {
  const avatar = roleAvatars[role];

  if (photo) {
    return <img src={photo} alt="鹅苗头像" className="h-14 w-14 rounded-2xl object-cover" />;
  }

  return (
    <div
      className={cn(
        "grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br text-lg font-semibold text-white shadow-sm transition",
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
          className="fixed bottom-5 left-1/2 z-50 flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-xl"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function OpeningPage() {
  const terminalLines = [
    "业务部：本周 20 名校招实习生进入岗位实战。",
    "导师：项目节奏太快，带教标准很难统一。",
    "实习生：我到底该学什么，做到什么程度？",
    "招聘同学：这批人最近适岗情况如何？"
  ];

  return (
    <StoryTransition className="min-h-screen bg-[#0B1220] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(23,107,255,0.22),transparent_36%),linear-gradient(180deg,#0B1220,#0F172A)]" />
      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-4 py-12">
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <Badge variant="dark">腾讯 AI-HR 作业四</Badge>
          <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
            你正在扮演 AI-HRBP
          </span>
        </div>
        <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:items-center">
          <section>
            <p className="text-sm uppercase tracking-[0.28em] text-blue-200">Emiao Growth Map</p>
            <h1 className="mt-4 text-5xl font-semibold tracking-normal sm:text-6xl">鹅苗星图</h1>
            <p className="mt-5 max-w-2xl text-xl leading-9 text-slate-200">
              一套给业务部新人的 AI 实习生成长导航工具，把任务、反馈、风险和适岗证据连接起来。
            </p>
            <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur">
              <div className="flex items-center gap-2 border-b border-white/10 pb-3 text-sm text-slate-300">
                <Terminal className="h-4 w-4 text-blue-300" />
                HRBP 求助消息
                <span className="ml-auto h-2 w-2 rounded-full bg-emerald-400" />
              </div>
              <div className="mt-4 space-y-3">
                {terminalLines.map((line, index) => (
                  <motion.p
                    key={line}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.16 }}
                    className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm leading-6 text-slate-200"
                  >
                    {line}
                  </motion.p>
                ))}
              </div>
            </div>
            <div className="mt-8">
              <Button asChild size="lg" className="cursor-pointer bg-[#176BFF] hover:bg-[#2B7FFF]">
                <Link href="/briefing">
                  接收任务
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </section>
          <aside className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur">
            <p className="text-sm font-medium text-blue-200">本次主线只处理一个人</p>
            <h2 className="mt-3 text-2xl font-semibold">从一名新人开始，走完整个成长闭环</h2>
            <div className="mt-6 space-y-3 text-sm text-slate-300">
              {["接收业务求助", "创建鹅苗档案", "生成本周任务", "导师反馈入档", "HRBP 查看证据链", "生成复盘报告"].map((item, index) => (
                <div key={item} className="flex items-center gap-3">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-white/10 text-xs text-blue-100">{index + 1}</span>
                  {item}
                </div>
              ))}
            </div>
            <Link href="/dashboard" className="mt-6 inline-flex text-sm font-medium text-blue-200 transition hover:text-white">
              20 人数据保留在高级工作台
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </aside>
        </div>
      </div>
    </StoryTransition>
  );
}

export function BriefingPage() {
  const cards = [
    {
      title: "实习生迷茫",
      desc: "不知道本周该学什么、做到什么程度。",
      icon: UserRound
    },
    {
      title: "导师凭经验",
      desc: "带教节奏和反馈标准不统一。",
      icon: MessageSquareText
    },
    {
      title: "HRBP 信息断点",
      desc: "进度、风险、适岗情况散落在私聊里。",
      icon: RadarIcon
    }
  ];

  return (
    <StoryFrame
      current="/briefing"
      eyebrow="业务求助简报"
      title="先看清问题，再选择第一名鹅苗"
      description="这不是作业三的 30-60-90 学习路径，而是作业四「实习能量站」：业务部实习生成长导航智能工具。"
    >
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
          >
            <Card className="h-full border-slate-200 bg-white transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md">
              <CardHeader>
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <card.icon className="h-5 w-5" />
                </div>
                <CardTitle>{card.title}</CardTitle>
                <CardDescription className="leading-7">{card.desc}</CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        ))}
      </div>
      <Card className="mt-5 border-blue-100 bg-blue-50/70">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-7 text-blue-900">
            你的任务：作为 AI-HRBP，先选择一名新人，生成可执行的成长导航，再把导师反馈沉淀为 HRBP 可用的适岗证据。
          </p>
          <Button asChild className="shrink-0 cursor-pointer bg-[#176BFF]">
            <Link href="/profile">
              选择第一名实习生
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
  const [step, setStep] = useState(0);

  useEffect(() => {
    setDraft(profile);
  }, [profile]);

  const activeConfusion = confusionOptions.find((item) => item.value === draft.confusion) ?? confusionOptions[0];
  const formSteps = ["选择岗位", "输入姓名", "选择困惑", "选择导师", "生成导航卡"];

  const setRole = (role: StoryRole) => {
    setDraft((current) => ({
      ...current,
      avatar: role,
      role,
      mentor: defaultMentorByRole[role],
      studentId: defaultStudentByRole[role]
    }));
  };

  const canContinue =
    step === 0 ||
    (step === 1 && draft.name.trim().length > 0) ||
    step === 2 ||
    (step === 3 && draft.mentor.trim().length > 0) ||
    step === 4;

  const submitStep = () => {
    if (!canContinue) return;
    if (step < 4) {
      setStep((current) => current + 1);
      return;
    }

    updateProfile({ ...draft, name: draft.name.trim(), mentor: draft.mentor.trim() || defaultMentorByRole[draft.role] });
    router.push("/diagnosis");
  };

  return (
    <StoryFrame
      current="/profile"
      eyebrow="创建鹅苗档案"
      title={formSteps[step]}
      description="每一步只问一个问题。先把一名具体新人建档，再让 AI 生成本周导航重点。"
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <Card className="min-h-[420px]">
          <CardContent className="flex min-h-[420px] flex-col p-6">
            <div className="mb-6 flex gap-2">
              {formSteps.map((item, index) => (
                <button
                  key={item}
                  onClick={() => setStep(index)}
                  className={cn(
                    "h-2 flex-1 rounded-full transition",
                    index <= step ? "bg-blue-600" : "bg-slate-200 hover:bg-slate-300"
                  )}
                  aria-label={item}
                />
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.22 }}
                className="flex flex-1 flex-col"
              >
                {step === 0 && (
                  <SingleQuestion title="这名鹅苗属于哪个岗位方向？" desc="岗位会决定本周任务、导师检视标准和 HRBP 适岗信号。">
                    <div className="grid gap-3 sm:grid-cols-3">
                      {storyRoleOptions.map((role) => (
                        <button
                          key={role}
                          onClick={() => setRole(role)}
                          className={cn(
                            "cursor-pointer rounded-2xl border p-4 text-left transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-md",
                            draft.role === role ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-white"
                          )}
                        >
                          <RoleMark role={role} selected={draft.role === role} />
                          <p className="mt-4 font-semibold text-slate-950">{roleAvatars[role].name}</p>
                          <p className="mt-1 text-sm leading-6 text-slate-500">{roleAvatars[role].title}</p>
                        </button>
                      ))}
                    </div>
                  </SingleQuestion>
                )}

                {step === 1 && (
                  <SingleQuestion title="这名鹅苗叫什么？" desc="用中文化名即可。主线只围绕这一位新人，不一次展示 20 人。">
                    <input
                      value={draft.name}
                      onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                      className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-lg outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      placeholder="例如：苏念初"
                      autoFocus
                    />
                    {draft.name.trim() && (
                      <p className="mt-3 text-sm text-emerald-700">已创建候选档案：{draft.name.trim()}，{draft.role}方向。</p>
                    )}
                  </SingleQuestion>
                )}

                {step === 2 && (
                  <SingleQuestion title="当前最大的困惑是什么？" desc="这里不是给新人贴标签，而是把模糊求助拆成可支持的线索。">
                    <div className="grid gap-3">
                      {confusionOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setDraft((current) => ({ ...current, confusion: option.value }))}
                          className={cn(
                            "cursor-pointer rounded-2xl border p-4 text-left transition hover:border-blue-300 hover:bg-blue-50",
                            draft.confusion === option.value ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-white"
                          )}
                        >
                          <p className="font-semibold text-slate-950">{option.title}</p>
                          <p className="mt-1 text-sm leading-6 text-slate-500">{option.description}</p>
                        </button>
                      ))}
                    </div>
                  </SingleQuestion>
                )}

                {step === 3 && (
                  <SingleQuestion title="谁是本周带教导师？" desc="导师会在检查点里补充结构化反馈，HRBP 后续看到的是证据链。">
                    <div className="grid gap-3 sm:grid-cols-3">
                      {[defaultMentorByRole[draft.role], "袁知", "梁晨"].map((mentor) => (
                        <button
                          key={mentor}
                          onClick={() => setDraft((current) => ({ ...current, mentor }))}
                          className={cn(
                            "rounded-2xl border px-4 py-4 text-left text-sm font-medium transition hover:border-blue-300 hover:bg-blue-50",
                            draft.mentor === mentor ? "border-blue-400 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-700"
                          )}
                        >
                          {mentor}
                        </button>
                      ))}
                    </div>
                    <input
                      value={draft.mentor}
                      onChange={(event) => setDraft((current) => ({ ...current, mentor: event.target.value }))}
                      className="mt-4 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      placeholder="也可以手动输入导师姓名"
                    />
                  </SingleQuestion>
                )}

                {step === 4 && (
                  <SingleQuestion title="确认并生成成长导航卡" desc="AI 将把岗位、困惑和导师关系转成一条可执行的实习生成长导航。">
                    <div className="rounded-3xl border border-blue-100 bg-blue-50/70 p-5">
                      <div className="flex items-center gap-4">
                        <RoleMark role={draft.role} selected />
                        <div>
                          <p className="text-xl font-semibold text-slate-950">{draft.name || "未命名鹅苗"}</p>
                          <p className="mt-1 text-sm text-slate-600">
                            {draft.role}方向 · 导师 {draft.mentor || defaultMentorByRole[draft.role]}
                          </p>
                        </div>
                      </div>
                      <div className="mt-5 grid gap-3 sm:grid-cols-3">
                        <MiniInfo label="当前困惑" value={activeConfusion.diagnosis} />
                        <MiniInfo label="AI 处理方式" value="生成本周导航重点" />
                        <MiniInfo label="后续产出" value="适岗证据链" />
                      </div>
                    </div>
                  </SingleQuestion>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-5">
              <Button
                variant="ghost"
                onClick={() => setStep((current) => Math.max(0, current - 1))}
                disabled={step === 0}
                className="cursor-pointer"
              >
                上一步
              </Button>
              <Button onClick={submitStep} disabled={!canContinue} size="lg" className="cursor-pointer bg-[#176BFF]">
                {step === 4 ? "生成成长导航卡" : "继续"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="h-fit border-slate-200">
          <CardHeader>
            <CardTitle className="text-base">档案预览</CardTitle>
            <CardDescription>即时反馈，避免用户不知道填完了什么。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <RoleMark role={draft.role} selected />
              <div>
                <p className="font-semibold text-slate-950">{draft.name || "等待输入姓名"}</p>
                <p className="text-sm text-slate-500">{draft.role} · 导师 {draft.mentor || "待选择"}</p>
              </div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-600">
              当前困惑：{activeConfusion.title}
              <br />
              AI 将优先把它拆成「本周该做什么」「导师如何检视」「HRBP 看什么信号」。
            </div>
          </CardContent>
        </Card>
      </div>
    </StoryFrame>
  );
}

function SingleQuestion({ title, desc, children }: { title: string; desc: string; children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col justify-center">
      <p className="text-sm font-medium text-blue-600">只问一个问题</p>
      <h2 className="mt-2 text-2xl font-semibold text-slate-950">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">{desc}</p>
      <div className="mt-7">{children}</div>
    </div>
  );
}

export function DiagnosisPage() {
  const router = useRouter();
  const { profile } = useStoryProfile();
  const activeConfusion = confusionOptions.find((item) => item.value === profile.confusion) ?? confusionOptions[0];

  return (
    <StoryFrame
      current="/diagnosis"
      eyebrow="成长困惑诊断"
      title="把一句“我不知道”拆成可行动线索"
      description="AI-HRBP 不替代人判断，只把模糊困惑整理成导师可检视、HRBP 可追踪的支持线索。"
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <Card>
          <CardHeader>
            <CardTitle>{profile.name || "这名鹅苗"} 的当前诊断</CardTitle>
            <CardDescription>本页只做一件事：确认本周导航重点。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {confusionOptions.map((item) => (
              <div
                key={item.value}
                className={cn(
                  "rounded-2xl border p-4 transition",
                  item.value === activeConfusion.value ? "border-blue-300 bg-blue-50" : "border-slate-200 bg-white"
                )}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "mt-1 h-3 w-3 rounded-full",
                      item.value === activeConfusion.value ? "bg-blue-600" : "bg-slate-300"
                    )}
                  />
                  <div>
                    <p className="font-semibold text-slate-950">{item.diagnosis}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="h-fit border-amber-100 bg-amber-50/70">
          <CardHeader>
            <CardTitle className="text-base">本周导航重点</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-7 text-amber-900">
            <p>
              先不要让新人“多做一点”，而是先让 TA 完成一个可验证的小交付，再请导师给出结构化反馈。
            </p>
            <p className="font-medium">HRBP 关注：任务证据、导师反馈、行为信号是否能连成适岗证据链。</p>
            <Button onClick={() => router.push("/mission")} size="lg" className="w-full cursor-pointer bg-[#176BFF]">
              生成本周导航重点
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </StoryFrame>
  );
}

export function MissionPage() {
  const router = useRouter();
  const { profile } = useStoryProfile();
  const { student, setStudent, loading } = useStoryStudent(profile);
  const tasks = storyTasks[profile.role];
  const [selectedTaskId, setSelectedTaskId] = useState(tasks[0]?.id);
  const [expanded, setExpanded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!student) return;
    const nextTask = tasks.find((task) => !student.completedTaskIds.includes(task.id)) ?? tasks[tasks.length - 1];
    setSelectedTaskId(nextTask?.id);
  }, [student?.id, profile.role]);

  const selectedTask = tasks.find((task) => task.id === selectedTaskId) ?? tasks[0];
  const completedTasks = student ? getCompletedTasks(student) : [];
  const completed = Boolean(student?.completedTaskIds.includes(selectedTask.id));

  const submitProgress = async () => {
    if (!student || !selectedTask) return;
    setBusy(true);
    const taskResponse = await fetch(`/api/students/${student.id}/tasks`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId: selectedTask.id, completed: true })
    });
    const taskResult = (await taskResponse.json()) as { student: GrowthStudent };

    const requestResponse = await fetch("/api/feedback/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: student.id, taskId: selectedTask.id })
    });
    const requestResult = (await requestResponse.json()) as { student?: GrowthStudent };
    setStudent(requestResult.student ?? taskResult.student);
    setSubmitted(true);
    setBusy(false);
    setToast("进展已提交，导师检查点已生成");
    window.setTimeout(() => setToast(null), 2400);
  };

  if (loading || !student) {
    return (
      <StoryFrame current="/mission" eyebrow="本周成长任务" title="正在生成导航重点" description="请稍候。">
        <LoadingCard text="正在读取当前鹅苗档案..." />
      </StoryFrame>
    );
  }

  return (
    <StoryFrame
      current="/mission"
      eyebrow="本周成长任务"
      title="本周只推进一个可验证交付"
      description="任务不是普通 checklist。每张卡都对应导师检视标准和 HRBP 可见适岗信号。"
    >
      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        <Card className="h-fit">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <RoleMark role={profile.role} selected />
              <div>
                <p className="text-xl font-semibold text-slate-950">{profile.name || student.name}</p>
                <p className="text-sm text-slate-500">
                  {profile.role} · 导师 {profile.mentor}
                </p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <MiniInfo label="成长能量" value={student.energy} />
              <MiniInfo label="任务进度" value={`${student.progress}%`} />
            </div>
            <div className="mt-5 space-y-3">
              <Progress value={student.progress} />
              <div className="flex flex-wrap gap-2">
                {storyStages.map((item) => (
                  <span
                    key={item.stage}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs",
                      student.stage === item.stage ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-500"
                    )}
                  >
                    {item.mark} {item.stage}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-blue-100 bg-blue-50/60">
            <CardContent className="grid gap-4 p-5 md:grid-cols-3">
              <TaskSignal title="实习生下一步" value={selectedTask.title} tone="blue" />
              <TaskSignal title="导师下一步" value="按交付物给一次结构化反馈" tone="blue" />
              <TaskSignal title="HRBP 关注点" value="观察任务证据能否支撑适岗判断" tone="green" />
            </CardContent>
          </Card>

          <div className="grid gap-3 md:grid-cols-2">
            {tasks.map((task) => {
              const isDone = student.completedTaskIds.includes(task.id);
              const selected = task.id === selectedTask.id;
              return (
                <button
                  key={task.id}
                  onClick={() => {
                    setSelectedTaskId(task.id);
                    setExpanded(false);
                    setSubmitted(false);
                  }}
                  className={cn(
                    "cursor-pointer rounded-2xl border bg-white p-4 text-left transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-md",
                    selected && "border-blue-400 ring-4 ring-blue-50"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950">{task.title}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-500">交付物：{task.deliverable}</p>
                    </div>
                    <Badge variant={isDone ? "green" : selected ? "blue" : "default"}>{isDone ? "已完成" : selected ? "本次推进" : "待推进"}</Badge>
                  </div>
                  <div className="mt-4 grid gap-2">
                    <TaskSignal title="导师看什么" value={task.mentorSignal} tone="blue" />
                    <TaskSignal title="HRBP 看什么信号" value={task.hrbpSignal} tone="green" />
                  </div>
                </button>
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>当前选中任务：{selectedTask.title}</CardTitle>
              <CardDescription>{selectedTask.goal}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button variant="secondary" onClick={() => setExpanded((value) => !value)} className="cursor-pointer">
                  <Sparkles className="mr-2 h-4 w-4" />
                  AI 拆解步骤
                </Button>
                {!submitted ? (
                  <Button onClick={submitProgress} disabled={busy || completed} className="cursor-pointer bg-[#176BFF]">
                    {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ClipboardCheck className="mr-2 h-4 w-4" />}
                    {completed ? "该任务已完成" : "提交一次进展"}
                  </Button>
                ) : (
                  <Button onClick={() => router.push("/mentor")} className="cursor-pointer bg-[#176BFF]">
                    前往导师检查点
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="grid gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      {selectedTask.steps.map((step, index) => (
                        <div key={step} className="flex gap-3 rounded-xl bg-white p-3 text-sm text-slate-700">
                          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-blue-600 text-xs text-white">{index + 1}</span>
                          {step}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <p className="text-xs leading-6 text-slate-500">
                已完成任务：{completedTasks.map((task) => task.title).join("、") || "暂无"}。提交进展后会同步生成导师检查点。
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      <Toast message={toast} />
    </StoryFrame>
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
      title="把一次观察变成可执行反馈"
      description="本页只做一件事：输入导师观察，让 AI 整理成肯定、建议和下周行动。沟通分寸仍由导师把握。"
    >
      {loading || !student ? (
        <LoadingCard text="正在读取导师检查点..." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>当前鹅苗</CardTitle>
              <CardDescription>
                {profile.role}方向 · 导师 {profile.mentor}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <RoleMark role={profile.role} selected />
                <div>
                  <p className="text-xl font-semibold text-slate-950">{profile.name || student.name}</p>
                  <p className="text-sm text-slate-500">
                    {student.stage} · 能量 {student.energy}
                  </p>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="mb-2 text-sm font-semibold text-slate-800">已提交任务</p>
                <div className="space-y-2">
                  {(getCompletedTasks(student).length ? getCompletedTasks(student) : storyTasks[profile.role].slice(0, 1)).map((task) => (
                    <div key={task.id} className="rounded-xl bg-white p-3 text-sm text-slate-700">
                      {task.title}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>导师观察</CardTitle>
              <CardDescription>AI 只整理反馈线索，真正的信任建立仍由导师完成。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="例如：能主动提问，但需求拆解还不够深入。"
                className="min-h-[150px] bg-white text-slate-900 placeholder:text-slate-400"
              />
              {!feedback ? (
                <Button onClick={generateFeedback} disabled={busy} size="lg" className="cursor-pointer bg-[#176BFF]">
                  {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <WandSparkles className="mr-2 h-4 w-4" />}
                  生成结构化反馈
                </Button>
              ) : (
                <>
                  <div className="grid gap-3 md:grid-cols-3">
                    <FeedbackCard title="肯定" value={feedback.praise} tone="green" />
                    <FeedbackCard title="建议" value={feedback.suggestion} tone="blue" />
                    <FeedbackCard title="下周行动" value={feedback.action} tone="yellow" />
                  </div>
                  <Button onClick={() => router.push("/hrbp")} size="lg" className="cursor-pointer bg-[#176BFF]">
                    写入成长档案并通知 HRBP
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
      <Toast message={toast} />
    </StoryFrame>
  );
}

export function HrbpEvidencePage() {
  const { profile } = useStoryProfile();
  const { student, loading } = useStoryStudent(profile);

  if (loading || !student) {
    return (
      <StoryFrame current="/hrbp" eyebrow="HRBP 适岗证据链" title="正在整理适岗证据" description="请稍候。">
        <LoadingCard text="正在读取 HRBP 证据链..." />
      </StoryFrame>
    );
  }

  const riskMeta = getRiskMeta(student.riskLevel);
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
      eyebrow="HRBP 适岗证据链"
      title="让适岗判断有证据，而不是凭感觉"
      description="这是主线最适合截图的一页：HRBP 看到的是任务证据、导师证据、行为信号和下一步验证动作。"
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <Card className="border-blue-100 bg-white">
            <CardContent className="grid gap-4 p-5 md:grid-cols-[1fr_300px] md:items-center">
              <div className="flex items-center gap-4">
                <RoleMark role={profile.role} selected />
                <div>
                  <h2 className="text-2xl font-semibold text-slate-950">{profile.name || student.name}</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {profile.role}方向 · 导师 {profile.mentor} · {student.stage}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <MiniInfo label="能量" value={student.energy} />
                <MiniInfo label="进度" value={`${student.progress}%`} />
                <MiniInfo label="适岗" value={getFitAverage(student)} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>适岗证据链</CardTitle>
                  <CardDescription>把散落在私聊里的过程信息，整理成 HRBP 可沟通的证据。</CardDescription>
                </div>
                <Badge variant={riskMeta.variant}>{riskMeta.label}</Badge>
              </div>
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

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium leading-7 text-amber-900">
            AI 风险判断仅作为 HRBP 与导师沟通线索，不直接作为留用、淘汰或评价依据。
          </div>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>适岗雷达</CardTitle>
            <CardDescription>从任务、反馈和行为信号中沉淀出的初步观察。</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#CBD5E1" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "#475569", fontSize: 12 }} />
                  <Radar dataKey="value" stroke="#176BFF" fill="#176BFF" fillOpacity={0.22} />
                  <ChartTooltip contentStyle={chartTooltipStyle} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <Button asChild size="lg" className="mt-4 w-full cursor-pointer bg-[#176BFF]">
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

export function ReportPage() {
  const { profile } = useStoryProfile();
  const { student, loading } = useStoryStudent(profile);
  const [tex, setTex] = useState("");
  const [filename, setFilename] = useState("emiao-growth-report.tex");
  const [generating, setGenerating] = useState(false);
  const [activeStep, setActiveStep] = useState(-1);
  const [pdfMessage, setPdfMessage] = useState("");
  const steps = ["整理任务证据", "归纳导师反馈", "生成适岗证据链", "写入 AI 边界说明", "生成 LaTeX", "生成 PDF"];

  const generateReport = async () => {
    if (!student) return;
    setGenerating(true);
    setPdfMessage("");
    for (let index = 0; index < steps.length - 1; index += 1) {
      setActiveStep(index);
      await new Promise((resolve) => window.setTimeout(resolve, 320));
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
      description="最后输出不是一页展示，而是一份可下载的 LaTeX 源文件和 PDF fallback，适合放进作业提交材料。"
    >
      {loading || !student ? (
        <LoadingCard text="正在准备报告数据..." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <Card className="min-h-[640px]">
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
                  <ReportPreviewSection title="1. 基本信息" value={`${profile.name || student.name}｜${profile.role}方向｜导师 ${profile.mentor}｜成长能量 ${student.energy}`} />
                  <ReportPreviewSection title="2. 岗位任务完成情况" value={getCompletedTasks(student).map((task) => task.title).join("、") || "待补充任务证据"} />
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
                <Button onClick={generateReport} disabled={generating} size="lg" className="cursor-pointer bg-[#176BFF]">
                  <FileCode2 className="mr-2 h-4 w-4" />
                  生成报告
                </Button>
                <Button variant="secondary" onClick={downloadTex} disabled={!tex} className="cursor-pointer">
                  <Download className="mr-2 h-4 w-4" />
                  下载 LaTeX
                </Button>
                <Button variant="outline" onClick={downloadPdf} disabled={generating || !tex} className="cursor-pointer">
                  <Printer className="mr-2 h-4 w-4" />
                  下载 PDF
                </Button>
                <Button asChild variant="dark">
                  <Link href="/dashboard">查看高级工作台</Link>
                </Button>
              </div>
              {pdfMessage && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-900">
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

function MiniInfo({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-base font-semibold text-slate-950">{value}</p>
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
      <CardContent className="grid min-h-[280px] place-items-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-3 text-sm text-slate-600">{text}</p>
        </div>
      </CardContent>
    </Card>
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

function ReportPreviewSection({ title, value }: { title: string; value: string }) {
  return (
    <section>
      <h3 className="font-semibold text-slate-950">{title}</h3>
      <p className="mt-1">{value}</p>
    </section>
  );
}
