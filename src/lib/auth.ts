// src/lib/auth.ts
import { getAuth } from "firebase-admin/auth";
import { getAdminApp } from "@/lib/firebase/admin";
import { sql } from "@/lib/db/client";

// تأكد من تهيئة تطبيق Firebase Admin
getAdminApp();

export async function getServerSession(req: Request): Promise<{
  uid: string;
  role: "student" | "teacher" | "admin";
} | null> {
  try {
    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader.startsWith("Bearer ")) return null;

    const idToken = authHeader.slice(7);
    const decoded = await getAuth().verifyIdToken(idToken);
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