"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  Check,
  ChevronLeft,
  Download,
  FileText,
  Layers,
  PenLine,
  RefreshCw,
  Sparkles,
  Target,
  Users
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  aiLevelOptions,
  buildEvaluationMetrics,
  buildGrowthPlan,
  completeProfile,
  defaultProfile,
  growthGoalOptions,
  mentorStyleOptions,
  roleOptions,
  storageKey,
  type AiLevelId,
  type GrowthGoalId,
  type GrowthProfile,
  type MentorStyleId,
  type Option,
  type RoleId
} from "@/lib/growth-script";
import { cn } from "@/lib/utils";

const pageMotion = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45 }
};

const stepQuestions = [
  {
    key: "role",
    eyebrow: "Step 1 / 5",
    title: "这名新人进入哪个岗位？",
    helper: "先确定岗位，后面的 30-60-90 内容会随之变化。",
    options: roleOptions
  },
  {
    key: "aiLevel",
    eyebrow: "Step 2 / 5",
    title: "TA 目前的 AI 使用基础如何？",
    helper: "AI 基础决定前 30 天是先补工具，还是更快进入共创。",
    options: aiLevelOptions
  },
  {
    key: "growthGoal",
    eyebrow: "Step 3 / 5",
    title: "这份成长副本最想帮助新人突破什么？",
    helper: "目标不同，阶段任务和交付物也会不同。",
    options: growthGoalOptions
  },
  {
    key: "mentorStyle",
    eyebrow: "Step 4 / 5",
    title: "导师希望用什么方式陪伴新人？",
    helper: "导师风格会影响检查点的密度和挑战度。",
    options: mentorStyleOptions
  }
] as const;

function getStoredProfile() {
  if (typeof window === "undefined") {
    return defaultProfile;
  }

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return defaultProfile;
    }
    return completeProfile(JSON.parse(raw) as Partial<GrowthProfile>);
  } catch {
    return defaultProfile;
  }
}

function saveProfile(profile: GrowthProfile) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(storageKey, JSON.stringify(profile));
  }
}

function AppHeader() {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
      <Link href="/" className="group inline-flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#176BFF] text-sm font-bold text-white shadow-sm transition-transform group-hover:-translate-y-0.5">
          鹅
        </span>
        <span>
          <span className="block text-sm font-semibold text-slate-950">
            鹅苗成长副本
          </span>
          <span className="block text-xs text-slate-500">作业三 · 30-60-90</span>
        </span>
      </Link>
      <Badge className="border-[#D7E5FF] bg-[#EFF6FF] text-[#176BFF]">
        AI Native 路径生成器
      </Badge>
    </header>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#F7F8FA] text-slate-950">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(23,107,255,0.10),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(34,197,94,0.08),transparent_28%)]" />
      <div className="relative">
        <AppHeader />
        {children}
      </div>
    </main>
  );
}

function SectionWrap({ children }: { children: React.ReactNode }) {
  return (
    <motion.section
      {...pageMotion}
      className="mx-auto w-full max-w-6xl px-5 pb-14 pt-5 sm:px-8 lg:pb-20"
    >
      {children}
    </motion.section>
  );
}

