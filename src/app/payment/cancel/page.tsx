export default function CancelPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="bg-card p-10 rounded-2xl shadow-lg text-center max-w-md border border-border">
        <h1 className="text-3xl font-bold text-foreground mb-4">تم الإلغاء</h1>
        <p className="text-muted-foreground">يمكنك المحاولة مرة أخرى في أي وقت.</p>
      </div>
    </div>
  );
}