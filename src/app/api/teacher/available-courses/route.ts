import { NextResponse } from "next/server";
import { sql } from "@/lib/db/client";
import { getServerSession } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(req);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { model_course_id } = await req.json();

  // تحقق من عدم وجود طلب سابق
  const existing = await sql`
    SELECT id FROM teaching_applications
    WHERE teacher_id = ${session.uid} AND model_course_id = ${model_course_id} AND status = 'pending'
  `;
  if (existing.length > 0) {
    return NextResponse.json({ error: "لقد قدمت طلباً بالفعل" }, { status: 400 });
  }

  try {
    await sql`
      INSERT INTO teaching_applications (teacher_id, model_course_id)
      VALUES (${session.uid}, ${model_course_id})
    `;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}