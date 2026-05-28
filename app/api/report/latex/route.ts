import { NextRequest, NextResponse } from "next/server";

import { buildLatexReport, findReportStudent } from "@/lib/report-builder";
import { setReportCache } from "@/lib/report-cache";
import type { StoryProfile } from "@/lib/story-content";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as
    | { studentId?: string; profile?: Partial<StoryProfile> }
    | null;
  const student = findReportStudent(body?.studentId);
  const report = buildLatexReport(student, body?.profile);
  setReportCache(report);

  return NextResponse.json(report);
}
