"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronLeft } from "lucide-react";
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
  sampleProfiles,
  storageKey,
  type GrowthProfile,
  type Option
} from "@/lib/growth-script";
import { cn } from "@/lib/utils";

const pageMotion = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.28 }
};

const stepQuestions = [
  {
    key: "role",
    eyebrow: "Step 1 / 5",
    title: "这名新人进入哪个岗位？",
    helper: "先选岗位，后面的 30-60-90 内容会按岗位变化。",
    options: roleOptions
  },
  {
    key: "aiLevel",
    eyebrow: "Step 2 / 5",
    title: "TA 目前的 AI 使用基础如何？",
    helper: "AI 基础决定前 30 天是补工具，还是直接进入任务共创。",
    options: aiLevelOptions
  },
  {
    key: "growthGoal",
    eyebrow: "Step 3 / 5",
    title: "这份成长副本最想帮助新人突破什么？",
    helper: "目标会影响阶段任务、交付物和验收标准。",
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

type SetupKey = (typeof stepQuestions)[number]["key"];

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
      <Link href="/" className="inline-flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#176BFF] text-sm font-semibold text-white">
          鹅
        </span>
        <span>
          <span className="block text-sm font-semibold text-slate-950">
            鹅苗成长副本
          </span>
          <span className="block text-xs text-slate-500">作业三 · 30-60-90</span>
        </span>
      </Link>
      <Badge className="border-slate-200 bg-white text-slate-600">
        AI Native 路径生成器
      </Badge>
    </header>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#F7F8FA] text-slate-950">
      <AppHeader />
      {children}
    </main>
  );
}

function SectionWrap({ children }: { children: React.ReactNode }) {
  return (
    <motion.section
      {...pageMotion}
      className="mx-auto w-full max-w-6xl px-5 pb-14 pt-5 sm:px-8 lg:pb-18"
    >
      {children}
    </motion.section>
  );
}

function applySample(profile: GrowthProfile, router?: ReturnType<typeof useRouter>) {
  const nextProfile = {
    ...profile,
    generatedAt: new Date().toISOString()
  };
  saveProfile(nextProfile);
  router?.push("/plan");
}

function QuickSamples({ onApply }: { onApply: (profile: GrowthProfile) => void }) {
  return (
    <div>
      <p className="text-sm font-medium text-slate-500">快速体验</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {sampleProfiles.map((sample) => (
          <button
            key={sample.name}
            type="button"
            onClick={() => onApply(sample.profile)}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 transition-colors hover:border-[#176BFF] hover:text-[#176BFF]"
          >
            {sample.name.replace("测试组", "")}
          </button>
        ))}
      </div>
    </div>
  );
}

export function HomePage() {
  const router = useRouter();

  return (
    <PageShell>
      <SectionWrap>
        <div className="mx-auto max-w-4xl rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <Badge className="border-[#D7E5FF] bg-[#F4F8FF] text-[#176BFF]">
            腾讯 AI-HR 实战营作业三
          </Badge>
          <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-normal text-slate-950 sm:text-5xl">
            鹅苗成长副本
          </h1>
          <p className="mt-4 text-xl font-medium text-slate-800">
            AI Native 新人 30-60-90 路径生成器
          </p>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
            选择岗位、AI 基础、成长目标和导师风格，生成一份可测试、可复盘的 30-60-90 新人成长路径。
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="bg-[#176BFF]">
              <Link href="/setup">
                开始生成
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="mt-8 border-t border-slate-200 pt-6">
            <QuickSamples onApply={(profile) => applySample(profile, router)} />
          </div>
        </div>
      </SectionWrap>
    </PageShell>
  );
}

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
        "w-full rounded-xl border bg-white p-4 text-left transition-colors hover:border-[#176BFF]",
        selected ? "border-[#176BFF] bg-[#F4F8FF]" : "border-slate-200"
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "mt-1 h-3 w-3 shrink-0 rounded-full border",
            selected ? "border-[#176BFF] bg-[#176BFF]" : "border-slate-300 bg-white"
          )}
        />
        <span>
          <span className="block text-sm font-semibold text-slate-950">
            {option.label}
          </span>
          <span className="mt-1 block text-sm leading-6 text-slate-500">
            {option.description}
          </span>
        </span>
      </div>
    </button>
  );
}

