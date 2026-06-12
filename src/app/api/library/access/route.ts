// app/api/library/access/route.ts
import { NextResponse } from "next/server";
import { sql } from "@/lib/db/client";
import { getServerSession } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await getServerSession(req);

  // إذا لم يسجل الدخول
  if (!session) {
    return NextResponse.json({ hasAccess: false, reason: "login" });
  }

  // الأدمن دائمًا لديه صلاحية
  if (session.role === "admin") {
    return NextResponse.json({ hasAccess: true });
  }

  // تحقق من وجود اشتراك نشط
  const [subscription] = await sql`
    SELECT id FROM subscriptions
    WHERE user_id = ${session.uid}
    AND status = 'active'
    AND (expires_at IS NULL OR expires_at > now())
    LIMIT 1
  `;

  if (subscription) {
    return NextResponse.json({ hasAccess: true });
  }

  // لا يوجد اشتراك نشط
  return NextResponse.json({ hasAccess: false, reason: "no_subscription" });
}