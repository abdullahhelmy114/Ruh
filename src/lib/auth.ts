import { getAdminAuth } from "@/lib/firebase/admin";
import { sql } from "@/lib/db/client";

export async function getServerSession(req: Request): Promise<{
  uid: string;
  role: "student" | "teacher" | "admin";
} | null> {
  try {
    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader.startsWith("Bearer ")) return null;

    const idToken = authHeader.slice(7);
    const auth = getAdminAuth(); // التهيئة الكسولة هنا عند أول استدعاء فعلي
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