import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-serif">404</h1>
        <p className="mt-2 text-muted-foreground">الصفحة غير موجودة</p>
        <Link href="/" className="mt-4 inline-block text-amber-600 hover:underline">
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}