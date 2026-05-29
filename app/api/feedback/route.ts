import { NextRequest, NextResponse } from "next/server";

import { createFeedback } from "@/lib/demo-store";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as
    | { studentId?: string; mentorNote?: string }
    | null;

  if (!body?.studentId) {
    return NextResponse.json({ error: "请提供 studentId。" }, { status: 400 });
  }

  const result = createFeedback(body.studentId, body.mentorNote ?? "");
  if (!result) {
    return NextResponse.json({ error: "未找到反馈对象。" }, { status: 404 });
  }

  return NextResponse.json(result);
}
