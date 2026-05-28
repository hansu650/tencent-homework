import { NextRequest, NextResponse } from "next/server";

import { requestMentorFeedback } from "@/lib/demo-store";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as
    | { studentId?: string; taskId?: string }
    | null;

  if (!body?.studentId || !body.taskId) {
    return NextResponse.json(
      { error: "请提供 studentId 和 taskId。" },
      { status: 400 }
    );
  }

  const result = requestMentorFeedback(body.studentId, body.taskId);
  if (!result) {
    return NextResponse.json(
      { error: "未找到学生或任务。" },
      { status: 404 }
    );
  }

  return NextResponse.json(result);
}
