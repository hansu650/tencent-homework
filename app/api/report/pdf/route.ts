import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

import { NextRequest, NextResponse } from "next/server";

import { buildLatexReport, findReportStudent } from "@/lib/report-builder";
import { getReportCache, setReportCache } from "@/lib/report-cache";
import type { StoryProfile } from "@/lib/story-content";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as
    | { studentId?: string; profile?: Partial<StoryProfile> }
    | null;
  const cached = getReportCache() ?? buildLatexReport(findReportStudent(body?.studentId), body?.profile);
  setReportCache(cached);

  try {
    const tempDir = mkdtempSync(join(tmpdir(), "emiao-latex-"));
    const texPath = join(tempDir, cached.filename);
    const pdfPath = texPath.replace(/\.tex$/, ".pdf");
    writeFileSync(texPath, cached.tex, "utf8");

    const result = spawnSync("tectonic", [texPath, "--outdir", tempDir], {
      encoding: "utf8",
      timeout: 20_000
    });

    if (result.status === 0) {
      const pdf = readFileSync(pdfPath);
      return NextResponse.json({
        ok: true,
        filename: cached.filename.replace(/\.tex$/, ".pdf"),
        pdfBase64: pdf.toString("base64")
      });
    }
  } catch {
    // Falls through to demo fallback below.
  }

  return NextResponse.json({
    ok: false,
    filename: cached.filename,
    fallback: "print",
    message:
      "Demo 环境未检测到可用 LaTeX 编译器。你仍可下载 LaTeX 源文件，或使用浏览器打印为 PDF；真实部署可接入 tectonic / latexmk 编译服务。"
  });
}
