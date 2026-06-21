import { getAdminAuth } from "@/lib/firebase/admin";
import { sql } from "@/lib/db/client";

export async function getServerSession(req: Request): Promise<{
  uid: string;
  role: "student" | "teacher" | "admin";
} | null> {
  try {
    let idToken = "";

    // 1. محاولة استخراج التوكن من هيدر Authorization (للتوافق)
    const authHeader = req.headers.get("Authorization") || "";
    if (authHeader.startsWith("Bearer ")) {
      idToken = authHeader.slice(7);
    }

    // 2. إذا لم يوجد، نقرأ التوكن من الكوكيز (Cookie __session)
    if (!idToken) {
      const cookieHeader = req.headers.get("cookie") || "";
      const match = cookieHeader.match(/__session=([^;]+)/);
      if (match) {
        idToken = match[1];
      }
    }

    // لا توكن → لا جلسة
    if (!idToken) return null;

    const auth = getAdminAuth();
    const decoded = await auth.verifyIdToken(idToken);
    if (!decoded.uid) return null;

    // جلب الدور من جدول profiles
    const [profile] = await sql`
      SELECT role FROM profiles WHERE firebase_uid = ${decoded.uid}
    `;

    return {
      uid: decoded.uid,
      role: profile?.role || "student",
    };
  } catch {
    return null;
  }
}