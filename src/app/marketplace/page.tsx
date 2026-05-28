"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/firebase/AuthProvider";
import { useRouter } from "next/navigation";
import { Loader2, ShoppingCart, Star, Clock, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { T } from "@/components/TranslatedText";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Marketplace | Ruhulqudus Academy",
  description: "Explore our courses and master Arabic with the best instructors.",
};

interface Course {
  id: string;
  title: string;
  level: string;
  price: number;
  teacher_name: string;
}

export default function MarketplacePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/marketplace")
      .then((r) => r.json())
      .then((data) => {
        setCourses(data.courses || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleEnroll = async (courseId: string) => {
    if (!user) {
      router.push("/login");
      return;
    }
    setEnrolling(courseId);
    setMessage("");
    try {
      const res = await fetch("/api/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: user.uid, courseId }),
      });
      if (res.ok) {
        setMessage("Enrolled successfully! Check your dashboard.");
      } else {
        const err = await res.json();
        setMessage(err.error || "Enrollment failed");
      }
    } catch {
      setMessage("Network error");
    } finally {
      setEnrolling(null);
    }
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-10 w-10 animate-spin" /></div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <div className="mb-8 text-center">
        <div className="text-xs font-bold uppercase tracking-[0.3em] text-amber-600"><T>Marketplace</T></div>
        <h1 className="mt-3 font-serif text-4xl"><T>Explore Our Courses</T></h1>
        <p className="mt-2 text-muted-foreground"><T>Master Arabic with the best instructors</T></p>
      </div>

      {message && (
        <div className="mb-6 text-center text-sm font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-full">
          <T>{message}</T>
        </div>
      )}

      {courses.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <BookOpen className="mx-auto h-12 w-12 mb-4 text-amber-500" />
          <p><T>No courses available yet.</T></p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <motion.div
              key={course.id}
              whileHover={{ y: -5 }}
              className="overflow-hidden rounded-3xl border bg-card shadow-elegant transition-shadow hover:shadow-gold/20"
            >
              <div className="h-40 bg-linear-to-br from-emerald-600 to-emerald-800 flex items-center justify-center relative">
                <BookOpen className="h-16 w-16 text-white/30" />
                <span className="absolute top-3 right-3 rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur">
                  {course.level}
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-serif text-lg leading-tight">{course.title}</h3>
                <p className="text-sm text-muted-foreground mt-1"><T>by</T> {course.teacher_name}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-serif text-2xl font-bold text-amber-600">${course.price}</span>
                  <button
                    onClick={() => handleEnroll(course.id)}
                    disabled={enrolling === course.id}
                    className="inline-flex items-center gap-2 rounded-full bg-linear-to-r from-emerald-600 to-emerald-700 px-5 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
                  >
                    {enrolling === course.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <ShoppingCart size={16} />
                    )}
                    <T>Enroll</T>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}