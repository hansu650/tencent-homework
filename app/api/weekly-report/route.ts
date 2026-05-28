import { NextResponse } from "next/server";

import { generateWeeklyReport } from "@/lib/demo-store";

export const dynamic = "force-dynamic";

export function POST() {
  return NextResponse.json(generateWeeklyReport());
}
