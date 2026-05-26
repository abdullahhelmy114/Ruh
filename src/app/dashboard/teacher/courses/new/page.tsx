"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/firebase/AuthProvider";
import { CalendarPicker } from "@/components/dashboard/CalendarPicker";
import { TimeSlotPicker } from "@/components/dashboard/TimeSlotPicker";
import { Loader2, Clock, Calendar, Video, FileText } from "lucide-react";
import { motion } from "framer-motion";

export default function NewLessonPage() {
  const { user, isLoading, role } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId"); // قراءة courseId من الرابط

  const [title, setTitle] = useState("");
  const [type, setType] = useState<"zoom" | "recorded">("recorded");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (isLoading) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto" /></div>;
  if (!user) { router.push("/login"); return null; }
  if (role !== "teacher" && role !== "admin") { router.push("/"); return null; }

  const today = new Date();
  const minDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  const handleSubmit = async () => {
    if (!courseId) {
      setError("الرجاء تحديد الكورس أولاً عبر الرابط ?courseId=...");
      return;
    }
    if (!title.trim()) { setError("Lesson title is required"); return; }
    if (type === "zoom") {
      if (!selectedDate || !selectedTime) { setError("Please select date and time for live session"); return; }
    }
    setSaving(true);
    setError("");

    const res = await fetch("/api/lessons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseId,
        title,
        type,
        scheduledAt: type === "zoom" ? new Date(`${selectedDate!.toDateString()} ${selectedTime}`).toISOString() : null,
        teacherUid: user.uid,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      setError(err.error || "Failed to create lesson");
      setSaving(false);
      return;
    }

    router.push(`/dashboard/teacher/courses/${courseId}`);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-6 md:p-8 space-y-6">
        <div>
          <h1 className="font-serif text-2xl">New Lesson</h1>
          <p className="text-sm text-muted-foreground mt-1">Add content to your course</p>
        </div>

        {!courseId && (
          <div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
            يرجى فتح هذه الصفحة من داخل الكورس المحدد. مثال: /dashboard/teacher/courses/new?courseId=123
          </div>
        )}

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Lesson Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Introduction to Arabic Grammar"
            className="mt-1 w-full rounded-2xl border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gold"
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Lesson Type</label>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <button
              onClick={() => setType("recorded")}
              className={`flex items-center gap-2 justify-center rounded-2xl border p-3 text-sm font-medium transition ${
                type === "recorded" ? "bg-emerald-600 text-white border-emerald-600" : "bg-card hover:bg-accent"
              }`}
            >
              <FileText size={16} /> Recorded
            </button>
            <button
              onClick={() => setType("zoom")}
              className={`flex items-center gap-2 justify-center rounded-2xl border p-3 text-sm font-medium transition ${
                type === "zoom" ? "bg-emerald-600 text-white border-emerald-600" : "bg-card hover:bg-accent"
              }`}
            >
              <Video size={16} /> Live Zoom
            </button>
          </div>
        </div>

        {type === "zoom" && (
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                <Calendar size={14} /> Session Date
              </label>
              <CalendarPicker selected={selectedDate} onChange={setSelectedDate} minDate={minDate} />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                <Clock size={14} /> Session Time
              </label>
              <TimeSlotPicker selected={selectedTime} onChange={setSelectedTime} date={selectedDate} />
            </div>
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={saving || !courseId}
          className="w-full rounded-full bg-linear-to-r from-emerald-600 to-emerald-700 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {saving ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Submit for Review"}
        </button>
      </motion.div>
    </div>
  );
}