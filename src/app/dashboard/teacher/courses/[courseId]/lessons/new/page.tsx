"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/firebase/AuthProvider";
import { CalendarPicker } from "@/components/dashboard/CalendarPicker";
import { TimeSlotPicker } from "@/components/dashboard/TimeSlotPicker";
import { Loader2, Clock, Calendar, Video, FileText, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface LiveCourse {
  id: string;
  created_at: string;
  lessons: { scheduled_at: string }[];
}

export default function NewLessonPage() {
  const { user, isLoading, role } = useAuth();
  const router = useRouter();
  const params = useParams<{ courseId: string }>();

  const [title, setTitle] = useState("");
  const [type, setType] = useState<"zoom" | "recorded">("recorded");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [scenarioText, setScenarioText] = useState("[]");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [liveCourse, setLiveCourse] = useState<LiveCourse | null>(null);
  const [loadingCourse, setLoadingCourse] = useState(true);

  // جلب معلومات الكورس الحي لحساب القيود
  useEffect(() => {
    async function fetchLiveCourse() {
      try {
        const res = await fetch(`/api/teacher/live-courses/${params.courseId}`);
        if (res.ok) {
          const data = await res.json();
          setLiveCourse(data);
        } else {
          toast.error("تعذر تحميل بيانات الكورس الحي");
        }
      } catch {
        toast.error("خطأ في الاتصال");
      } finally {
        setLoadingCourse(false);
      }
    }
    if (params.courseId && user) fetchLiveCourse();
  }, [params.courseId, user]);

  if (isLoading || loadingCourse) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto" /></div>;
  if (!user) { router.push("/login"); return null; }
  if (role !== "teacher" && role !== "admin") { router.push("/"); return null; }

  // حساب الحد الأدنى للتاريخ
  const today = new Date();
  let minDate: Date;
  if (liveCourse) {
    const lessons = liveCourse.lessons || [];
    if (lessons.length === 0) {
      // أول درس: بعد 7 أيام من إنشاء الكورس الحي
      minDate = new Date(liveCourse.created_at);
      minDate.setDate(minDate.getDate() + 7);
    } else {
      // الدروس التالية: بعد يومين من آخر درس
      const lastLesson = lessons[lessons.length - 1];
      minDate = new Date(lastLesson.scheduled_at);
      minDate.setDate(minDate.getDate() + 2);
    }
    // لا يمكن أن يكون أقل من اليوم + 7 أو +2 حسب الحالة، لكن نتأكد من عدم تجاوز اليوم
    if (minDate < today) minDate = today;
  } else {
    // إذا تعذر جلب الكورس، نسمح بأي تاريخ (أو نمنع)
    minDate = today;
  }

  const handleSubmit = async () => {
    if (!title.trim()) { setError("عنوان الدرس مطلوب"); return; }
    if (type === "zoom") {
      if (!selectedDate || !selectedTime) { setError("يرجى اختيار التاريخ والوقت للحصة المباشرة"); return; }
    }

    let scenario;
    try {
      scenario = JSON.parse(scenarioText);
    } catch {
      setError("صيغة السيناريو (JSON) غير صحيحة");
      return;
    }

    setSaving(true);
    setError("");

    const scheduledAt = type === "zoom"
      ? new Date(`${selectedDate!.toDateString()} ${selectedTime}`).toISOString()
      : null;

    const res = await fetch(`/api/teacher/courses/${params.courseId}/lessons`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        scheduled_at: scheduledAt,
        scenario,
        title, // إذا أردت الاحتفاظ بالعنوان
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      setError(err.error || "فشل إنشاء الدرس");
      setSaving(false);
      return;
    }

    toast.success("تم إنشاء الدرس بنجاح");
    router.push(`/dashboard/teacher/courses/${params.courseId}`);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-6 md:p-8 space-y-6">
        <div>
          <h1 className="font-serif text-2xl">إضافة حصة جديدة</h1>
          <p className="text-sm text-muted-foreground mt-1">أضف محتوى إلى الكورس الحي</p>
        </div>

        {/* القيود الزمنية */}
        {liveCourse && (
          <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800 flex items-start gap-2">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <div>
              {liveCourse.lessons?.length === 0 ? (
                <p>يجب أن تكون الحصة الأولى <strong>Zoom</strong>، وأقرب موعد مسموح هو بعد 7 أيام من تاريخ إنشاء الكورس الحي.</p>
              ) : (
                <p>يجب أن يكون بين كل حصتين <strong>يومان على الأقل</strong>.</p>
              )}
              <p className="mt-1">الحد الأدنى للتاريخ: {minDate.toLocaleDateString("ar-EG")}</p>
            </div>
          </div>
        )}

        {/* عنوان الدرس */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">عنوان الدرس</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="مثال: مقدمة في النحو العربي"
            className="mt-1 w-full rounded-2xl border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gold"
          />
        </div>

        {/* مبدل النوع */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">نوع الدرس</label>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <button
              onClick={() => setType("recorded")}
              className={`flex items-center gap-2 justify-center rounded-2xl border p-3 text-sm font-medium transition ${
                type === "recorded" ? "bg-emerald text-white border-emerald" : "bg-card hover:bg-accent"
              }`}
            >
              <FileText size={16} /> مسجل
            </button>
            <button
              onClick={() => setType("zoom")}
              className={`flex items-center gap-2 justify-center rounded-2xl border p-3 text-sm font-medium transition ${
                type === "zoom" ? "bg-emerald text-white border-emerald" : "bg-card hover:bg-accent"
              }`}
            >
              <Video size={16} /> مباشر (Zoom)
            </button>
          </div>
        </div>

        {/* محدد التاريخ والوقت (فقط إذا Zoom) */}
        {type === "zoom" && (
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                <Calendar size={14} /> تاريخ الحصة
              </label>
              <CalendarPicker selected={selectedDate} onChange={setSelectedDate} minDate={minDate} />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                <Clock size={14} /> وقت الحصة
              </label>
              <TimeSlotPicker selected={selectedTime} onChange={setSelectedTime} date={selectedDate} />
            </div>
          </div>
        )}

        {/* سيناريو الدرس */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">سيناريو الدرس (JSON)</label>
          <textarea
            value={scenarioText}
            onChange={(e) => setScenarioText(e.target.value)}
            rows={6}
            placeholder='[{"step": "تحية الطالب", "type": "text"}, {"step": "عرض فيديو", "type": "video", "url": "..."}]'
            className="mt-1 w-full rounded-2xl border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gold font-mono"
          />
          <p className="text-xs text-muted-foreground mt-1">
            استخدم JSON لوصف خطوات الدرس (نص، فيديو، صورة...)
          </p>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="w-full rounded-full bg-linear-to-r from-emerald-600 to-emerald-700 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {saving ? <Loader2 size={16} className="animate-spin mx-auto" /> : "تقديم للمراجعة"}
        </button>
      </motion.div>
    </div>
  );
}