export function SetupWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<Partial<GrowthProfile>>({ role: "product" });
  const [showSamples, setShowSamples] = useState(false);
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
    applySample(completed, router);
  }

  const selectedFeedback = !isConfirmStep
    ? current.options.find((option) => option.id === readStepValue(profile, current.key))
        ?.feedback
    : "确认后会生成一份可截图、可下载、可复盘的 30-60-90 成长副本。";

  return (
    <PageShell>
      <SectionWrap>
        <div className="mx-auto max-w-4xl">
          <div className="mb-5 flex items-center justify-between gap-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => (step === 0 ? router.push("/") : setStep((value) => value - 1))}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              {step === 0 ? "返回首页" : "上一步"}
            </Button>
            <button
              type="button"
              onClick={() => setShowSamples((value) => !value)}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 transition-colors hover:border-[#176BFF] hover:text-[#176BFF]"
            >
              一键填入样例
            </button>
          </div>
          {showSamples ? (
            <div className="mb-5 rounded-xl border border-slate-200 bg-white p-3">
              <QuickSamples
                onApply={(sample) => {
                  setProfile(sample);
                  setShowSamples(false);
                  setStep(stepQuestions.length);
                }}
              />
            </div>
          ) : null}
          <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-slate-200">
            <motion.div
              className="h-full rounded-full bg-[#176BFF]"
              animate={{ width: `${percent}%` }}
              transition={{ duration: 0.25 }}
            />
          </div>
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardContent className="p-6 sm:p-8">
              <AnimatePresence mode="wait">
                {!isConfirmStep ? (
                  <motion.div
                    key={current.key}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.22 }}
                  >
                    <Badge className="border-slate-200 bg-slate-50 text-slate-600">
                      {current.eyebrow}
                    </Badge>
                    <h1 className="mt-5 text-3xl font-semibold tracking-normal text-slate-950">
                      {current.title}
                    </h1>
                    <p className="mt-3 text-base leading-7 text-slate-500">
                      {current.helper}
                    </p>
                    <div className="mt-7 grid gap-3">
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
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.22 }}
                  >
                    <Badge className="border-slate-200 bg-slate-50 text-slate-600">
                      Step 5 / 5
                    </Badge>
                    <h1 className="mt-5 text-3xl font-semibold tracking-normal text-slate-950">
                      确认生成这份成长副本
                    </h1>
                    <div className="mt-7 grid gap-3 sm:grid-cols-2">
                      {[
                        ["岗位方向", plan.role.label],
                        ["AI 基础", plan.aiLevel.label],
                        ["成长目标", plan.growthGoal.label],
                        ["导师风格", plan.mentorStyle.label]
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                          <p className="text-sm text-slate-500">{label}</p>
                          <p className="mt-1 font-semibold text-slate-950">{value}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="mt-7 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                {selectedFeedback}
              </div>
              <Button type="button" size="lg" className="mt-7 w-full bg-[#176BFF]" onClick={next}>
                {isConfirmStep ? "生成 30-60-90 成长副本" : "继续"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </SectionWrap>
    </PageShell>
  );
}

function useProfileState() {
  const [profile, setProfileState] = useState<GrowthProfile>(defaultProfile);

  useEffect(() => {
    setProfileState(getStoredProfile());
  }, []);

  function setProfile(nextProfile: GrowthProfile) {
    setProfileState(nextProfile);
    saveProfile(nextProfile);
  }

  return [profile, setProfile] as const;
}

function NativeSelect<T extends string>({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition-colors hover:border-[#176BFF] focus:border-[#176BFF]"
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function TestDataControls({
  profile,
  setProfile
}: {
  profile: GrowthProfile;
  setProfile: (profile: GrowthProfile) => void;
}) {
  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardContent className="p-5">
        <p className="text-base font-semibold text-slate-950">测试输入</p>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          切换任意条件，右侧路径会实时变化。
        </p>
        <div className="mt-4 grid gap-3">
          <NativeSelect
            label="岗位"
            value={profile.role}
            options={roleOptions}
            onChange={(role) => setProfile({ ...profile, role })}
          />
          <NativeSelect
            label="AI 基础"
            value={profile.aiLevel}
            options={aiLevelOptions}
            onChange={(aiLevel) => setProfile({ ...profile, aiLevel })}
          />
          <NativeSelect
            label="成长目标"
            value={profile.growthGoal}
            options={growthGoalOptions}
            onChange={(growthGoal) => setProfile({ ...profile, growthGoal })}
          />
          <NativeSelect
            label="导师风格"
            value={profile.mentorStyle}
            options={mentorStyleOptions}
            onChange={(mentorStyle) => setProfile({ ...profile, mentorStyle })}
          />
        </div>
        <div className="mt-4 grid gap-2">
          {sampleProfiles.map((sample) => (
            <button
              key={sample.name}
              type="button"
              onClick={() => setProfile(sample.profile)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-left text-sm text-slate-600 transition-colors hover:border-[#176BFF] hover:text-slate-950"
            >
              {sample.name}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function PlainList({
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
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
        {title}
      </p>
      <ul className="mt-2 space-y-2">
        {items.slice(0, limit).map((item) => (
          <li key={item} className="grid grid-cols-[8px_1fr] gap-3 text-sm leading-6 text-slate-700">
            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-300" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function InfoBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
        {title}
      </p>
      <p className="mt-1 text-sm leading-6 text-slate-700">{text}</p>
    </div>
  );
}

function StageCard({
  stage,
  index
}: {
  stage: ReturnType<typeof buildGrowthPlan>["stages"][number];
  index: number;
}) {
  return (
    <article className="rounded-[1.25rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#176BFF]">{stage.subtitle}</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-normal">{stage.title}</h3>
        </div>
        <span className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500">
          0{index + 1}
        </span>
      </div>
      <div className="mt-5 space-y-4">
        <InfoBlock title="目标" text={stage.goal} />
        <PlainList title="关键任务" items={stage.tasks} limit={3} />
        <InfoBlock title="交付物" text={stage.deliverable} />
        <PlainList title="导师检查点" items={stage.mentorChecks} limit={2} />
        <details className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <summary className="cursor-pointer text-sm font-medium text-slate-600">
            AI 工具建议
          </summary>
          <div className="mt-3">
            <PlainList title="建议" items={stage.tools} limit={2} />
          </div>
        </details>
      </div>
    </article>
  );
}

export function PlanPage() {
  const [profile, setProfile] = useProfileState();
  const [status, setStatus] = useState("已生成路径");
  const plan = useMemo(() => buildGrowthPlan(profile), [profile]);
  const [visiblePlan, setVisiblePlan] = useState(plan);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setVisiblePlan(plan);
      setStatus("已更新路径");
    }, 500);

    return () => window.clearTimeout(timer);
  }, [plan]);

  function updateProfile(nextProfile: GrowthProfile) {
    setStatus("正在重新生成...");
    setProfile(nextProfile);
  }

  return (
    <PageShell>
      <SectionWrap>
        <div className="mb-7">
          <Badge className="border-[#D7E5FF] bg-[#F4F8FF] text-[#176BFF]">
            可测试生成页
          </Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-normal text-slate-950 sm:text-5xl">
            30-60-90 成长副本
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            选择不同岗位和 AI 基础，观察阶段任务、交付物和导师检查点如何变化。
          </p>
        </div>
        <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
          <TestDataControls profile={profile} setProfile={updateProfile} />
          <div>
            <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-xl font-semibold tracking-normal text-slate-950">
                  已生成 30-60-90 成长副本
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {visiblePlan.role.label} · {visiblePlan.aiLevel.label} · {visiblePlan.mentorStyle.label}
                </p>
              </div>
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-sm",
                  status === "正在重新生成..."
                    ? "bg-slate-100 text-slate-500"
                    : "bg-[#ECFDF5] text-[#15803D]"
                )}
              >
                {status}
              </span>
            </div>
            <div className={cn("grid gap-5 xl:grid-cols-3", status === "正在重新生成..." && "opacity-55")}>
              {visiblePlan.stages.map((stage, index) => (
                <StageCard key={stage.id} stage={stage} index={index} />
              ))}
            </div>
          </div>
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
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-semibold tracking-normal text-slate-950 sm:text-5xl">
            导师验收卡
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            每个阶段不只看“做没做”，更看是否能理解、协作和产出。
          </p>
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {cards.map((card, index) => (
            <article
              key={card.title}
              className="rounded-[1.25rem] border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h2 className="text-xl font-semibold">{card.title}</h2>
              <PlainList title="验收问题" items={card.items} />
            </article>
          ))}
        </div>
        <div className="mt-8 flex justify-center">
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
    <article className="rounded-[1.25rem] border border-slate-200 bg-white p-6 shadow-sm print:border-none print:shadow-none">
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
          <div key={label} className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-1 text-sm font-semibold text-slate-950">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 space-y-5">
        {plan.stages.map((stage) => (
          <section key={stage.id} className="rounded-xl border border-slate-200 p-4">
            <h2 className="text-lg font-semibold">{stage.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{stage.goal}</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <PlainList title="关键任务" items={stage.tasks} />
              <PlainList title="导师检查点" items={stage.mentorChecks} />
              <InfoBlock title="交付物" text={stage.deliverable} />
              <PlainList title="AI 工具建议" items={stage.tools} />
            </div>
          </section>
        ))}
      </div>
      <section className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
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
        <PlainList title="HR 评估指标" items={metrics} />
      </section>
    </article>
  );
}

function buildReportText(profile: GrowthProfile) {
  const plan = buildGrowthPlan(profile);
  const metrics = buildEvaluationMetrics(profile);

  return [
    "《AI Native 新人 30-60-90 成长副本报告》",
    "",
    `岗位方向：${plan.role.label}`,
    `AI 基础：${plan.aiLevel.label}`,
    `成长目标：${plan.growthGoal.label}`,
    `导师风格：${plan.mentorStyle.label}`,
    "",
    ...plan.stages.flatMap((stage) => [
      stage.title,
      `目标：${stage.goal}`,
      `关键任务：${stage.tasks.join(" / ")}`,
      `交付物：${stage.deliverable}`,
      `导师检查点：${stage.mentorChecks.join(" / ")}`,
      ""
    ]),
    "HR 评估指标",
    ...metrics.map((item) => `- ${item}`),
    "",
    "AI 边界说明",
    "AI 只辅助生成学习路径、整理任务和建议检查点，不替代导师与 HR 对新人真实表现的判断。"
  ].join("\n");
}

export function ReportPage() {
  const [profile] = useProfileState();
  const [message, setMessage] = useState("报告预览已生成。");

  async function copyReport() {
    const text = buildReportText(profile);
    try {
      await navigator.clipboard.writeText(text);
      setMessage("报告内容已复制。");
    } catch {
      setMessage("当前浏览器不允许直接复制，可以手动选中报告内容复制。");
    }
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
    setMessage("请在打印窗口选择“保存为 PDF”。");
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
            <h1 className="text-3xl font-semibold tracking-normal text-slate-950 sm:text-5xl">
              成长副本报告预览
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              最终页以报告预览为主，方便检查、复制和打印保存。
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={copyReport} size="lg" className="bg-[#176BFF]">
              复制报告内容
            </Button>
            <Button onClick={downloadPdfFallback} size="lg" variant="outline">
              打印 / 保存 PDF
            </Button>
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <ReportPreview profile={profile} />
          <aside className="space-y-4 print:hidden">
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardContent className="p-5">
                <h2 className="font-semibold">导出</h2>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  默认建议复制报告内容或使用浏览器打印保存。LaTeX 作为高级导出保留。
                </p>
                {message ? (
                  <p className="mt-5 rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-600">
                    {message}
                  </p>
                ) : null}
                <button
                  type="button"
                  onClick={downloadTex}
                  className="mt-4 text-sm text-slate-500 underline underline-offset-4 transition-colors hover:text-[#176BFF]"
                >
                  高级导出：下载 LaTeX 源码
                </button>
              </CardContent>
            </Card>
            <Card className="border-slate-200 bg-white shadow-sm">
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
