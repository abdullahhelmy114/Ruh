import { NextResponse } from "next/server";
import { getAdminApp } from "@/lib/firebase/admin";
import { getAuth } from "firebase-admin/auth";

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();
    if (!idToken) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const decoded = await getAuth(getAdminApp()).verifyIdToken(idToken);
    const sessionCookie = await getAuth(getAdminApp()).createSessionCookie(idToken, {
      expiresIn: 1000 * 60 * 60 * 24 * 14,
    });

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