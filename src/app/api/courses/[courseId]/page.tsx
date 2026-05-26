"use client";

import { useAuth } from "@/lib/firebase/AuthProvider";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, BookOpen, Video, FileText } from "lucide-react";
import { YouTubeEmbed } from "@/components/ui/YouTubeEmbed";

interface Lesson {
  id: string;
  title: string;
  type: string;
  recording_url?: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  teacher_name: string;
  level: string;
  price: number;
  lessons: Lesson[];
}

export default function CoursePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/courses/${params.courseId}`)
      .then(res => res.json())
      .then(data => { setCourse(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [params.courseId]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;
  if (!course) return <div className="text-center py-20">Course not found</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">
      <div>
        <h1 className="font-serif text-4xl">{course.title}</h1>
        <p className="text-muted-foreground mt-2">by {course.teacher_name} · Level {course.level} · ${course.price}</p>
        <p className="mt-4">{course.description}</p>
      </div>

      <div>
        <h2 className="font-serif text-2xl mb-4">Lessons</h2>
        <div className="space-y-3">
          {course.lessons.map((lesson) => (
            <div key={lesson.id} className="border rounded-2xl p-4 bg-card">
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
    </div>
  );
}