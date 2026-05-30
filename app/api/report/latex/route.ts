import { NextRequest, NextResponse } from "next/server";

import { buildLatexReport, reportFilename } from "@/lib/report-builder";
import { completeProfile, type GrowthProfile } from "@/lib/growth-script";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as
    | { profile?: Partial<GrowthProfile> }
    | null;
  const profile = completeProfile(body?.profile ?? {});

  return NextResponse.json({
    tex: buildLatexReport(profile),
    filename: reportFilename(profile)
  });
}

