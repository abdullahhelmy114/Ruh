import { NextResponse } from "next/server";
import { sql } from "@/lib/db/client";
import { getServerSession } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(req);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { application_id } = await req.json();

  try {
    // جلب بيانات الطلب
    const [app] = await sql`
      SELECT ta.teacher_id, ta.model_course_id
      FROM teaching_applications ta
      WHERE ta.id = ${application_id} AND ta.status = 'pending'
    `;
    if (!app) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // جلب بيانات الكورس النموذجي
    const [model] = await sql`
      SELECT * FROM model_courses WHERE id = ${app.model_course_id}
    `;
    if (!model) {
      return NextResponse.json({ error: "Model course not found" }, { status: 404 });
    }

    // إنشاء كورس حي
    await sql`
      INSERT INTO live_courses (model_course_id, teacher_id, title, category, level, price, scenario)
      VALUES (
        ${model.id},
        ${app.teacher_id},
        ${model.title},
        ${model.category},
        ${model.level},
        ${model.price},
        ${model.scenario}
      )
    `;

    // تحديث حالة الطلب
    await sql`
      UPDATE teaching_applications SET status = 'approved' WHERE id = ${application_id}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}