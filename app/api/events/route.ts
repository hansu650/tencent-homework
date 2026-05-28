import { NextResponse } from "next/server";

import { getEvents } from "@/lib/demo-store";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    events: getEvents()
  });
}
