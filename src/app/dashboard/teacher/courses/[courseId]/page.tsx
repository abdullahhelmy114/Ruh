"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/AuthProvider";
import { T } from "@/components/TranslatedText";
import { Loader2, ArrowLeft, Trash2, Video, FileText, Plus, Eye } from "lucide-react";
import Link from "next/link";

interface Lesson {
  id: string; title: string; type: string; status: string; recording_url?: string;
}

export default function ManageCoursePage() {
  const { user, role } = useAuth();
  const router = useRouter();
  const params = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || (role !== "teacher" && role !== "admin")) { router.push("/login"); return; }
    fetch(`/api/courses/${params.courseId}`)
      .then(r => r.json())
      .then(d => setCourse(d.course))
      .catch(() => {});
    fetch(`/api/lessons?teacherUid=${user.uid}`)
      .then(r => r.json())
      .then(d => setLessons((d.lessons || []).filter((l: any) => l.course_id === params.courseId)))
      .finally(() => setLoading(false));
  }, [params.courseId, user, role, router]);

  const handleDelete = async (lessonId: string) => {
    if (!confirm("Delete this lesson?")) return;
    await fetch(`/api/lessons/${lessonId}`, { method: 'DELETE' });
    setLessons(prev => prev.filter(l => l.id !== lessonId));
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;
  if (!course) return <div className="text-center py-20"><T>Course not found</T></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Link href="/dashboard/teacher" className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <ArrowLeft size={16} /> <T>Back to Dashboard</T>
      </Link>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl">{course.title}</h1>
          <p className="text-sm text-muted-foreground"><T>Level</T> {course.level} · ${course.price}</p>
        </div>
        <Link
          href={`/dashboard/teacher/courses/new?courseId=${params.courseId}`}
          className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white flex items-center gap-2"
        >
          <Plus size={16} /> <T>Add Lesson</T>
        </Link>
      </div>

      {lessons.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p><T>No lessons yet.</T></p>
        </div>
      ) : (
        <div className="space-y-3">
          {lessons.map(l => (
            <div key={l.id} className="flex items-center justify-between glass rounded-2xl p-4">
              <div className="flex items-center gap-3">
                {l.type === "zoom" ? <Video size={16} className="text-amber-500" /> : <FileText size={16} className="text-emerald-500" />}
                <div>
                  <p className="font-medium">{l.title}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    l.status === 'approved' ? 'bg-emerald-500/10 text-emerald-600' :
                    l.status === 'rejected' ? 'bg-red-500/10 text-red-600' :
                    'bg-amber-500/10 text-amber-600'
                  }`}>{l.status}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {l.recording_url && (
                  <a href={l.recording_url} target="_blank" className="p-2 rounded-full hover:bg-accent" title="View Recording">
                    <Eye size={16} />
                  </a>
                )}
                <button onClick={() => handleDelete(l.id)} className="p-2 rounded-full hover:bg-red-50 text-red-500">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}