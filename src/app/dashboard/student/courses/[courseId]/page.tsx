"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/AuthProvider";
import {
  Loader2, Play, FileText, Download, CheckCircle,
  BookOpen, ArrowLeft, HelpCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { T } from "@/components/TranslatedText";
import { YouTubeEmbed } from "@/components/ui/YouTubeEmbed";
import { QuizPlayer } from "@/components/QuizPlayer";      // ✅ أضف هذا
import Link from "next/link";
import { CertificateButton } from "@/components/CertificateButton";

interface Lesson {
  id: string;
  title: string;
  type: string;
  recording_url: string | null;
  files: { file_name: string; file_url: string; file_type: string }[];
  completed: boolean;
}

interface CourseData {
  course: { id: string; title: string; level: string; teacher_name: string };
  lessons: Lesson[];
}

// ─── مكون الاختبارات (يُوضع بعد الملفات) ───
function QuizSection({ lessonId }: { lessonId: string }) {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/quizzes/${lessonId}`)
      .then((r) => r.json())
      .then((d) => setQuizzes(d.quizzes || []))
      .finally(() => setLoading(false));
  }, [lessonId]);

  if (loading) return null; // أو سبينر صغير
  if (quizzes.length === 0) return null; // بدون اختبار

  return (
    <div className="glass rounded-2xl p-5 space-y-3">
      <h3 className="font-serif text-lg flex items-center gap-2">
        <HelpCircle className="h-5 w-5 text-amber-500" />
        <T>Quiz</T>
      </h3>
      <QuizPlayer quizzes={quizzes} />
    </div>
  );
}

export default function CoursePlayerPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<CourseData | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/student/courses/${courseId}?uid=${user.uid}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) { router.push("/dashboard/student"); return; }
        setData(d);
        setCurrentLesson(d.lessons?.[0] || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [courseId, user, router]);

  const handleComplete = async () => {
    if (!currentLesson || !user) return;
    setCompleting(true);
    await fetch("/api/lessons/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId: currentLesson.id, uid: user.uid }),
    });
    setCurrentLesson(prev => prev ? { ...prev, completed: true } : prev);
    setCompleting(false);
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  if (!data) return <div className="flex min-h-screen items-center justify-center text-muted-foreground"><T>Course not found</T></div>;

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 md:p-8 min-h-screen">
      {/* Sidebar */}
      <aside className="w-full lg:w-80 shrink-0 glass rounded-3xl p-5 shadow-elegant max-h-[85vh] overflow-y-auto">
        <Link href="/dashboard/student" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft size={16} /> <T>Back to Dashboard</T>
        </Link>
        <h2 className="font-serif text-xl flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-amber-500" /> {data.course.title}
        </h2>
        <p className="text-xs text-muted-foreground mt-1"><T>Level</T> {data.course.level}</p>
        <div className="mt-4 space-y-2">
          {data.lessons.map((lesson, i) => (
            <button
              key={lesson.id}
              onClick={() => setCurrentLesson(lesson)}
              className={`w-full text-left p-3 rounded-xl text-sm transition flex items-center gap-3 ${
                currentLesson?.id === lesson.id
                  ? "bg-emerald-600 text-white"
                  : lesson.completed
                  ? "bg-emerald-50 dark:bg-emerald-900/20"
                  : "hover:bg-accent"
              }`}
            >
              <span className="shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-xs">
                {lesson.completed ? <CheckCircle size={14} className="text-emerald-500" /> : i + 1}
              </span>
              <span className="truncate">{lesson.title}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* Main Player */}
      <main className="flex-1 space-y-6">
        {currentLesson ? (
          <motion.div key={currentLesson.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Video */}
            {currentLesson.recording_url && (
              <div className="rounded-3xl overflow-hidden shadow-elegant">
                <YouTubeEmbed url={currentLesson.recording_url} title={currentLesson.title} />
              </div>
            )}

            {/* Title & Complete Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-serif text-2xl md:text-3xl">{currentLesson.title}</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {currentLesson.type === "zoom" ? <T>Live Session</T> : <T>Recorded Lesson</T>}
                </p>
              </div>
              <button
                onClick={handleComplete}
                disabled={currentLesson.completed || completing}
                className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition ${
                  currentLesson.completed
                    ? "bg-emerald-100 text-emerald-600 cursor-default"
                    : "bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                }`}
              >
                {currentLesson.completed ? (
                  <><CheckCircle size={18} /> <T>Completed</T></>
                ) : (
                  <><Play size={18} /> <T>Mark as Complete</T></>
                )}
              </button>
              {currentLesson.completed && (
                <CertificateButton
                  studentName={user?.displayName || user?.email?.split("@")[0] || "Student"}
                  courseName={data.course.title}
                  teacherName={data.course.teacher_name || "Instructor"}
                />
              )}
            </div>

            {/* Files */}
            {currentLesson.files && currentLesson.files.length > 0 && (
              <div className="glass rounded-2xl p-5">
                <h3 className="font-serif text-lg mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-amber-500" /> <T>Lesson Resources</T>
                </h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {currentLesson.files.map((file, i) => (
                    <a
                      key={i}
                      href={file.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-xl border bg-background p-3 hover:bg-accent transition"
                    >
                      <span className="text-sm truncate">{file.file_name}</span>
                      <Download size={16} className="text-muted-foreground shrink-0 ml-2" />
                    </a>
                  ))}
                </div>
              </div>
            )}
            <QuizSection lessonId={currentLesson.id} />
          </motion.div>
        ) : (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <T>Select a lesson to start learning</T>
          </div>
        )}
      </main>
    </div>
  );
}