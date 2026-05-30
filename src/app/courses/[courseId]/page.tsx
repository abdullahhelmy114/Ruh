"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/AuthProvider";
import Image from "next/image";
import Link from "next/link";
import {
  Loader2, BookOpen, Video, FileText, ChevronRight,
  User, ArrowLeft, CreditCard,
} from "lucide-react";
import { YouTubeEmbed } from "@/components/ui/YouTubeEmbed";
import { T } from "@/components/TranslatedText";

interface Lesson {
  id: string;
  title: string;
  type: string;
  recording_url?: string;
}

interface Course {
  id: string;
  title: string;
  description: string | null;
  objectives: string | null;
  what_you_will_learn: string | null;
  level: string;
  price: number;
  image_url: string | null;
  trailer_url?: string | null;    // ✅ أضف هذا السطر
  teacher_name: string;
  teacher_uid: string;
  teacher_avatar?: string;
  lessons: Lesson[];
}

export default function CourseDetailPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!params.courseId) return;
    fetch(`/api/courses/${params.courseId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setCourse(null);
        } else {
          setCourse(data.course);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.courseId]);

  const handleEnroll = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (course!.price > 0) {
      setMessage("Payment is not available yet. Free enrollment only.");
      return;
    }
    setEnrolling(true);
    setMessage("");
    try {
      const res = await fetch("/api/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid, courseId: params.courseId }),
      });
      if (res.ok) {
        setMessage("Enrolled successfully!");
        setTimeout(() => router.push(`/dashboard/student/courses/${params.courseId}`), 1500);
      } else {
        const err = await res.json();
        setMessage(err.error || "Enrollment failed");
      }
    } catch {
      setMessage("Network error");
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        <T>Course not found</T>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8 space-y-8">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          <T>Home</T>
        </Link>
        <ChevronRight size={14} />
        <Link href="/marketplace" className="hover:text-foreground">
          <T>Marketplace</T>
        </Link>
        <ChevronRight size={14} />
        <span className="text-foreground">{course.title}</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* صورة الكورس */}
          <div className="rounded-3xl overflow-hidden bg-linear-to-br from-emerald-600 to-emerald-800 h-64 md:h-80 flex items-center justify-center">
            {course.image_url ? (
              <Image
                src={course.image_url}
                alt={course.title}
                width={800}
                height={400}
                className="object-cover w-full h-full"
              />
            ) : (
              <BookOpen className="h-24 w-24 text-white/20" />
            )}
          </div>

          {/* فيديو دعائي */}
          {course.trailer_url && (
            <div className="rounded-3xl overflow-hidden shadow-elegant">
              <YouTubeEmbed url={course.trailer_url} title={course.title} />
            </div>
          )}

          {/* العنوان والمستوى */}
          <div>
            <span className="inline-block rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-3 py-1 text-xs font-semibold">
              {course.level}
            </span>
            <h1 className="font-serif text-3xl md:text-4xl mt-3">{course.title}</h1>
            <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
              <User size={16} /> <T>by</T>{" "}
              {/* ✅ رابط إلى صفحة المعلم */}
              <Link
                href={`/teachers/${course.teacher_uid}`}
                className="font-medium text-foreground hover:text-amber-600 transition-colors underline-offset-2 hover:underline"
              >
                {course.teacher_name}
              </Link>
            </div>
          </div>

          {/* الوصف والأهداف */}
          <div className="prose dark:prose-invert max-w-none">
            <h2 className="font-serif text-2xl">
              <T>About This Course</T>
            </h2>
            <p>{course.description || <T>No description available.</T>}</p>
          </div>

          {/* قائمة الدروس */}
          <div>
            <h2 className="font-serif text-2xl mb-4">
              <T>Lessons</T> ({course.lessons?.length || 0})
            </h2>
            {course.lessons?.length === 0 ? (
              <p className="text-muted-foreground">
                <T>No lessons yet.</T>
              </p>
            ) : (
              course.lessons?.map((lesson) => (
                <div
                  key={lesson.id}
                  className="border rounded-2xl p-4 bg-card mb-3"
                >
                  <div className="flex items-center gap-2">
                    {lesson.type === "zoom" ? (
                      <Video size={16} className="text-amber-500" />
                    ) : (
                      <FileText size={16} className="text-emerald-500" />
                    )}
                    <h3 className="font-serif text-lg">{lesson.title}</h3>
                  </div>
                  {lesson.recording_url && (
                    <div className="mt-3 rounded-xl overflow-hidden">
                      <YouTubeEmbed
                        url={lesson.recording_url}
                        title={lesson.title}
                      />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* الشريط الجانبي */}
        <div className="space-y-4">
          <div className="rounded-3xl border bg-card p-6 shadow-elegant sticky top-24">
            <div className="text-3xl font-serif text-amber-600">
              ${course.price}
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground"><T>Level</T></span>
                <span className="font-medium">{course.level}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground"><T>Lessons</T></span>
                <span className="font-medium">
                  {course.lessons?.length || 0}
                </span>
              </div>
            </div>

            {message && (
              <div
                className={`mt-3 text-xs text-center font-medium ${
                  message.includes("success")
                    ? "text-emerald-600"
                    : "text-red-500"
                }`}
              >
                <T>{message}</T>
              </div>
            )}

            <button
              onClick={handleEnroll}
              disabled={enrolling}
              className="mt-4 w-full rounded-full bg-linear-to-r from-emerald-600 to-emerald-700 py-3 text-sm font-semibold text-white disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {enrolling ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  <CreditCard size={16} /> <T>Enroll Now</T>
                </>
              )}
            </button>

            <Link
              href="/marketplace"
              className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft size={16} /> <T>Back to Marketplace</T>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}