"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/AuthProvider";
import { Loader2, BookOpen, Video, FileText, ChevronRight } from "lucide-react";
import { YouTubeEmbed } from "@/components/ui/YouTubeEmbed";
import { T } from "@/components/TranslatedText";

interface Lesson {
  id: string; title: string; type: string; recording_url?: string;
}

interface Course {
  id: string; title: string; description: string; objectives: string;
  what_you_will_learn: string; level: string; price: number;
  teacher_name: string; lessons: Lesson[];
}

export default function CoursePage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/login"); return; }
    fetch(`/api/courses/${params.courseId}?uid=${user.uid}`)
      .then(r => r.json())
      .then(d => { setCourse(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [params.courseId, user, authLoading]);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      const res = await fetch("/api/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: user!.uid, courseId: params.courseId }),
      });
      if (res.ok) {
        alert("Enrolled successfully!");
        router.push("/dashboard/student");
      }
    } catch {}
    setEnrolling(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;
  if (!course) return <div className="text-center py-20"><T>Course not found</T></div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <a href="/"><T>Home</T></a> <ChevronRight size={14} />
        <a href="/marketplace"><T>Marketplace</T></a> <ChevronRight size={14} />
        <span className="text-foreground">{course.title}</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h1 className="font-serif text-4xl">{course.title}</h1>
            <p className="text-muted-foreground mt-2"><T>by</T> {course.teacher_name} · <T>Level</T> {course.level} · ${course.price}</p>
          </div>

          <div className="prose dark:prose-invert max-w-none">
            <h2 className="font-serif text-2xl"><T>About This Course</T></h2>
            <p>{course.description || <T>No description available.</T>}</p>

            <h2 className="font-serif text-2xl"><T>Objectives</T></h2>
            <p>{course.objectives || <T>No objectives listed.</T>}</p>

            <h2 className="font-serif text-2xl"><T>What You'll Learn</T></h2>
            <p>{course.what_you_will_learn || <T>Not specified.</T>}</p>
          </div>

          {/* Lessons */}
          <div>
            <h2 className="font-serif text-2xl mb-4"><T>Lessons</T> ({course.lessons?.length || 0})</h2>
            {course.lessons?.map(lesson => (
              <div key={lesson.id} className="border rounded-2xl p-4 bg-card mb-3">
                <div className="flex items-center gap-2">
                  {lesson.type === 'zoom' ? <Video size={16} /> : <FileText size={16} />}
                  <h3 className="font-serif text-lg">{lesson.title}</h3>
                </div>
                {lesson.recording_url && (
                  <div className="mt-3">
                    <YouTubeEmbed url={lesson.recording_url} title={lesson.title} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-3xl border bg-card p-6 shadow-elegant">
            <div className="text-3xl font-serif text-amber-600">${course.price}</div>
            <button
              onClick={handleEnroll}
              disabled={enrolling}
              className="mt-4 w-full rounded-full bg-linear-to-r from-emerald-600 to-emerald-700 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {enrolling ? <Loader2 size={16} className="animate-spin mx-auto" /> : <T>Enroll Now</T>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}