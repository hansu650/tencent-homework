import { NextResponse } from "next/server";

import { resetDemoStore } from "@/lib/demo-store";

export const dynamic = "force-dynamic";

export function POST() {
  return NextResponse.json(resetDemoStore());
}
