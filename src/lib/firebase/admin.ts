import { initializeApp, getApps, cert } from "firebase-admin/app";

const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_KEY || "{}");

export function getAdminApp() {
  if (!getApps().length) {
    initializeApp({
      credential: cert(serviceAccount),
    });
  }
  return getApps()[0];
}