import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  return NextResponse.json({
    ok: false,
    fallback: "print",
    message:
      "当前 Demo 使用浏览器打印保存 PDF 作为稳定 fallback。真实部署可接入 @react-pdf/renderer、Playwright HTML-to-PDF 或 tectonic / latexmk 编译服务。"
  });
}

