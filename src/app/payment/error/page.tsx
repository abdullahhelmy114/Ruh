import Link from 'next/link';

export default function ErrorPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="bg-card p-10 rounded-2xl shadow-lg text-center max-w-md border border-border">
        <h1 className="text-3xl font-bold text-destructive mb-4">حدث خطأ</h1>
        <p className="text-muted-foreground mb-6">لم نتمكن من إتمام العملية.</p>
        <Link href="/" className="text-primary hover:underline">العودة للصفحة الرئيسية</Link>
      </div>
    </div>
  );
}