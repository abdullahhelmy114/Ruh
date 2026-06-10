import admin from "firebase-admin";
import { getApps } from "firebase-admin/app";

if (!getApps().length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

export { admin };

/**
 * دالة مساعدة للحصول على تطبيق Firebase Admin المُهيّأ
 * تُستخدم في routes التي تحتاج تمرير app إلى getAuth(app)
 */
export function getAdminApp() {
  return admin.app();
}