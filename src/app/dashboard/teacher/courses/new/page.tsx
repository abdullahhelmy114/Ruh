"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/firebase/AuthProvider";
import { Loader2, CheckCircle, BookOpen, Eye, Play } from "lucide-react";
import { motion } from "framer-motion";
import { T } from "@/components/TranslatedText";

interface ModelLesson {
  id: string;
  title: string;
  order_index: number;
  type: string;
  script_pdf_url?: string;
  duration_minutes?: number;
}

interface LiveLesson {
  id: string;
  model_lesson_id: string;
  recording_url?: string;
}

export default function ManageLessonsPage() {
  const { user, isLoading, role } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");

  const [modelLessons, setModelLessons] = useState<ModelLesson[]>([]);
  const [liveLessons, setLiveLessons] = useState<LiveLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [activatingId, setActivatingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  if (isLoading) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto" /></div>;
  if (!user) { router.push("/login"); return null; }
  if (role !== "teacher" && role !== "admin") { router.push("/"); return null; }

  useEffect(() => {
    if (!courseId) return;
    fetch(`/api/teacher/live-courses/${courseId}/model-lessons`)
      .then(r => r.json())
      .then(data => {
        setModelLessons(data.modelLessons || []);
        setLiveLessons(data.liveLessons || []);
      })
      .catch(() => setError("Failed to load lessons"))
      .finally(() => setLoading(false));
  }, [courseId]);

  const isActivated = (modelLessonId: string) => {
    return liveLessons.some(l => l.model_lesson_id === modelLessonId);
  };

  const handleActivate = async (modelLessonId: string) => {
    setActivatingId(modelLessonId);
    setError("");
    try {
      const res = await fetch(`/api/teacher/live-courses/${courseId}/activate-lesson`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model_lesson_id: modelLessonId }),
      });
      if (res.ok) {
        const data = await res.json();
        setLiveLessons(prev => [...prev, { id: data.liveLessonId, model_lesson_id: modelLessonId }]);
      } else {
        const err = await res.json();
        setError(err.error || "Activation failed");
      }
    } catch {
      setError("Network error");
    } finally {
      setActivatingId(null);
    }
  };

  if (!courseId) {
    return (
      <div className="max-w-2xl mx-auto p-4 py-8 text-center text-destructive">
        الرجاء تحديد الكورس عبر الرابط (?courseId=...)
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-6 md:p-8 space-y-6">
        <div>
          <h1 className="font-serif text-2xl">دروس الكورس (النموذجية)</h1>
          <p className="text-sm text-muted-foreground mt-1">
            قم بتفعيل الدروس بالترتيب المحدد من الأدمن
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-3">
          {modelLessons.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              لا توجد دروس نموذجية لهذا الكورس بعد.
            </p>
          ) : (
            modelLessons.map((lesson, index) => (
              <div
                key={lesson.id}
                className="flex items-center justify-between rounded-2xl border bg-card p-4"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground font-mono w-6 text-center">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{lesson.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {lesson.type} {lesson.duration_minutes && `· ${lesson.duration_minutes} دقيقة`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {lesson.script_pdf_url && (
                    <a
                      href={lesson.script_pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-xs rounded-full border hover:bg-accent"
                      title="عرض السكريبت"
                    >
                      <Eye size={14} />
                    </a>
                  )}
                  {isActivated(lesson.id) ? (
                    <span className="inline-flex items-center gap-1 text-xs text-primary">
                      <CheckCircle size={14} /> مفعّل
                    </span>
                  ) : (
                    <button
                      onClick={() => handleActivate(lesson.id)}
                      disabled={activatingId === lesson.id}
                      className="inline-flex items-center gap-1 text-xs bg-accent text-accent-foreground rounded-full px-3 py-1.5 hover:bg-accent/90 disabled:opacity-50"
                    >
                      {activatingId === lesson.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Play size={14} />
                      )}
                      تفعيل
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}