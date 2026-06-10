import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sql } from "@/lib/db/client";
import { verifyIdToken } from "@/lib/firebase/server";

const applySchema = z.object({
  model_course_id: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await verifyIdToken(req);
    if (!user || user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { model_course_id } = applySchema.parse(body);

    // التحقق من أن الكورس النموذجي موجود ومعتمد
    const courseCheck = await sql.query(
      `SELECT id FROM model_courses WHERE id = $1 AND status = 'approved'`,
      [model_course_id]
    );
    if (!courseCheck || courseCheck.length === 0) {
      return NextResponse.json({ error: "Course not available" }, { status: 400 });
    }

    // التحقق من عدم وجود طلب مسبق أو كورس حي
    const existing = await sql.query(
      `SELECT id FROM teaching_applications WHERE teacher_id = $1 AND model_course_id = $2
       UNION
       SELECT id FROM live_courses WHERE teacher_id = $1 AND model_course_id = $2`,
      [user.uid, model_course_id]
    );
    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: "You have already applied or are teaching this course" },
        { status: 409 }
      );
    }

    await sql.query(
      `INSERT INTO teaching_applications (teacher_id, model_course_id) VALUES ($1, $2)`,
      [user.uid, model_course_id]
    );

    return NextResponse.json({ message: "Application submitted" }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 422 });
    }
    console.error(error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}