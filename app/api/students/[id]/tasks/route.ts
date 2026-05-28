import { NextRequest, NextResponse } from "next/server";

import { updateStudentTask } from "@/lib/demo-store";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = (await request.json().catch(() => null)) as
    | { taskId?: string; completed?: boolean }
    | null;

  if (!body?.taskId || typeof body.completed !== "boolean") {
    return NextResponse.json(
      { error: "请提供 taskId 和 completed。" },
      { status: 400 }
    );
  }

  const result = updateStudentTask(id, body.taskId, body.completed);
  if (!result) {
    return NextResponse.json(
      { error: "未找到学生或任务。" },
      { status: 404 }
    );
  }

  return NextResponse.json(result);
}
