// app/api/teacher/live-courses/[id]/route.ts
import { NextResponse } from "next/server";
import { sql } from "@/lib/db/client";
import { getServerSession } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(req);
  if (!session || session.role !== "teacher") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const courseId = params.id;

  const [course] = await sql`
    SELECT
      lc.*,
      COALESCE(
        json_agg(
          json_build_object('scheduled_at', ls.scheduled_at)
        ) FILTER (WHERE ls.id IS NOT NULL),
        '[]'
      ) AS lessons
    FROM live_courses lc
    LEFT JOIN lessons ls ON ls.live_course_id = lc.id
    WHERE lc.id = ${courseId} AND lc.teacher_id = ${session.uid}
    GROUP BY lc.id
  `;

  if (!course) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(course);
}