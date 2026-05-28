import { NextResponse } from "next/server";

import { getDashboardMetrics, getStudents } from "@/lib/demo-store";

export const dynamic = "force-dynamic";

export function GET() {
  const students = getStudents();

  return NextResponse.json({
    students,
    metrics: getDashboardMetrics(students)
  });
}