function PhasePreview() {
  const phases = [
    { day: "30", label: "理解业务与 AI 工具" },
    { day: "60", label: "参与协作与真实任务" },
    { day: "90", label: "完成可复盘小项目" }
  ];

  return (
    <Card className="relative overflow-hidden border-slate-200 bg-white/90 p-5 shadow-xl shadow-slate-200/70">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#176BFF] via-[#4F9CFF] to-[#22C55E]" />
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">路径预览</p>
          <h3 className="mt-1 text-xl font-semibold text-slate-950">
            30 / 60 / 90 成长副本
          </h3>
        </div>
        <Sparkles className="h-5 w-5 text-[#176BFF]" />
      </div>
      <div className="space-y-4">
        {phases.map((phase, index) => (
          <div key={phase.day} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#D7E5FF] bg-[#EFF6FF] text-base font-semibold text-[#176BFF]">
                {phase.day}
              </div>
              {index < phases.length - 1 ? (
                <div className="h-10 w-px bg-slate-200" />
              ) : null}
            </div>
            <div className="min-w-0 pt-1">
              <p className="text-sm font-semibold text-slate-950">{phase.label}</p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                阶段任务、交付物、导师检查点和 AI 工具建议同步生成。
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function HomePage() {
  return (
    <PageShell>
      <SectionWrap>
        <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white/85 p-6 shadow-xl shadow-slate-200/70 backdrop-blur sm:p-10">
            <Badge className="mb-5 border-[#D7E5FF] bg-[#EFF6FF] text-[#176BFF]">
              腾讯 AI-HR 实战营作业三
            </Badge>
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-normal text-slate-950 sm:text-5xl lg:text-6xl">
              鹅苗成长副本
            </h1>
            <p className="mt-4 text-xl font-medium text-[#176BFF]">
              AI Native 新人 30-60-90 路径生成器
            </p>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              新人进入 AI Native 组织后，不只是熟悉制度和业务，更要学会使用 AI 工具、理解人机协同、完成真实产出。你将作为 HR，为一名新人生成他的 30-60-90 成长副本。
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                "30 天：理解业务与 AI 工具",
                "60 天：参与协作与真实任务",
                "90 天：完成可复盘小项目"
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700"
                >
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="group bg-[#176BFF]">
                <Link href="/setup">
                  开始生成成长副本
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/report">查看示例报告</Link>
              </Button>
            </div>
          </div>
          <PhasePreview />
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            {
              icon: Layers,
              title: "副本化成长",
              text: "把传统新人培养拆成 30/60/90 三个阶段，让路径更清楚。"
            },
            {
              icon: Users,
              title: "导师验收卡",
              text: "不只给新人任务，也给导师检查标准，帮助双方对齐。"
            },
            {
              icon: FileText,
              title: "报告化沉淀",
              text: "最终生成可提交、可复盘、可迭代的 PDF / LaTeX 报告。"
            }
          ].map((item) => (
            <Card key={item.title} className="transition-all hover:-translate-y-1 hover:shadow-lg">
              <CardContent className="p-5">
                <item.icon className="h-5 w-5 text-[#176BFF]" />
                <h3 className="mt-4 text-base font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{item.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </SectionWrap>
    </PageShell>
  );
}

type SetupKey = (typeof stepQuestions)[number]["key"];

function readStepValue(profile: Partial<GrowthProfile>, key: SetupKey) {
  return profile[key];
}

function OptionCard<T extends string>({
  option,
  selected,
  onSelect
}: {
  option: Option<T>;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group w-full rounded-2xl border bg-white p-5 text-left transition-all hover:-translate-y-0.5 hover:border-[#176BFF] hover:shadow-lg hover:shadow-blue-100",
        selected
          ? "border-[#176BFF] bg-[#F4F8FF] shadow-md shadow-blue-100"
          : "border-slate-200"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-base font-semibold text-slate-950">{option.label}</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">{option.description}</p>
        </div>
        <span
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors",
            selected
              ? "border-[#176BFF] bg-[#176BFF] text-white"
              : "border-slate-300 text-transparent group-hover:border-[#176BFF]"
          )}
        >
          <Check className="h-3.5 w-3.5" />
        </span>
      </div>
    </button>
  );
}

export function SetupWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<Partial<GrowthProfile>>({
    role: "product"
  });
  const current = stepQuestions[step];
  const isConfirmStep = step === stepQuestions.length;
  const percent = Math.round(((step + 1) / 5) * 100);
  const completed = completeProfile(profile);
  const plan = buildGrowthPlan(completed);

  function selectValue(key: SetupKey, value: string) {
    setProfile((prev) => ({
      ...prev,
      [key]: value
    }));
  }

  function next() {
    if (step < stepQuestions.length) {
      setStep((value) => value + 1);
      return;
    }
    const finalProfile = completeProfile({
      ...profile,
      generatedAt: new Date().toISOString()
    });
    saveProfile(finalProfile);
    router.push("/plan");
  }

  const selectedFeedback = !isConfirmStep
    ? current.options.find((option) => option.id === readStepValue(profile, current.key))
        ?.feedback
    : "确认后将生成 30-60-90 成长副本、导师验收卡和最终报告。";

  return (
    <PageShell>
      <SectionWrap>
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 flex items-center justify-between gap-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => (step === 0 ? router.push("/") : setStep((value) => value - 1))}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              {step === 0 ? "返回首页" : "上一步"}
            </Button>
            <span className="text-sm font-medium text-slate-500">{percent}%</span>
          </div>
          <div className="mb-8 h-2 overflow-hidden rounded-full bg-slate-200">
            <motion.div
              className="h-full rounded-full bg-[#176BFF]"
              animate={{ width: `${percent}%` }}
              transition={{ duration: 0.35 }}
            />
          </div>
          <Card className="overflow-hidden shadow-xl shadow-slate-200/70">
            <CardContent className="p-6 sm:p-8">
              <AnimatePresence mode="wait">
                {!isConfirmStep ? (
                  <motion.div
                    key={current.key}
                    initial={{ opacity: 0, x: 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -18 }}
                    transition={{ duration: 0.25 }}
                  >
                    <Badge className="border-[#D7E5FF] bg-[#EFF6FF] text-[#176BFF]">
                      {current.eyebrow}
                    </Badge>
                    <h1 className="mt-5 text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl">
                      {current.title}
                    </h1>
                    <p className="mt-3 text-base leading-7 text-slate-500">
                      {current.helper}
                    </p>
                    <div className="mt-8 grid gap-3">
                      {current.options.map((option) => (
                        <OptionCard
                          key={option.id}
                          option={option}
                          selected={readStepValue(profile, current.key) === option.id}
                          onSelect={() => selectValue(current.key, option.id)}
                        />
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="confirm"
                    initial={{ opacity: 0, x: 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -18 }}
                    transition={{ duration: 0.25 }}
                  >
                    <Badge className="border-[#D7E5FF] bg-[#EFF6FF] text-[#176BFF]">
                      Step 5 / 5
                    </Badge>
                    <h1 className="mt-5 text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl">
                      确认生成这份成长副本
                    </h1>
                    <p className="mt-3 text-base leading-7 text-slate-500">
                      系统会基于岗位、AI 基础、成长目标和导师风格，生成一份可截图、可下载、可复盘的 30-60-90 路径。
                    </p>
                    <div className="mt-8 grid gap-3 sm:grid-cols-2">
                      {[
                        ["岗位方向", plan.role.label],
                        ["AI 基础", plan.aiLevel.label],
                        ["成长目标", plan.growthGoal.label],
                        ["导师风格", plan.mentorStyle.label]
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                        >
                          <p className="text-sm text-slate-500">{label}</p>
                          <p className="mt-1 font-semibold text-slate-950">{value}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="mt-8 rounded-2xl border border-[#D7E5FF] bg-[#F4F8FF] p-4 text-sm leading-6 text-[#1D4ED8]">
                {selectedFeedback}
              </div>
              <div className="mt-8">
                <Button type="button" size="lg" className="w-full bg-[#176BFF]" onClick={next}>
                  {isConfirmStep ? "生成 30-60-90 成长副本" : "继续"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </SectionWrap>
    </PageShell>
  );
}

function useProfile() {
  const [profile, setProfile] = useState<GrowthProfile>(defaultProfile);

  useEffect(() => {
    setProfile(getStoredProfile());
  }, []);

  return profile;
}

function StageCard({ stage, index }: { stage: ReturnType<typeof buildGrowthPlan>["stages"][number]; index: number }) {
  const icons = [Target, Users, BadgeCheck];
  const Icon = icons[index] ?? Target;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.08 }}
      className="group rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-[#B9D4FF] hover:shadow-xl hover:shadow-blue-100/70"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#176BFF]">
          <Icon className="h-5 w-5" />
        </div>
        <Badge className="border-slate-200 bg-slate-50 text-slate-600">
          {stage.subtitle}
        </Badge>
      </div>
      <h3 className="mt-5 text-2xl font-semibold tracking-normal">{stage.title}</h3>
      <p className="mt-3 min-h-[72px] text-sm leading-6 text-slate-600">{stage.goal}</p>
      <div className="mt-5 space-y-4">
        <MiniList title="关键任务" items={stage.tasks} limit={3} />
        <InfoBlock title="交付物" text={stage.deliverable} />
        <MiniList title="导师检查点" items={stage.mentorChecks} limit={2} />
        <MiniList title="AI 工具建议" items={stage.tools} limit={2} />
      </div>
    </motion.article>
  );
}

function MiniList({
  title,
  items,
  limit
}: {
  title: string;
  items: string[];
  limit?: number;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
        {title}
      </p>
      <ul className="mt-2 space-y-2">
        {items.slice(0, limit).map((item) => (
          <li key={item} className="flex gap-2 text-sm leading-6 text-slate-700">
            <Check className="mt-1 h-4 w-4 shrink-0 text-[#22C55E]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function InfoBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-[#DDEBFF] bg-[#F4F8FF] p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#176BFF]">
        {title}
      </p>
      <p className="mt-1 text-sm leading-6 text-slate-700">{text}</p>
    </div>
  );
}

export function PlanPage() {
  const profile = useProfile();
  const plan = useMemo(() => buildGrowthPlan(profile), [profile]);

  return (
    <PageShell>
      <SectionWrap>
        <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <Badge className="border-[#D7E5FF] bg-[#EFF6FF] text-[#176BFF]">
              最强截图页
            </Badge>
            <h1 className="mt-4 text-3xl font-semibold tracking-normal text-slate-950 sm:text-5xl">
              你的 30-60-90 成长副本已生成
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              从入门、协作到产出，让新人逐步进入 AI Native 工作方式。
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-sm text-slate-500">当前配置</p>
            <p className="mt-1 font-semibold text-slate-950">
              {plan.role.label} · {plan.aiLevel.label} · {plan.mentorStyle.label}
            </p>
          </div>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {plan.stages.map((stage, index) => (
            <StageCard key={stage.id} stage={stage} index={index} />
          ))}
        </div>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="bg-[#176BFF]">
            <Link href="/checklist">
              生成导师验收卡
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/report">生成成长报告</Link>
          </Button>
        </div>
      </SectionWrap>
    </PageShell>
  );
}

export function ChecklistPage() {
  const cards = [
    {
      title: "30 天看融入",
      items: [
        "能否说清业务目标和团队角色",
        "能否独立使用基础 AI 工具完成信息整理",
        "能否主动提出 2-3 个有效问题"
      ]
    },
    {
      title: "60 天看协作",
      items: [
        "能否用 AI 辅助拆解一个真实任务",
        "能否和同事对齐问题、进度和交付物",
        "能否记录 AI 使用过程和反思"
      ]
    },
    {
      title: "90 天看产出",
      items: [
        "能否独立完成一个可展示的小项目",
        "能否说明项目价值、方法和风险",
        "能否形成下一阶段成长计划"
      ]
    }
  ];

  return (
    <PageShell>
      <SectionWrap>
        <div className="mx-auto max-w-4xl text-center">
          <Badge className="border-[#D7E5FF] bg-[#EFF6FF] text-[#176BFF]">
            导师验收卡
          </Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-normal text-slate-950 sm:text-5xl">
            导师如何判断新人真的成长了？
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
            每个阶段不只看“做没做”，更看是否能理解、协作和产出。
          </p>
        </div>
        <div className="mt-9 grid gap-5 lg:grid-cols-3">
          {cards.map((card, index) => (
            <motion.article
              key={card.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.08 }}
              className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-100/70"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#176BFF]">
                <PenLine className="h-5 w-5" />
              </div>
              <h2 className="mt-5 text-xl font-semibold">{card.title}</h2>
              <ul className="mt-5 space-y-3">
                {card.items.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-6 text-slate-700">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-[#22C55E]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.article>
          ))}
        </div>
        <div className="mt-9 flex justify-center">
          <Button asChild size="lg" className="bg-[#176BFF]">
            <Link href="/report">
              生成最终报告
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </SectionWrap>
    </PageShell>
  );
}

function ReportPreview({ profile }: { profile: GrowthProfile }) {
  const plan = buildGrowthPlan(profile);
  const metrics = buildEvaluationMetrics(profile);

  return (
    <article className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/80 print:border-none print:shadow-none">
      <div className="border-b border-slate-200 pb-5">
        <p className="text-sm font-semibold text-[#176BFF]">鹅苗成长副本</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">
          《AI Native 新人 30-60-90 成长副本报告》
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          这份报告用于沉淀新人三个月学习与融入计划，帮助新人、导师和 HR 对齐同一份成长路径。
        </p>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {[
          ["岗位方向", plan.role.label],
          ["AI 基础", plan.aiLevel.label],
          ["成长目标", plan.growthGoal.label],
          ["导师风格", plan.mentorStyle.label]
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-1 text-sm font-semibold text-slate-950">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 space-y-5">
        {plan.stages.map((stage) => (
          <section key={stage.id} className="rounded-2xl border border-slate-200 p-4">
            <h2 className="text-lg font-semibold">{stage.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{stage.goal}</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <MiniList title="关键任务" items={stage.tasks} />
              <MiniList title="导师检查点" items={stage.mentorChecks} />
              <InfoBlock title="交付物" text={stage.deliverable} />
              <MiniList title="AI 工具建议" items={stage.tools} />
            </div>
          </section>
        ))}
      </div>
      <section className="mt-5 rounded-2xl border border-[#DDEBFF] bg-[#F4F8FF] p-4">
        <h2 className="text-lg font-semibold text-slate-950">AI 边界说明</h2>
        <p className="mt-2 text-sm leading-7 text-slate-700">
          AI 只辅助生成学习路径、整理任务和建议检查点，不替代导师与 HR 对新人真实表现的判断。
        </p>
      </section>
      <section className="mt-5 grid gap-4 md:grid-cols-2">
        <InfoBlock
          title="课程内容映射"
          text="创意型、分析型、沟通型、技术应用型 HR 在同一份生成器中形成闭环。"
        />
        <InfoBlock
          title="腾讯文化映射"
          text="用户为本、科技向善、正直、进取、协作、创造自然融入路径设计。"
        />
      </section>
      <section className="mt-5">
        <MiniList title="HR 评估指标" items={metrics} />
      </section>
    </article>
  );
}

const loadingSteps = [
  "正在分析岗位",
  "正在生成 30 天任务",
  "正在生成 60 天协作计划",
  "正在生成 90 天产出目标",
  "正在生成导师验收卡"
];

export function ReportPage() {
  const profile = useProfile();
  const [isGenerating, setIsGenerating] = useState(false);
  const [doneSteps, setDoneSteps] = useState<string[]>(loadingSteps);
  const [message, setMessage] = useState("报告已准备好，可以下载或打印保存为 PDF。");

  async function generateReport() {
    setIsGenerating(true);
    setDoneSteps([]);
    setMessage("");
    for (const step of loadingSteps) {
      await new Promise((resolve) => setTimeout(resolve, 520));
      setDoneSteps((current) => [...current, step]);
    }
    setIsGenerating(false);
    setMessage("报告已重新生成。");
  }

  async function downloadTex() {
    setMessage("正在生成 LaTeX 源码...");
    const response = await fetch("/api/report/latex", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile })
    });
    const data = (await response.json()) as { tex: string; filename: string };
    const blob = new Blob([data.tex], { type: "application/x-tex;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = data.filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setMessage("LaTeX 源码已下载。");
  }

  async function downloadPdfFallback() {
    setMessage("Demo 环境将使用浏览器打印保存 PDF。");
    await fetch("/api/report/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile })
    });
    window.setTimeout(() => window.print(), 200);
  }

  return (
    <PageShell>
      <SectionWrap>
        <div className="mb-7 flex flex-col justify-between gap-5 lg:flex-row lg:items-end print:hidden">
          <div>
            <Badge className="border-[#D7E5FF] bg-[#EFF6FF] text-[#176BFF]">
              最终成果
            </Badge>
            <h1 className="mt-4 text-3xl font-semibold tracking-normal text-slate-950 sm:text-5xl">
              《AI Native 新人 30-60-90 成长副本报告》
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              形成能提交、能截图、能下载的学习路径成果。
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={generateReport} size="lg" className="bg-[#176BFF]" disabled={isGenerating}>
              {isGenerating ? "生成中..." : "重新生成"}
              <RefreshCw className={cn("ml-2 h-4 w-4", isGenerating && "animate-spin")} />
            </Button>
            <Button onClick={downloadTex} size="lg" variant="outline">
              下载 LaTeX 源码
              <Download className="ml-2 h-4 w-4" />
            </Button>
            <Button onClick={downloadPdfFallback} size="lg" variant="outline">
              下载 PDF
              <Download className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <ReportPreview profile={profile} />
          <aside className="space-y-4 print:hidden">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <Bot className="h-5 w-5 text-[#176BFF]" />
                  <h2 className="font-semibold">生成步骤</h2>
                </div>
                <div className="mt-5 space-y-3">
                  {loadingSteps.map((step) => {
                    const done = doneSteps.includes(step);
                    return (
                      <div key={step} className="flex items-center gap-3 text-sm">
                        <span
                          className={cn(
                            "flex h-6 w-6 items-center justify-center rounded-full border",
                            done
                              ? "border-[#22C55E] bg-[#ECFDF5] text-[#16A34A]"
                              : "border-slate-200 bg-slate-50 text-slate-300"
                          )}
                        >
                          <Check className="h-3.5 w-3.5" />
                        </span>
                        <span className={done ? "text-slate-700" : "text-slate-400"}>
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {message ? (
                  <p className="mt-5 rounded-2xl bg-slate-50 p-3 text-sm leading-6 text-slate-600">
                    {message}
                  </p>
                ) : null}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-3 p-5">
                <Button asChild variant="outline" className="w-full">
                  <Link href="/setup">返回修改输入</Link>
                </Button>
                <Button asChild variant="ghost" className="w-full">
                  <Link href="/plan">返回成长副本</Link>
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </SectionWrap>
    </PageShell>
  );
}
