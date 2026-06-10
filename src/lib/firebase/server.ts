import { admin } from "./admin"; // تأكد من وجود هذا التصدير

export async function verifyIdToken(req: Request) {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!token) {
    // إذا لم يوجد توكن، ربما استخدمنا middleware لإضافة userId في الهيدر
    const userId = req.headers.get("x-user-id");
    const role = req.headers.get("x-user-role");
    if (userId && role) return { uid: userId, role };
    return null;
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    return { uid: decoded.uid, role: decoded.role || "teacher" }; // يمكن إضافة role من custom claims
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}