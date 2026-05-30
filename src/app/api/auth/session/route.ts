import { NextResponse } from "next/server";
import { getAdminApp } from "@/lib/firebase/admin";
import { getAuth } from "firebase-admin/auth";

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();
    if (!idToken) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    // التحقق من صحة الـ token باستخدام Admin SDK
    const decoded = await getAuth(getAdminApp()).verifyIdToken(idToken);

    // إنشاء كوكيز جلسة (صالحة لمدة 14 يوم)
    const sessionCookie = await getAuth(getAdminApp()).createSessionCookie(idToken, {
      expiresIn: 1000 * 60 * 60 * 24 * 14, // 14 يوم
    });

    // تعيين الكوكيز في الاستجابة
    const response = NextResponse.json({ success: true });
    response.cookies.set("__session", sessionCookie, {
      maxAge: 60 * 60 * 24 * 14,
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}