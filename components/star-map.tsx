"use client";

import { motion } from "framer-motion";
import { BrainCircuit } from "lucide-react";

const points = [
  { x: 80, y: 72, status: "green" },
  { x: 132, y: 45, status: "blue" },
  { x: 211, y: 58, status: "green" },
  { x: 306, y: 72, status: "yellow" },
  { x: 356, y: 122, status: "blue" },
  { x: 343, y: 196, status: "green" },
  { x: 372, y: 278, status: "red" },
  { x: 298, y: 340, status: "green" },
  { x: 221, y: 366, status: "blue" },
  { x: 139, y: 344, status: "green" },
  { x: 72, y: 292, status: "yellow" },
  { x: 48, y: 205, status: "blue" },
  { x: 94, y: 151, status: "green" },
  { x: 165, y: 116, status: "blue" },
  { x: 257, y: 111, status: "green" },
  { x: 295, y: 172, status: "yellow" },
  { x: 262, y: 262, status: "blue" },
  { x: 185, y: 296, status: "green" },
  { x: 116, y: 246, status: "red" },
  { x: 177, y: 205, status: "blue" }
];

const statusColor = {
  blue: "#00C2FF",
  green: "#22C55E",
  yellow: "#F59E0B",
  red: "#EF4444"
} as const;

export function StarMap() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[520px] rounded-2xl border border-white/10 bg-[#06111F]/70 p-4 shadow-glow backdrop-blur-xl">
      <div className="absolute inset-0 grid-pattern opacity-80" />
      <div className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/15 blur-3xl" />
      <svg
        viewBox="0 0 420 420"
        className="relative z-10 h-full w-full overflow-visible"
        aria-label="20 位实习生与 AI 节点组成的成长星图"
      >
        <defs>
          <linearGradient id="lineGradient" x1="0" x2="1" y1="0" y2="1">
            <stop stopColor="#00C2FF" stopOpacity="0.2" />
            <stop offset="1" stopColor="#1664FF" stopOpacity="0.95" />
          </linearGradient>
        </defs>
        <motion.circle
          cx="210"
          cy="210"
          r="126"
          fill="none"
          stroke="rgba(255,255,255,0.13)"
          strokeDasharray="5 12"
          animate={{ rotate: 360 }}
          transition={{ duration: 36, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "210px 210px" }}
        />
        <motion.circle
          cx="210"
          cy="210"
          r="84"
          fill="none"
          stroke="rgba(0,194,255,0.2)"
          strokeDasharray="2 8"
          animate={{ rotate: -360 }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "210px 210px" }}
        />
        {points.map((point, index) => (
          <motion.line
            key={`${point.x}-${point.y}`}
            x1="210"
            y1="210"
            x2={point.x}
            y2={point.y}
            stroke="url(#lineGradient)"
            strokeWidth="1.2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [0.25, 0.75, 0.35] }}
            transition={{
              delay: index * 0.04,
              duration: 1.4,
              repeat: Infinity,
              repeatDelay: 5,
              ease: "easeInOut"
            }}
          />
        ))}
        {points.map((point, index) => (
          <motion.g
            key={`${point.x}-${point.y}-dot`}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 + index * 0.03, duration: 0.45 }}
          >
            <circle
              cx={point.x}
              cy={point.y}
              r="9"
              fill={statusColor[point.status as keyof typeof statusColor]}
              opacity="0.18"
            />
            <motion.circle
              cx={point.x}
              cy={point.y}
              r="4.5"
              fill={statusColor[point.status as keyof typeof statusColor]}
              animate={{ opacity: [0.75, 1, 0.75] }}
              transition={{ duration: 2.4, repeat: Infinity, delay: index * 0.1 }}
            />
          </motion.g>
        ))}
      </svg>
      <div className="absolute left-1/2 top-1/2 z-20 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-cyan-300/30 bg-[#07111F]/80 text-center shadow-glow backdrop-blur-xl">
        <BrainCircuit className="mb-1 h-7 w-7 text-cyan-200" />
        <span className="text-sm font-semibold text-white">AI 节点</span>
        <span className="text-[11px] text-slate-300">任务 · 反馈 · 风险</span>
      </div>
      <div className="absolute bottom-5 left-5 right-5 z-20 grid grid-cols-3 gap-2 text-xs text-slate-300">
        <div className="rounded-lg bg-white/[0.08] px-3 py-2">20 位实习生</div>
        <div className="rounded-lg bg-white/[0.08] px-3 py-2">5 个成长阶段</div>
        <div className="rounded-lg bg-white/[0.08] px-3 py-2">4 类风险信号</div>
      </div>
    </div>
  );
}
