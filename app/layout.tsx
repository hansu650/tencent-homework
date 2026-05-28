import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "鹅苗星图 Emiao Growth Map",
  description: "AI 实习生成长导航看板，用 AI 连接任务、反馈、风险和适岗信号。"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
