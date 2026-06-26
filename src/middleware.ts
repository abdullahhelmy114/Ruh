import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // قمنا بإيقاف الطرد الأعمى من هنا.
  // السيرفر سيسمح بالمرور، وسنعتمد كلياً على حماية (AdminLayout / TeacherLayout)
  // لأنها أدق وتفحص حالة فايربيز الحقيقية بدلاً من الاعتماد على الـ Cookies التي قد تتأخر.
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/live/:path*"],
};