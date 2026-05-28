import { NextResponse } from "next/server";

import { buildLatexReport, findReportStudent } from "@/lib/report-builder";
import { getReportCache, setReportCache } from "@/lib/report-cache";

export const dynamic = "force-dynamic";

export function GET() {
  const cached = getReportCache() ?? buildLatexReport(findReportStudent());
  setReportCache(cached);

  return new NextResponse(cached.tex, {
    headers: {
      "Content-Type": "application/x-tex; charset=utf-8",
      "Content-Disposition": `attachment; filename="${cached.filename}"`
    }
  });
}
