import { getAdminAuth } from "@/lib/firebase/admin";
import { sql } from "@/lib/db/client";

export async function getServerSession(req: Request): Promise<{
  uid: string;
  role: "student" | "teacher" | "admin";
} | null> {
  try {
    let token = "";
    let isSessionCookie = false;

    // 1. محاولة استخراج التوكن من الهيدر
    const authHeader = req.headers.get("Authorization") || "";
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    }

    // 2. إذا لم يوجد، نقرأ التوكن من الكوكي
    if (!token) {
      const cookieHeader = req.headers.get("cookie") || "";
      const match = cookieHeader.match(/__session=([^;]+)/);
      if (match) {
        token = match[1];
        isSessionCookie = true;
      }
    }

    if (!token) return null;

    const auth = getAdminAuth();
    let decoded;

    // 3. استخدام دالة التحقق الصحيحة بناءً على نوع التوكن
    if (isSessionCookie) {
      decoded = await auth.verifySessionCookie(token, true);
    } else {
      decoded = await auth.verifyIdToken(token);
    }

    if (!decoded.uid) return null;

    // 4. 🚨 الحل الجذري لمشكلة قواعد البيانات المزدوجة 🚨
    // البحث أولاً في الجدول الجديد (users)
    const [userRecord] = await sql`
      SELECT role FROM users WHERE firebase_uid = ${decoded.uid}
    `;
    
    let userRole = userRecord?.role;

    // إذا لم يجده في الجدول الجديد، نبحث في الجدول القديم (profiles) لحساب الأدمن
    if (!userRole) {
      const [profileRecord] = await sql`
        SELECT role FROM profiles WHERE firebase_uid = ${decoded.uid}
      `;
      userRole = profileRecord?.role;
    }

    return {
      uid: decoded.uid,
      role: userRole || "student", // إذا لم يجده في أي جدول، يعتبره طالب كإجراء أمني
    };
  } catch (error) {
    console.error("Session verification failed:", error);
    return null;
  }
}