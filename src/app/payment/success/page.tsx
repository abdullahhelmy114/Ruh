import Link from 'next/link';

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="bg-card p-10 rounded-2xl shadow-lg text-center max-w-md border border-border">
        <h1 className="text-3xl font-bold text-foreground mb-4">تم الدفع بنجاح!</h1>
        <p className="text-muted-foreground mb-6">شكراً لثقتك، يمكنك الآن الوصول إلى محتواك.</p>
        <Link href="/dashboard/student/courses" className="text-primary hover:underline">
          الذهاب إلى كورساتي
        </Link>
      </div>
    </div>
  );
}