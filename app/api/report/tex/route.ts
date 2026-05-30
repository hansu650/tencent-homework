import { NextResponse } from "next/server";

import { buildLatexReport, reportFilename } from "@/lib/report-builder";
import { defaultProfile } from "@/lib/growth-script";

export const dynamic = "force-dynamic";

export function GET() {
  const filename = reportFilename(defaultProfile);

  return new NextResponse(buildLatexReport(defaultProfile), {
    headers: {
      "Content-Type": "application/x-tex; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`
    }
  });
}

