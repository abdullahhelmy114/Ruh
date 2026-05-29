"use client";

import { T } from "@/components/TranslatedText";
import { useAuth } from "@/lib/firebase/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Award, Copy, GraduationCap, Trophy, ChevronRight,
  BookOpen, Loader2, Video, Clock, Play,
} from "lucide-react";
import { motion } from "framer-motion";
import { YouTubeEmbed } from "@/components/ui/YouTubeEmbed";
import { OnboardingTour } from "@/components/OnboardingTour";

interface LiveSession {
  id: string; title: string; scheduled_at: string; meeting_url: string;
  course_id: string; course_title: string; teacher_name: string;
}

interface DashboardData {
  firstName: string;
  streak: number;
  inProgress: { title: string; next: string; progress: number; courseId: string }[];
  completed: { title: string; date: string; courseId: string; recording_url?: string }[];
  referral: { code: string; count: number; credits: number };
  sessions: LiveSession[];
}

interface EnrolledCourse {
  id: string;
  title: string;
  level: string;
  total_lessons: number;
  completed_lessons: number;
}

export default function StudentDashboard() {
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const { user, isLoading, role } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRecording, setSelectedRecording] = useState<{ url: string; title: string } | null>(null);

  // فحص البريد الإلكتروني المؤكد
  useEffect(() => {
    if (!user) return;
    fetch(`/api/user?uid=${user.uid}`)
      .then(r => r.json())
      .then(d => {
        if (d.profile && !d.profile.email_verified) {
          router.push("/verify-email");
        }
      });
  }, [user, router]);



  // جلب بيانات الداشبورد
  useEffect(() => {
    if (!user || !user.uid) return;
    fetch(`/api/student/dashboard?uid=${user.uid}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user]);

  // حماية المسار
  useEffect(() => {
    if (!isLoading) {
      if (!user) router.push("/login");
      else if (role !== "student" && role !== "admin") router.push("/login");
    }
  }, [user, isLoading, role, router]);

  // جلب الكورسات المسجل بها
  useEffect(() => {
    if (!user) return;
    fetch(`/api/student/courses?uid=${user.uid}`)
      .then(r => r.json())
      .then(d => setEnrolledCourses(d.courses || []))
      .catch(console.error);
  }, [user]);

  if (isLoading || loading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  if (!user || !data) return null;

  const isJoinable = (scheduledAt: string) => {
    const now = new Date();
    const t = new Date(scheduledAt);
    return now >= new Date(t.getTime() - 10 * 60 * 1000) && now <= new Date(t.getTime() + 60 * 60 * 1000);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 md:px-8 min-h-screen">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-4xl border border-border bg-card p-8 shadow-elegant flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="absolute -top-16 -right-16 h-32 w-32 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="relative z-10">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600"><T>As‑salāmu ʿalaykum</T></div>
          <h1 className="mt-1 font-serif text-3xl md:text-4xl"><T>Welcome back,</T> {data.firstName}</h1>
          <p className="mt-2 text-sm italic text-muted-foreground"><T>Continue where you left off — every word is a victory.</T></p>
        </div>
        <div className="flex items-center gap-3 rounded-full border border-amber-500/20 bg-background/50 px-5 py-2.5 text-sm font-semibold">
          <Trophy className="h-5 w-5 animate-bounce text-amber-500" /> {data.streak}<T>-day streak</T>
        </div>
      </div>

      {/* Live Sessions */}
      {data.sessions.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="live-sessions glass rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Video className="h-5 w-5 text-amber-500" />
            <h2 className="font-serif text-xl"><T>Upcoming Live Sessions</T></h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {data.sessions.map(s => {
              const joinable = isJoinable(s.scheduled_at);
              return (
                <div key={s.id} className="flex items-center justify-between bg-background/50 rounded-2xl p-4 border">
                  <div>
                    <h3 className="font-serif text-sm font-semibold">{s.title}</h3>
                    <p className="text-xs text-muted-foreground">{s.course_title} · {s.teacher_name}</p>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1">
                      <Clock size={12} /> {new Date(s.scheduled_at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
                    </div>
                  </div>
                  <Link href={`/live/${s.id}`} className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition ${joinable ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-muted text-muted-foreground pointer-events-none"}`}>
                    {joinable ? <><ChevronRight size={14} /> <T>Join Now</T></> : <><Clock size={14} /> <T>Waiting</T></>}
                  </Link>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-10 lg:col-span-2">
          {/* My Courses */}
          <section className="your-courses">
            <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.25em] text-amber-600"><T>My Courses</T></div>
            <h2 className="font-serif text-2xl"><T>Enrolled Courses</T></h2>
            <div className="mt-4 space-y-4">
              {enrolledCourses.length === 0 ? (
                <div className="rounded-4xl border bg-card p-8 text-center text-muted-foreground">
                  <BookOpen className="mx-auto h-8 w-8 text-amber-500 mb-3" />
                  <p><T>You haven't enrolled in any courses yet.</T></p>
                  <Link href="/marketplace" className="mt-3 inline-block text-sm font-medium text-amber-600 hover:underline"><T>Browse Courses →</T></Link>
                </div>
              ) : (
                enrolledCourses.map(c => (
                  <div key={c.id} className="rounded-3xl border bg-card p-5 shadow-elegant">
                    <h3 className="font-serif text-lg">{c.title}</h3>
                    <p className="text-sm text-muted-foreground"><T>Level</T> {c.level}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: `${(c.completed_lessons / c.total_lessons) * 100 || 0}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground">{c.completed_lessons}/{c.total_lessons}</span>
                    </div>
                    <Link href={`/dashboard/student/courses/${c.id}`} className="mt-3 inline-block text-sm font-semibold text-amber-600 hover:underline">
                      <T>View Course →</T>
                    </Link>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Completed Courses with Recording */}
          {data.completed.length > 0 && (
            <section>
              <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.25em] text-amber-600"><T>Your milestones</T></div>
              <h2 className="font-serif text-2xl"><T>Completed</T></h2>
              <div className="mt-4 space-y-3">
                {data.completed.map(c => (
                  <div key={c.courseId} className="flex items-center gap-3 rounded-2xl border bg-card p-4">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/20 text-amber-700"><Award className="h-5 w-5" /></div>
                    <div className="flex-1">
                      <div className="font-serif text-sm">{c.title}</div>
                      <div className="text-xs text-muted-foreground"><T>Completed</T> {c.date}</div>
                    </div>
                    {c.recording_url && (
                      <button
                        onClick={() => setSelectedRecording({ url: c.recording_url!, title: c.title })}
                        className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-medium text-white flex items-center gap-1"
                      >
                        <Play size={12} /> <T>Watch</T>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="space-y-8">
          <section>
            <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.25em] text-amber-600"><T>Your milestones</T></div>
            <h2 className="font-serif text-2xl"><T>Achievements</T></h2>
            {data.completed.length === 0 ? (
              <div className="mt-4 rounded-4xl border bg-card p-6 text-center text-muted-foreground">
                <Award className="mx-auto h-8 w-8 text-amber-500 mb-3" />
                <p><T>No completed courses yet.</T></p>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {data.completed.map(c => (
                  <div key={c.courseId} className="flex items-center gap-3 rounded-2xl border bg-card p-4">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/20 text-amber-700"><Award className="h-5 w-5" /></div>
                    <div>
                      <div className="font-serif text-sm">{c.title}</div>
                      <div className="text-xs text-muted-foreground"><T>Completed</T> {c.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <div className="placement-test group relative overflow-hidden rounded-4xl border-2 border-amber-500/30 bg-card p-8 shadow-elegant">
            <GraduationCap className="mb-4 h-10 w-10 text-amber-500" />
            <h3 className="font-serif text-2xl"><T>Placement Test</T></h3>
            <p className="mt-2 text-sm text-muted-foreground"><T>Discover your level — get a tailored learning path from our experts.</T></p>
            <button className="mt-6 w-full rounded-full bg-amber-500 py-3 text-sm font-bold text-black shadow-lg"><T>Launch Assessment</T></button>
          </div>

          <div className="rounded-4xl border bg-card p-8 shadow-elegant">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600"><T>Referral Center</T></div>
            <h3 className="mt-2 font-serif text-xl"><T>Share the Academy</T></h3>
            <p className="mt-2 text-xs text-muted-foreground"><T>Earn credits for every friend who joins.</T></p>
            <div className="mt-5 flex items-center gap-2 rounded-xl border bg-background p-2 text-[10px]">
              <code className="flex-1 truncate px-2">{data.referral.code}</code>
              <button className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground"><Copy className="h-4 w-4" /></button>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 text-center">
              <div className="rounded-2xl border bg-background p-4">
                <div className="font-serif text-2xl">{data.referral.count}</div>
                <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"><T>Referrals</T></div>
              </div>
              <div className="rounded-2xl border bg-background p-4">
                <div className="font-serif text-2xl text-amber-600">${data.referral.credits}</div>
                <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"><T>Credits</T></div>
              </div>
            </div>
          </div>

          <Link href="/marketplace" className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-amber-500/40 bg-amber-500/5 p-4 text-sm font-bold text-amber-600 hover:bg-amber-500/10">
            <T>Explore Marketplace →</T>
          </Link>
        </div>
      </div>

      {/* Recording Modal */}
      {selectedRecording && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-auto p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-serif text-lg">{selectedRecording.title}</h3>
              <button
                onClick={() => setSelectedRecording(null)}
                className="text-sm text-muted-foreground hover:underline"
              >
                <T>Close</T>
              </button>
            </div>
            <YouTubeEmbed url={selectedRecording.url} title={selectedRecording.title} />
          </motion.div>
        </div>
      )}

{/* Onboarding Tour */}
{typeof window !== "undefined" && !localStorage.getItem("student_dashboard_tour") && (
  <OnboardingTour
    steps={[
      { target: ".your-courses", title: "My Courses", content: "Here you can see all the courses you are enrolled in.", placement: "bottom" },
      { target: ".live-sessions", title: "Live Sessions", content: "When it's time, click 'Join Now' to enter the Zoom meeting.", placement: "top", optional: true },
      { target: ".placement-test", title: "Placement Test", content: "Take a test to determine your level.", placement: "left", optional: true },
    ]}
    tourKey="student_dashboard_tour"
    onFinish={() => console.log("Tour finished")}
  />
)}
    </div>
  );
}