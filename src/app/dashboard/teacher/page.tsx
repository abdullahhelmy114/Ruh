"use client";

import { T } from "@/components/TranslatedText";
import { useAuth } from "@/lib/firebase/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Plus, Upload, Loader2, Video, Clock, ArrowRight, Star, BookOpen, FileText, Play } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarPicker } from "@/components/dashboard/CalendarPicker";
import { TimeSlotPicker } from "@/components/dashboard/TimeSlotPicker";
import { OnboardingTour } from "@/components/OnboardingTour";

interface Course {
  id: string; title: string; level: string; price: number; status: string; recording_url?: string;
}

interface Session {
  id: string; title: string; scheduled_at: string; meeting_url: string; course_id: string; course_title: string;
}

interface TeacherData {
  fullName: string; initial: string; certificationProgress: number;
  students: number; activeCourses: number; revenue: number; sessions: Session[];
  courses: Course[];
}

interface RatingData {
  averageRating: number;
  completedLessons: number;
}

function getCommissionRate(rating: number, completedLessons: number): number {
  const base = 20;
  if (completedLessons < 50) return base;
  if (rating < 4.5) return base;
  const increments = Math.floor(completedLessons / 50);
  const added = Math.min(increments * 5, 30);
  return base + added;
}

export default function TeacherDashboard() {
  const { user, isLoading, role } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<TeacherData | null>(null);
  const [ratingData, setRatingData] = useState<RatingData | null>(null);
  const [loading, setLoading] = useState(true);

  // New Lesson states
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [lessonType, setLessonType] = useState<"zoom" | "recorded">("zoom");
  const [lessonTitle, setLessonTitle] = useState("");
  const [sessionDate, setSessionDate] = useState<Date | null>(null);
  const [sessionTime, setSessionTime] = useState<string | null>(null);
  const [savingLesson, setSavingLesson] = useState(false);
  const [lessonError, setLessonError] = useState("");

  // New Course states
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseLevel, setNewCourseLevel] = useState('A1');
  const [newCoursePrice, setNewCoursePrice] = useState(49);
  const [savingCourse, setSavingCourse] = useState(false);
  const [courseError, setCourseError] = useState('');

  // Fetch initial data
  useEffect(() => {
    if (!user || !user.uid || role !== "teacher") return;
    const fetchData = async () => {
      try {
        const [teacherRes, coursesRes, ratingRes] = await Promise.all([
          fetch(`/api/teacher/dashboard?uid=${user.uid}`),
          fetch(`/api/teacher/courses?uid=${user.uid}`),
          fetch(`/api/teacher/rating?uid=${user.uid}`),
        ]);
        const teacherJson = await teacherRes.json();
        const coursesJson = await coursesRes.json();
        const ratingJson = await ratingRes.json();

        if (teacherRes.ok && coursesRes.ok) {
          setData({ ...teacherJson, courses: coursesJson.courses || [] });
          setRatingData(ratingJson);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, role]);

  // Auth guard
  useEffect(() => {
    if (!isLoading && (!user || (role !== "teacher" && role !== "admin"))) router.push("/login");
  }, [user, isLoading, role, router]);

  // Email verification check
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

  // Profile completion check
  useEffect(() => {
    if (!user) return;
    fetch(`/api/user?uid=${user.uid}`)
      .then(r => r.json())
      .then(d => {
        if (d.profile && !d.profile.profile_completed) {
          router.push("/onboarding");
        }
      });
  }, [user, router]);

  // Auto-refresh on window focus
  useEffect(() => {
    if (!user || !user.uid || role !== "teacher") return;
    const onFocus = () => {
      fetch(`/api/teacher/courses?uid=${user.uid}`)
        .then(r => r.json())
        .then(coursesJson => {
          setData(prev => prev ? { ...prev, courses: coursesJson.courses || [] } : null);
        })
        .catch(console.error);
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [user, role]);

  if (isLoading || loading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  if (!data) return null;

  const commissionRate = ratingData ? getCommissionRate(ratingData.averageRating, ratingData.completedLessons) : 20;

  const isJoinable = (s: string) => {
    const n = new Date(), t = new Date(s);
    return n >= new Date(t.getTime() - 10*60*1000) && n <= new Date(t.getTime() + 60*60*1000);
  };

  const handleSaveLesson = async () => {
    if (!selectedCourse) { setLessonError("Please select a course"); return; }
    if (!lessonTitle.trim()) { setLessonError("Lesson title is required"); return; }
    if (lessonType === "zoom") {
      if (!sessionDate || !sessionTime) { setLessonError("Please pick date and time"); return; }
      const minDate = new Date();
      minDate.setDate(minDate.getDate() + 7);
      if (sessionDate < minDate) { setLessonError("Date must be at least 7 days from now"); return; }
    }
    setSavingLesson(true);
    setLessonError("");

    const payload: any = {
      courseId: selectedCourse,
      title: lessonTitle,
      type: lessonType,
      teacherUid: user!.uid,
    };
    if (lessonType === "zoom" && sessionDate && sessionTime) {
      payload.scheduledAt = new Date(`${sessionDate.toDateString()} ${sessionTime}`).toISOString();
    }

    try {
      const res = await fetch("/api/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        setLessonError(err.error || "Failed to create lesson");
      } else {
        setShowLessonModal(false);
        alert("Lesson submitted for review!");
      }
    } catch (e: any) {
      setLessonError(e.message);
    } finally {
      setSavingLesson(false);
    }
  };

  const handleSaveCourse = async () => {
    if (!newCourseTitle.trim()) { setCourseError('Title is required'); return; }
    setSavingCourse(true);
    setCourseError('');
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newCourseTitle,
          level: newCourseLevel,
          price: newCoursePrice,
          teacherUid: user!.uid,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        setCourseError(err.error || 'Failed to create course');
      } else {
        const json = await res.json();
        setData(prev => prev ? { ...prev, courses: [...prev.courses, json.course] } : prev);
        setShowCourseModal(false);
        setNewCourseTitle('');
        setNewCourseLevel('A1');
        setNewCoursePrice(49);
      }
    } catch (e: any) {
      setCourseError(e.message);
    } finally {
      setSavingCourse(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 md:px-8 bg-background min-h-screen">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-6 rounded-4xl border border-border bg-card p-8 shadow-elegant md:flex-row md:items-center">
        <div className="flex items-center gap-5">
          <div className="grid h-20 w-20 place-items-center rounded-full bg-linear-to-r from-emerald-600 to-emerald-700 font-serif text-3xl text-white ring-4 ring-amber-500/20 shadow-lg">
            {data.initial}
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600"><T>Instructor Portal</T></div>
            <h1 className="mt-1 font-serif text-3xl">{data.fullName}</h1>
            <p className="mt-1 text-sm italic text-muted-foreground"><T>"Your students await your wisdom today."</T></p>
          </div>
        </div>
        <div className="flex w-full gap-3 md:w-auto">
          <button onClick={() => setShowCourseModal(true)} className="inline-flex items-center gap-2 rounded-full border bg-background px-6 py-3 text-sm font-medium hover:bg-accent">
            <Upload className="h-4 w-4 text-amber-500" /> <T>New Course</T>
          </button>
          <button
            onClick={() => {
              if (data.courses.filter(c => c.status === 'published').length === 0) {
                alert('You need to create a course first. Use "New Course".');
              } else {
                setShowLessonModal(true);
              }
            }}
            className="inline-flex items-center gap-2 rounded-full bg-linear-to-r from-emerald-600 to-emerald-700 px-6 py-3 text-sm font-bold text-white shadow-elegant"
          >
            <Plus className="h-4 w-4" /> <T>New Lesson</T>
          </button>
        </div>
      </div>

      {/* Commission Card */}
      {ratingData && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="commission-card rounded-4xl border bg-card p-6 shadow-elegant">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-linear-to-r from-amber-400 to-amber-500 text-white">
                <Star className="h-6 w-6 fill-white" />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest text-amber-600"><T>Your Rating</T></div>
                <div className="font-serif text-3xl">{ratingData.averageRating.toFixed(1)}</div>
                <div className="text-sm text-muted-foreground">{ratingData.completedLessons} <T>lessons completed</T></div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-semibold uppercase tracking-widest text-amber-600"><T>Commission Rate</T></div>
              <div className="font-serif text-3xl text-emerald-600">{commissionRate}%</div>
              <div className="text-xs text-muted-foreground">
                <T>+5% every 50 lessons at 4.5+ rating (max 50%)</T>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Live Sessions */}
      {data.sessions.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="live-sessions glass rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Video className="h-5 w-5 text-amber-500" />
            <h2 className="font-serif text-xl"><T>Your Live Sessions</T></h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {data.sessions.map(s => {
              const joinable = isJoinable(s.scheduled_at);
              return (
                <div key={s.id} className="flex items-center justify-between bg-background/50 rounded-2xl p-4 border">
                  <div>
                    <h3 className="font-serif text-sm font-semibold">{s.title}</h3>
                    <p className="text-xs text-muted-foreground">{s.course_title}</p>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1">
                      <Clock size={12} /> {new Date(s.scheduled_at).toLocaleString()}
                    </div>
                  </div>
                  <Link href={`/live/${s.id}`} className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition ${joinable ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-muted text-muted-foreground pointer-events-none"}`}>
                    {joinable ? <><T>Join Now</T> <ArrowRight size={14} /></> : <><Clock size={14} /> <T>Waiting</T></>}
                  </Link>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Courses List */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4 your-courses">
          <h2 className="font-serif text-2xl"><T>Your Courses</T></h2>
          {data.courses.length === 0 ? (
            <div className="rounded-3xl border bg-card p-8 text-center text-muted-foreground">
              <BookOpen className="mx-auto h-8 w-8 text-amber-500 mb-3" />
              <p><T>You haven't created any courses yet.</T></p>
            </div>
          ) : (
            data.courses.map((course) => (
              <div key={course.id} className="rounded-3xl border bg-card p-5 shadow-elegant flex justify-between items-center">
                <div>
                  <h3 className="font-serif text-lg">{course.title}</h3>
                  <p className="text-sm text-muted-foreground"><T>Level</T> {course.level} · ${course.price}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${course.status === 'published' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                    {course.status}
                  </span>
                  {course.recording_url && (
                    <button onClick={() => window.open(course.recording_url, '_blank')} className="ml-2 text-xs text-emerald-600 hover:underline inline-flex items-center gap-1">
                      <Play size={12} /> <T>View Recording</T>
                    </button>
                  )}
                </div>
                <Link href={`/dashboard/teacher/courses/${course.id}`} className="text-amber-600 text-sm font-semibold hover:underline">
                  <T>Manage →</T>
                </Link>
              </div>
            ))
          )}
        </div>

        {/* Stats Sidebar */}
        <div className="stats-sidebar space-y-4">
          <div className="rounded-3xl border bg-card p-6 shadow-elegant">
            <div className="text-xs font-semibold uppercase tracking-widest text-amber-600"><T>Stats</T></div>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between"><span className="text-muted-foreground"><T>Students</T></span><span className="font-semibold">{data.students}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground"><T>Active Courses</T></span><span className="font-semibold">{data.activeCourses}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground"><T>Revenue</T></span><span className="font-semibold">${data.revenue}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground"><T>Commission</T></span><span className="font-semibold text-emerald-600">{commissionRate}%</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* New Course Modal */}
      <AnimatePresence>
        {showCourseModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-card rounded-3xl shadow-elegant max-w-md w-full p-6 space-y-6">
              <h2 className="font-serif text-2xl"><T>New Course</T></h2>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"><T>Course Title</T></label>
                <input value={newCourseTitle} onChange={(e) => setNewCourseTitle(e.target.value)} placeholder="e.g. Arabic for Beginners" className="mt-1 w-full rounded-2xl border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gold" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"><T>Level</T></label>
                  <select value={newCourseLevel} onChange={(e) => setNewCourseLevel(e.target.value)} className="w-full rounded-2xl border bg-background px-4 py-2.5 text-sm mt-1">
                    <option>A1</option><option>A2</option><option>B1</option><option>B2</option><option>C1</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"><T>Price (USD)</T></label>
                  <input type="number" value={newCoursePrice} onChange={(e) => setNewCoursePrice(parseInt(e.target.value))} className="w-full rounded-2xl border bg-background px-4 py-2.5 text-sm mt-1" />
                </div>
              </div>
              {courseError && <p className="text-sm text-destructive">{courseError}</p>}
              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowCourseModal(false)} className="rounded-full border bg-background px-5 py-2.5 text-sm"><T>Cancel</T></button>
                <button onClick={handleSaveCourse} disabled={savingCourse} className="rounded-full bg-linear-to-r from-emerald-600 to-emerald-700 px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
                  {savingCourse ? <Loader2 size={16} className="animate-spin mx-auto" /> : <T>Create Course</T>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Lesson Modal */}
      <AnimatePresence>
        {showLessonModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-card rounded-3xl shadow-elegant max-w-lg w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto">
              <h2 className="font-serif text-2xl"><T>New Lesson</T></h2>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"><T>Select Course</T></label>
                <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className="w-full rounded-2xl border bg-background px-4 py-3 mt-1 text-sm">
                  <option value="">-- <T>Choose a course</T> --</option>
                  {data.courses.filter(c => c.status === 'published').map(c => (
                    <option key={c.id} value={c.id}>{c.title} (<T>Level</T> {c.level})</option>
                  ))}
                </select>
                <button type="button" onClick={() => { setShowLessonModal(false); setShowCourseModal(true); }} className="text-xs text-amber-600 hover:underline mt-1 inline-block">
                  + <T>Create a new course</T>
                </button>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"><T>Lesson Type</T></label>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <button onClick={() => setLessonType("zoom")} className={`flex items-center gap-2 justify-center rounded-2xl border p-3 text-sm font-medium transition ${lessonType === "zoom" ? "bg-emerald-600 text-white border-emerald-600" : "bg-card hover:bg-accent"}`}>
                    <Video size={16} /> <T>Live Zoom</T>
                  </button>
                  <button onClick={() => setLessonType("recorded")} className={`flex items-center gap-2 justify-center rounded-2xl border p-3 text-sm font-medium transition ${lessonType === "recorded" ? "bg-emerald-600 text-white border-emerald-600" : "bg-card hover:bg-accent"}`}>
                    <FileText size={16} /> <T>Recorded</T>
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"><T>Lesson Title</T></label>
                <input value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)} placeholder="e.g. Introduction to Arabic Grammar" className="mt-1 w-full rounded-2xl border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gold" />
              </div>
              {lessonType === "zoom" && (
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2"><T>Session Date (min. 7 days ahead)</T></label>
                    <CalendarPicker selected={sessionDate} onChange={setSessionDate} minDate={new Date(Date.now() + 7*24*60*60*1000)} />
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2"><T>Session Time</T></label>
                    <TimeSlotPicker selected={sessionTime} onChange={setSessionTime} date={sessionDate} />
                  </div>
                </div>
              )}
              {lessonError && <p className="text-sm text-destructive">{lessonError}</p>}
              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowLessonModal(false)} className="rounded-full border bg-background px-5 py-2.5 text-sm"><T>Cancel</T></button>
                <button onClick={handleSaveLesson} disabled={savingLesson} className="rounded-full bg-linear-to-r from-emerald-600 to-emerald-700 px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
                  {savingLesson ? <Loader2 size={16} className="animate-spin mx-auto" /> : <T>Submit for Review</T>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

{/* Onboarding Tour */}
{typeof window !== "undefined" && !localStorage.getItem("onboarding_tour_seen") && (
  <OnboardingTour
    steps={[
      { target: "body", title: "🎉 مرحباً بك!", content: "دعنا نلقي نظرة سريعة على لوحة التحكم." },
      { target: ".your-courses", title: "📚 كورساتك", content: "هنا تظهر الكورسات التي اشتركت بها." },
      { target: ".live-sessions", title: "🔴 الجلسات المباشرة", content: "عندما يحين موعد الجلسة، سيتفعّل زر 'Join Now'." },
      { target: ".placement-test", title: "🧪 اختبار تحديد المستوى", content: "يمكنك إجراء اختبار لتحديد مستواك." },
      { target: "body", title: "🚀 أنت جاهز!", content: "استخدم القائمة العلوية للتنقل." },
    ]}
    tourKey="onboarding_tour_seen"
  />
)}
    </div>
  );
}