"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/firebase/AuthProvider";
import { Loader2, Video, FileText, Play, Download } from "lucide-react";
import { YouTubeEmbed } from "@/components/ui/YouTubeEmbed";

interface Lesson {
  id: string;
  title: string;
  type: string;
  scheduled_at: string | null;
  meeting_url: string | null;
  recording_url: string | null;
  status: string;
  completed: boolean;
  files: { file_name: string; file_url: string; file_type: string }[];
}

export default function StudentCoursePage() {
  const { user } = useAuth();
  const params = useParams<{ courseId: string }>();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/student/courses/${params.courseId}?uid=${user.uid}`)
      .then(r => r.json())
      .then(d => { setLessons(d.lessons || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user, params.courseId]);

  const isJoinable = (scheduledAt: string) => {
    const now = new Date();
    const t = new Date(scheduledAt);
    return now >= new Date(t.getTime() - 10 * 60 * 1000) && now <= new Date(t.getTime() + 60 * 60 * 1000);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-4xl mx-auto p-4 py-10 space-y-8">
      <h1 className="font-serif text-3xl">Course Lessons</h1>
      {lessons.map((lesson) => (
        <div key={lesson.id} className="border rounded-2xl p-5 bg-card shadow-elegant">
          <div className="flex items-center gap-2">
            {lesson.type === 'zoom' ? <Video className="text-amber-500" /> : <FileText className="text-emerald-600" />}
            <h3 className="font-serif text-lg">{lesson.title}</h3>
            <span className="text-xs text-muted-foreground ml-auto">{lesson.status}</span>
          </div>

          {/* زر دخول زوم */}
          {lesson.type === 'zoom' && lesson.scheduled_at && lesson.meeting_url && (
            <div className="mt-3">
              {isJoinable(lesson.scheduled_at) ? (
                <a href={`/live/${lesson.id}`} className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-white text-sm">
                  <Video size={16} /> Join Now
                </a>
              ) : (
                <span className="text-sm text-muted-foreground">
                  Starts at {new Date(lesson.scheduled_at).toLocaleString()}
                </span>
              )}
            </div>
          )}

          {/* عرض تسجيل يوتيوب */}
          {lesson.recording_url && (
            <div className="mt-3">
              <YouTubeEmbed url={lesson.recording_url} title={lesson.title} />
            </div>
          )}

          {/* عرض ملفات الدرس */}
          {lesson.files?.length > 0 && (
            <div className="mt-3">
              <h4 className="text-sm font-semibold mb-2">Attachments</h4>
              {lesson.files.map((file, i) => (
                <a key={i} href={file.file_url} target="_blank" className="flex items-center gap-2 text-sm text-amber-600 hover:underline mb-1">
                  <Download size={14} /> {file.file_name}
                </a>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}