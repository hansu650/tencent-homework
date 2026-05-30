import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "鹅苗成长副本 | AI Native 新人 30-60-90 路径生成器",
  description:
    "腾讯 AI-HR 培训生线上实战营作业三：为 AI Native 组织新人生成 30-60-90 学习、协作与产出计划。"
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

