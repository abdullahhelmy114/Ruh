import { NextResponse } from "next/server";
import { sql } from "@/lib/db/client";
import { getServerSession } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(req);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const applications = await sql`
    SELECT
      ta.id,
      ta.status,
      ta.applied_at,
      mc.title AS course_title,
      mc.category,
      mc.level,
      prof.full_name AS teacher_name,
      prof.email AS teacher_email
    FROM teaching_applications ta
    JOIN model_courses mc ON ta.model_course_id = mc.id
    JOIN profiles prof ON ta.teacher_id = prof.id
    WHERE ta.status = 'pending'
    ORDER BY ta.applied_at ASC
  `;
  return NextResponse.json(applications);
}