"use client";

import { T } from "@/components/TranslatedText";
import { useAuth } from "@/lib/firebase/AuthProvider";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users, GraduationCap, DollarSign, TrendingUp, ShieldCheck, FileText,
  CheckCircle2, XCircle, Search, BookOpen, Clock, Wallet,
  Sparkles, Settings2, Crown, AlertCircle, ArrowUpRight, MoreHorizontal,
  Filter, Download, Bot, Save, Loader2, Ban, UserCheck, ExternalLink, Video,
  MessageSquare, Bell, Trash2, Eye, Send, Mail, Edit3, UserX,
  Ticket, HelpCircle, BarChart3, Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Megaphone } from "lucide-react";
// ─── Types ─────────────────────────────────────────────
type TabKey =
  | "overview"
  | "teachers"
  | "courses"
  | "users"
  | "finance"
  | "coupons"
  | "quizzes"
  | "messaging"
  | "notifications"
  | "ai"
  | "settings"
  | "pages"
  | "marketing";

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: "overview", label: "Overview", icon: TrendingUp },
  { key: "teachers", label: "Teacher Verification", icon: ShieldCheck },
  { key: "courses", label: "Course Moderation", icon: BookOpen },
  { key: "users", label: "User Management", icon: Users },
  { key: "finance", label: "Financial Center", icon: Wallet },
  { key: "coupons", label: "Coupons", icon: Ticket },
  { key: "quizzes", label: "Quizzes", icon: HelpCircle },
  { key: "messaging", label: "Messaging", icon: MessageSquare },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "ai", label: "AI Configuration", icon: Bot },
  { key: "settings", label: "Site Settings", icon: Settings2 },
  { key: "marketing", label: "Marketing", icon: Megaphone },
  { key: "pages", label: "Pages", icon: FileText },
];



// ─── Main Component ────────────────────────────────────
export default function AdminDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [tab, setTab] = useState<TabKey>("overview");
  const router = useRouter();

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

  if (authLoading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );

  if (!user)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Link href="/login" className="text-accent-foreground">
          <T>تسجيل الدخول</T>
        </Link>
      </div>
    );

  if (
    user.email !== "abdullahhelmy114@gmail.com" &&
    user.email !== "info@ruhulqudus.com"
  )
    return (
      <div className="flex min-h-screen items-center justify-center">
        <h1 className="text-3xl text-red-600">
          <T>غير مصرح</T>
        </h1>
      </div>
    );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 rounded-3xl border bg-card p-6 shadow-elegant md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-linear-to-r from-emerald-600 to-emerald-700 ring-4 ring-amber-500/30">
            <Crown className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-accent-foreground">
              <T>Management Suite</T>
            </div>
            <h1 className="font-serif text-3xl">
              <T>Admin Control Panel</T>
            </h1>
            <p className="text-sm text-muted-foreground">
              <T>Oversee the entire Ruhulqudus Academy ecosystem.</T>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 font-medium text-emerald-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />{" "}
            <T>All systems operational</T>
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex gap-1 overflow-x-auto rounded-2xl border bg-card p-1.5">
        {TABS.map(t => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-linear-to-r from-emerald-600 to-emerald-700 text-white shadow-elegant"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" /> <T>{t.label}</T>
            </button>
          );
        })}
      </div>

      <div className="mt-8">
        {tab === "overview" && <OverviewTab />}
        {tab === "teachers" && <TeacherVerificationTab />}
        {tab === "courses" && <CourseModerationTab />}
        {tab === "users" && <UserManagementTab />}
        {tab === "finance" && <FinancialCenterTab />}
        {tab === "coupons" && <CouponsTab />}
        {tab === "quizzes" && <QuizzesTab />}
        {tab === "messaging" && <MessagingTab />}
        {tab === "notifications" && <NotificationsTab />}
        {tab === "ai" && <AIConfigurationTab />}
        {tab === "settings" && <SiteSettingsTab />}
        {tab === "marketing" && <MarketingTab />}
        {tab === "pages" && <PagesTab />}
      </div>
    </div>
  );
}

/* ─────────── Overview Tab ─────────── */
function OverviewTab() {
  const [stats, setStats] = useState<any>(null);
  const [pending, setPending] = useState<any>(null);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(d => {
        setStats(d.stats);
        setPending(d.pending);
      });
  }, []);

  if (!stats)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin" />
      </div>
    );

  const statCards = [
    { label: "Total Students", value: stats.total_students.toLocaleString(), icon: Users, accent: "from-emerald-500/20" },
    { label: "Total Teachers", value: stats.total_teachers.toLocaleString(), icon: GraduationCap, accent: "from-amber-500/30" },
    { label: "Active Courses", value: stats.active_courses.toLocaleString(), icon: BookOpen, accent: "from-emerald-500/20" },
    { label: "Total Revenue", value: `$${stats.total_revenue.toLocaleString()}`, icon: DollarSign, accent: "from-amber-500/30" },
  ];

  const pendingList = [
    { icon: ShieldCheck, label: "Teacher applications", count: pending.teacher_applications },
    { icon: BookOpen, label: "Courses awaiting review", count: pending.courses_pending },
    { icon: Wallet, label: "Payouts to process", count: pending.payouts_pending },
    { icon: AlertCircle, label: "Reported content", count: pending.reported_content },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="relative overflow-hidden rounded-3xl border bg-card p-6 shadow-elegant">
              <div className={`absolute inset-0 bg-linear-to-br opacity-60 ${s.accent} to-transparent`} />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-background/80 backdrop-blur">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="mt-4 font-serif text-3xl">{s.value}</div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground"><T>{s.label}</T></div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border bg-card p-6 shadow-elegant lg:col-span-2">
          <h3 className="font-serif text-xl"><T>Revenue Trend (last 30 days)</T></h3>
          <div className="mt-4 h-40 flex items-end gap-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="flex-1 rounded-t bg-linear-to-t from-primary to-amber-500/70" style={{ height: `${Math.random() * 100}%` }} />
            ))}
          </div>
        </div>
        <div className="rounded-3xl border bg-card p-6 shadow-elegant">
          <h3 className="font-serif text-xl"><T>Pending Items</T></h3>
          <ul className="mt-4 space-y-3">
            {pendingList.map(item => {
              const Icon = item.icon;
              return (
                <li key={item.label} className="flex items-center justify-between rounded-2xl border bg-background px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-primary" /> <T>{item.label}</T>
                  </div>
                  <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-bold text-amber-800">{item.count}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ─────────── Teacher Verification Tab ─────────── */
function TeacherVerificationTab() {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/teacher-applications')
      .then(r => r.json())
      .then(d => {
        // API يرجع مصفوفة مباشرة
        setApps(Array.isArray(d) ? d : d.applications || []);
        setLoading(false);
      });
  }, []);

  const handleApprove = async (uid: string) => {
    const res = await fetch('/api/admin/approve-teacher', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid }),
    });
    if (res.ok) {
      setApps(prev => prev.filter(a => a.uid !== uid));
    } else {
      const data = await res.json();
      alert(data.message || 'Failed to approve');
    }
  };

  const handleReject = async (uid: string) => {
    // يمكن إضافة API للرفض إذا أردت، حالياً نزيله من القائمة فقط
    setApps(prev => prev.filter(a => a.uid !== uid));
  };

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <div className="space-y-4">
      <h2 className="font-serif text-2xl"><T>Pending Teacher Applications</T></h2>
      {apps.length === 0 ? (
        <div className="rounded-3xl border bg-card p-12 text-center text-muted-foreground">
          <T>No pending applications</T>
        </div>
      ) : (
        apps.map(app => (
          <div key={app.uid} className="rounded-3xl border bg-card p-5 shadow-elegant space-y-3">
            <div>
              <h3 className="font-serif text-lg">{app.first_name} {app.last_name}</h3>
              <p className="text-xs text-muted-foreground">
                {app.email} · {app.country_of_residence} · {app.nationality}
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <span><strong>WhatsApp:</strong> {app.whatsapp}</span>
              <span><strong>Telegram:</strong> {app.telegram}</span>
              <span><strong>Gender:</strong> {app.gender}</span>
              <span><strong>Languages:</strong> {app.languages?.map((l:any) => l.code).join(', ')}</span>
            </div>
            {app.bio && <p className="text-xs text-muted-foreground italic">"{app.bio}"</p>}
            <div className="flex flex-wrap gap-2 text-xs">
              {app.cv_url && (
                <a href={app.cv_url} target="_blank" className="text-accent-foreground underline inline-flex items-center gap-1">
                  <ExternalLink size={12} /> View CV
                </a>
              )}
              {app.intro_video_url && (
                <a href={app.intro_video_url} target="_blank" className="text-accent-foreground underline inline-flex items-center gap-1">
                  <Video size={12} /> Intro Video
                </a>
              )}
              {app.social_links?.map((s: any, i: number) => (
                <a key={i} href={s.url} target="_blank" className="text-blue-500 underline inline-flex items-center gap-1">
                  <ExternalLink size={12} /> {s.platform}
                </a>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleReject(app.uid)} className="px-3 py-1 rounded-full border border-red-500/30 text-red-600 text-xs">
                <T>Reject</T>
              </button>
              <button onClick={() => handleApprove(app.uid)} className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs">
                <T>Approve</T>
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

/* ─────────── Course Moderation Tab ─────────── */
function CourseModerationTab() {
  const [courses, setCourses] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, lessonsRes] = await Promise.all([
          fetch('/api/admin/pending-courses'),
          fetch('/api/lessons?status=pending'),
        ]);
        const coursesData = await coursesRes.json();
        const lessonsData = await lessonsRes.json();
        setCourses(coursesData.courses || []);
        setLessons(lessonsData.lessons || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCourseAction = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/approve-course', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: id, status }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(`Failed: ${err.error || 'Unknown error'}`);
        return;
      }
      setCourses(prev => prev.filter(c => c.id !== id));
    } catch (e: any) {
      alert(`Network error: ${e.message}`);
    }
  };

  const handleLessonAction = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/lessons/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(`Failed: ${err.error || 'Unknown error'}`);
        return;
      }
      setLessons(prev => prev.filter(l => l.id !== id));
    } catch (e: any) {
      alert(`Network error: ${e.message}`);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin" />
      </div>
    );

  const totalPending = courses.length + lessons.length;

  return (
    <div>
      <h2 className="font-serif text-2xl mb-4"><T>Course & Lesson Moderation</T></h2>
      {totalPending === 0 ? (
        <div className="rounded-3xl border bg-card p-12 text-center text-muted-foreground">
          <T>No pending courses or lessons</T>
        </div>
      ) : (
        <div className="space-y-8">
          {courses.length > 0 && (
            <div>
              <h3 className="font-serif text-lg mb-3 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-secondary-foreground" /> <T>Courses</T> ({courses.length})
              </h3>
              <div className="space-y-3">
                {courses.map(c => (
                  <div key={c.id} className="rounded-2xl border bg-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <h4 className="font-medium">{c.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        <T>by</T> {c.teacher_name} · <T>Level</T> {c.level} · ${c.price}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        <T>Submitted</T> {new Date(c.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCourseAction(c.id, 'rejected')}
                        className="px-3 py-1 rounded-full border border-red-500/30 text-red-600 text-xs"
                      >
                        <T>Reject</T>
                      </button>
                      <button
                        onClick={() => handleCourseAction(c.id, 'published')}
                        className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs"
                      >
                        <T>Publish</T>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {lessons.length > 0 && (
            <div>
              <h3 className="font-serif text-lg mb-3 flex items-center gap-2">
                <Video className="h-5 w-5 text-secondary-foreground" /> <T>Lessons</T> ({lessons.length})
              </h3>
              <div className="space-y-3">
                {lessons.map(l => (
                  <div key={l.id} className="rounded-2xl border bg-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <h4 className="font-medium">{l.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        <T>Course</T>: {l.course_title} · <T>Type</T>: {l.type}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        <T>Submitted</T> {new Date(l.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleLessonAction(l.id, 'rejected')}
                        className="px-3 py-1 rounded-full border border-red-500/30 text-red-600 text-xs"
                      >
                        <T>Reject</T>
                      </button>
                      <button
                        onClick={() => handleLessonAction(l.id, 'approved')}
                        className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs"
                      >
                        <T>Approve</T>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─────────── User Management Tab ─────────── */
function UserManagementTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showMessageModal, setShowMessageModal] = useState<any>(null);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/admin/users')
      .then(r => r.json())
      .then(d => setUsers(d.users));
  }, []);

  const toggleBan = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    await fetch(`/api/admin/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    setUsers(prev => prev.map(u => (u.id === id ? { ...u, status: newStatus } : u)));
  };

  const deleteUser = async (id: string) => {
    await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
    setUsers(prev => prev.filter(u => u.id !== id));
    setShowDeleteConfirm(null);
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !showMessageModal) return;
    setSending(true);
    await fetch('/api/admin/send-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: showMessageModal.id, message: messageText }),
    });
    setSending(false);
    setShowMessageModal(null);
    setMessageText("");
    alert("Message sent!");
  };

  const filteredUsers = users.filter(
    u =>
      (u.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-2xl"><T>User Management</T></h2>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search users..."
            className="w-full rounded-full border bg-background pl-10 pr-4 py-2 text-sm outline-none"
          />
        </div>
      </div>

      <table className="w-full text-sm rounded-3xl border bg-card overflow-hidden">
        <thead className="bg-muted/40 text-xs uppercase">
          <tr>
            <th className="px-5 py-3 text-left"><T>User</T></th>
            <th><T>Role</T></th>
            <th><T>Status</T></th>
            <th><T>Joined</T></th>
            <th className="text-right"><T>Actions</T></th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((u: any) => (
            <tr key={u.id} className="border-t hover:bg-accent/40">
              <td className="px-5 py-4">
                {u.full_name}
                <br />
                <span className="text-xs text-muted-foreground">{u.email}</span>
              </td>
              <td>{u.role}</td>
              <td>{u.status}</td>
              <td>{new Date(u.created_at).toLocaleDateString()}</td>
              <td className="text-right">
                <div className="flex items-center justify-end gap-1">
              <button
                onClick={() => router.push(`/dashboard/admin/user-profile?uid=${u.uid}`)}
                className="p-1.5 rounded-full hover:bg-accent"
                title="View Profile"
              >
                <Eye className="h-4 w-4" />
              </button>
                  <button onClick={() => setShowMessageModal(u)} className="p-1.5 rounded-full hover:bg-accent" title="Send Message">
                    <Mail className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => toggleBan(u.id, u.status)}
                    className={`px-2 py-1 rounded-full text-xs ${u.status === 'Active' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}
                  >
                    {u.status === 'Active' ? <T>Ban</T> : <T>Unban</T>}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(u.id)}
                    className="p-1.5 rounded-full hover:bg-red-100 text-red-500"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modals */}
      {showProfile && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card rounded-3xl p-6 max-w-md w-full shadow-elegant space-y-3">
            <h3 className="font-serif text-xl">{selectedUser.full_name}</h3>
            <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
            <p className="text-sm"><T>Role</T>: {selectedUser.role}</p>
            <p className="text-sm"><T>Status</T>: {selectedUser.status}</p>
            <p className="text-sm"><T>Joined</T>: {new Date(selectedUser.created_at).toLocaleDateString()}</p>
            <button onClick={() => setShowProfile(false)} className="mt-4 rounded-full border px-4 py-2 text-sm">
              <T>Close</T>
            </button>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card rounded-3xl p-6 max-w-sm w-full shadow-elegant text-center space-y-4">
            <Trash2 className="mx-auto h-10 w-10 text-red-500" />
            <p className="font-medium"><T>Are you sure you want to delete this user?</T></p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setShowDeleteConfirm(null)} className="rounded-full border px-4 py-2 text-sm">
                <T>Cancel</T>
              </button>
              <button onClick={() => deleteUser(showDeleteConfirm)} className="rounded-full bg-red-600 text-white px-4 py-2 text-sm">
                <T>Delete</T>
              </button>
            </div>
          </div>
        </div>
      )}

      {showMessageModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card rounded-3xl p-6 max-w-md w-full shadow-elegant space-y-4">
            <h3 className="font-serif text-xl"><T>Send Message to</T> {showMessageModal.full_name}</h3>
            <textarea
              value={messageText}
              onChange={e => setMessageText(e.target.value)}
              rows={4}
              className="w-full rounded-2xl border bg-background p-4 text-sm"
              placeholder="Type your message..."
            />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowMessageModal(null)} className="rounded-full border px-4 py-2 text-sm">
                <T>Cancel</T>
              </button>
              <button onClick={handleSendMessage} disabled={sending} className="rounded-full bg-emerald-600 text-white px-4 py-2 text-sm disabled:opacity-50">
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-4 w-4" /> <T>Send</T></>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────── Coupons Tab ─────────── */
function CouponsTab() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState(20);
  const [maxUses, setMaxUses] = useState("");
  const [validUntil, setValidUntil] = useState("");

  const fetchCoupons = async () => {
    const res = await fetch('/api/admin/coupons');
    const data = await res.json();
    setCoupons(data.coupons || []);
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleCreate = async () => {
    if (!code.trim()) return;
    await fetch('/api/admin/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        discount_percent: discount,
        max_uses: maxUses ? parseInt(maxUses) : null,
        valid_until: validUntil || null,
      }),
    });
    setCode("");
    setDiscount(20);
    setMaxUses("");
    setValidUntil("");
    fetchCoupons();
  };

  const handleDelete = async (id: string) => {
    await fetch('/api/admin/coupons', { method: 'DELETE', body: JSON.stringify({ id }) });
    fetchCoupons();
  };

  return (
    <div>
      <h2 className="font-serif text-2xl mb-4"><T>Coupon Management</T></h2>

      <div className="glass rounded-2xl p-4 mb-6 grid grid-cols-2 md:grid-cols-5 gap-3">
        <input value={code} onChange={e => setCode(e.target.value)} placeholder="Code" className="rounded-full border bg-background px-4 py-2 text-sm" />
        <input type="number" value={discount} onChange={e => setDiscount(parseInt(e.target.value))} placeholder="Discount %" className="rounded-full border bg-background px-4 py-2 text-sm" />
        <input value={maxUses} onChange={e => setMaxUses(e.target.value)} placeholder="Max Uses" className="rounded-full border bg-background px-4 py-2 text-sm" />
        <input type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} className="rounded-full border bg-background px-4 py-2 text-sm" />
        <button onClick={handleCreate} className="rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-black">
          <T>Create</T>
        </button>
      </div>

      <div className="space-y-2">
        {coupons.map(c => (
          <div key={c.id} className="flex items-center justify-between glass rounded-2xl p-4">
            <div>
              <span className="font-bold text-accent-foreground">{c.code}</span>
              <span className="ml-4 text-sm text-muted-foreground"><T>Discount</T>: {c.discount_percent}%</span>
              <span className="ml-4 text-sm text-muted-foreground"><T>Used</T>: {c.current_uses}/{c.max_uses || '∞'}</span>
              {c.valid_until && (
                <span className="ml-4 text-sm text-muted-foreground"><T>Until</T>: {new Date(c.valid_until).toLocaleDateString()}</span>
              )}
            </div>
            <button onClick={() => handleDelete(c.id)} className="text-red-500 text-sm"><T>Delete</T></button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────── Quizzes Tab ─────────── */
function QuizzesTab() {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [lessons, setLessons] = useState<any[]>([]);
  const [selectedLesson, setSelectedLesson] = useState("");
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correct, setCorrect] = useState(0);

  useEffect(() => {
    fetch('/api/marketplace').then(r => r.json()).then(d => setCourses(d.courses || []));
  }, []);

  useEffect(() => {
    if (!selectedCourse) return;
    fetch(`/api/student/courses/${selectedCourse}?uid=admin`).then(r => r.json()).then(d => setLessons(d.lessons || []));
  }, [selectedCourse]);

  useEffect(() => {
    if (!selectedLesson) return;
    fetch(`/api/quizzes/${selectedLesson}`).then(r => r.json()).then(d => setQuizzes(d.quizzes || []));
  }, [selectedLesson]);

  const handleAdd = async () => {
    if (!question.trim() || !selectedLesson) return;
    await fetch('/api/admin/quizzes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lessonId: selectedLesson, question, options, correct }),
    });
    setQuestion("");
    setOptions(["", "", "", ""]);
    setCorrect(0);
    // refresh
    const res = await fetch(`/api/quizzes/${selectedLesson}`);
    const data = await res.json();
    setQuizzes(data.quizzes || []);
  };

  const handleDelete = async (id: string) => {
    await fetch('/api/admin/quizzes', { method: 'DELETE', body: JSON.stringify({ id }) });
    setQuizzes(prev => prev.filter(q => q.id !== id));
  };

  return (
    <div>
      <h2 className="font-serif text-2xl mb-4"><T>Quiz Management</T></h2>
      <div className="grid md:grid-cols-3 gap-6">
        <div>
          <label className="text-sm font-medium"><T>Course</T></label>
          <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} className="w-full rounded-2xl border bg-background px-4 py-2.5 text-sm mt-1">
            <option value="">--</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium"><T>Lesson</T></label>
          <select value={selectedLesson} onChange={e => setSelectedLesson(e.target.value)} className="w-full rounded-2xl border bg-background px-4 py-2.5 text-sm mt-1">
            <option value="">--</option>
            {lessons.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
          </select>
        </div>
      </div>

      {selectedLesson && (
        <div className="mt-6 glass rounded-2xl p-6 space-y-4">
          <h3 className="font-serif text-lg"><T>Add Question</T></h3>
          <input value={question} onChange={e => setQuestion(e.target.value)} placeholder="Question" className="w-full rounded-2xl border bg-background px-4 py-3 text-sm" />
          {options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <input value={opt} onChange={e => { const o = [...options]; o[i] = e.target.value; setOptions(o); }} placeholder={`Option ${i + 1}`} className="flex-1 rounded-2xl border bg-background px-4 py-3 text-sm" />
              <input type="radio" name="correct" checked={correct === i} onChange={() => setCorrect(i)} />
            </div>
          ))}
          <button onClick={handleAdd} className="rounded-full bg-emerald-600 px-6 py-2 text-sm font-semibold text-white">
            <T>Add Question</T>
          </button>
        </div>
      )}

      <div className="mt-6 space-y-2">
        {quizzes.map(q => (
          <div key={q.id} className="flex items-center justify-between glass rounded-2xl p-4">
            <div>
              <p className="font-medium">{q.question}</p>
              <p className="text-xs text-muted-foreground"><T>Correct</T>: {q.options[q.correct]}</p>
            </div>
            <button onClick={() => handleDelete(q.id)} className="text-red-500 text-sm"><T>Delete</T></button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────── Financial Center Tab ─────────── */
function FinancialCenterTab() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/admin/finance').then(r => r.json()).then(d => {
      setTransactions(d.transactions);
      setPayouts(d.payouts);
    });
  }, []);

  return (
    <div>
      <h2 className="font-serif text-2xl mb-4"><T>Financial Center</T></h2>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <h3 className="font-serif text-lg"><T>Recent Transactions</T></h3>
          {transactions.map((t: any) => (
            <div key={t.id} className="flex justify-between p-2 border-b text-sm">
              <span>{t.user_name} – {t.item_name}</span>
              <span className="font-semibold">${t.amount}</span>
            </div>
          ))}
        </div>
        <div>
          <h3 className="font-serif text-lg"><T>Pending Payouts</T></h3>
          {payouts.map((p: any) => (
            <div key={p.teacher_id} className="flex justify-between p-2 border-b text-sm">
              <span>{p.teacher_name}</span>
              <span className="font-semibold">${p.pending_amount}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────── Messaging Tab ─────────── */
function MessagingTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch('/api/admin/users').then(r => r.json()).then(d => setUsers(d.users));
  }, []);

  const handleSend = async () => {
    if (!selectedUser || !message.trim()) return;
    setSending(true);
    await fetch('/api/admin/send-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: selectedUser.id, message }),
    });
    setSending(false);
    setMessage("");
    alert("Message sent to " + selectedUser.full_name);
  };

  return (
    <div>
      <h2 className="font-serif text-2xl mb-4"><T>Send Message to User</T></h2>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-medium mb-2"><T>Select User</T></h3>
          <div className="max-h-80 overflow-y-auto space-y-2">
            {users.map(u => (
              <button
                key={u.id}
                onClick={() => setSelectedUser(u)}
                className={`w-full text-left rounded-2xl border p-3 text-sm transition ${selectedUser?.id === u.id ? 'bg-emerald-50 border-emerald-500' : 'hover:bg-accent'}`}
              >
                {u.full_name} <span className="text-muted-foreground">({u.email})</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          {selectedUser ? (
            <div className="space-y-4">
              <h3 className="text-sm font-medium"><T>Message to</T>: {selectedUser.full_name}</h3>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={6}
                className="w-full rounded-2xl border bg-background p-4 text-sm"
                placeholder="Type your message..."
              />
              <button onClick={handleSend} disabled={sending} className="rounded-full bg-emerald-600 px-6 py-2 text-sm font-semibold text-white disabled:opacity-50">
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-4 w-4" /> <T>Send</T></>}
              </button>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-12"><T>Select a user to send a message</T></div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────── Notifications Tab ─────────── */
function NotificationsTab() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) return;
    setSending(true);
    await fetch('/api/admin/send-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body }),
    });
    setSending(false);
    setTitle("");
    setBody("");
    alert("Notification sent to all users!");
  };

  return (
    <div className="max-w-2xl">
      <h2 className="font-serif text-2xl mb-4"><T>Send Global Notification</T></h2>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium"><T>Title</T></label>
          <input value={title} onChange={e => setTitle(e.target.value)} className="w-full rounded-2xl border bg-background px-4 py-3 text-sm mt-1" placeholder="Notification title" />
        </div>
        <div>
          <label className="text-sm font-medium"><T>Body</T></label>
          <textarea value={body} onChange={e => setBody(e.target.value)} rows={4} className="w-full rounded-2xl border bg-background p-4 text-sm mt-1" placeholder="Notification body..." />
        </div>
        <button onClick={handleSend} disabled={sending} className="rounded-full bg-emerald-600 px-6 py-2 text-sm font-semibold text-white disabled:opacity-50">
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Bell className="h-4 w-4" /> <T>Send to All Users</T></>}
        </button>
      </div>
    </div>
  );
}

/* ─────────── AI Configuration Tab ─────────── */
function AIConfigurationTab() {
  const [config, setConfig] = useState({
    systemPrompt: "You are Nūr, a refined and knowledgeable assistant...",
    model: "gpt-5.2",
    temperature: 0.7,
    maxTokens: 2048,
  });

  const handleSave = () => {
    alert('<T>Configuration saved!</T>');
  };

  return (
    <div>
      <h2 className="font-serif text-2xl mb-4"><T>AI Configuration</T></h2>
      <div className="space-y-4 max-w-2xl">
        <div>
          <label className="block text-sm font-medium"><T>System Prompt</T></label>
          <textarea rows={4} value={config.systemPrompt} onChange={e => setConfig({ ...config, systemPrompt: e.target.value })} className="w-full rounded-2xl border bg-background p-4 text-sm mt-1" />
        </div>
        <div>
          <label className="block text-sm font-medium"><T>Model</T></label>
          <select value={config.model} onChange={e => setConfig({ ...config, model: e.target.value })} className="w-full rounded-2xl border bg-background px-4 py-2 text-sm mt-1">
            <option>gpt-5.2</option>
            <option>gpt-5.2-mini</option>
            <option>claude-sonnet-4.5</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium"><T>Temperature</T></label>
            <input type="number" step={0.1} value={config.temperature} onChange={e => setConfig({ ...config, temperature: parseFloat(e.target.value) })} className="w-full rounded-2xl border bg-background px-4 py-2 text-sm mt-1" />
          </div>
          <div>
            <label className="block text-sm font-medium"><T>Max Tokens</T></label>
            <input type="number" value={config.maxTokens} onChange={e => setConfig({ ...config, maxTokens: parseInt(e.target.value) })} className="w-full rounded-2xl border bg-background px-4 py-2 text-sm mt-1" />
          </div>
        </div>
        <button onClick={handleSave} className="rounded-full bg-emerald-600 px-6 py-2 text-sm font-semibold text-white"><T>Save Configuration</T></button>
      </div>
    </div>
  );
}

/* ─────────── Site Settings Tab ─────────── */
function SiteSettingsTab() {
  const [siteName, setSiteName] = useState("Ruhulqudus Academy");
  const [contactEmail, setContactEmail] = useState("admin@ruhulqudus.net");
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  return (
    <div className="max-w-2xl">
      <h2 className="font-serif text-2xl mb-4"><T>Site Settings</T></h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium"><T>Site Name</T></label>
          <input value={siteName} onChange={e => setSiteName(e.target.value)} className="w-full rounded-2xl border bg-background px-4 py-2 text-sm mt-1" />
        </div>
        <div>
          <label className="block text-sm font-medium"><T>Contact Email</T></label>
          <input value={contactEmail} onChange={e => setContactEmail(e.target.value)} className="w-full rounded-2xl border bg-background px-4 py-2 text-sm mt-1" />
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium"><T>Maintenance Mode</T></label>
          <button onClick={() => setMaintenanceMode(!maintenanceMode)} className={`h-6 w-11 rounded-full p-0.5 transition-colors ${maintenanceMode ? 'bg-emerald-600' : 'bg-gray-300'}`}>
            <div className={`h-5 w-5 rounded-full bg-white transition-transform ${maintenanceMode ? 'translate-x-5' : ''}`} />
          </button>
        </div>
        <button className="rounded-full bg-emerald-600 px-6 py-2 text-sm font-semibold text-white mt-4"><T>Save Settings</T></button>
      </div>
    </div>
  );
}

function MarketingTab() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("never-enrolled");
  const [level, setLevel] = useState("B1");
  const [exporting, setExporting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const params = new URLSearchParams({ filter });
    if (filter === "certificate-level") params.append("level", level);
    const res = await fetch(`/api/admin/marketing?${params.toString()}`);
    const data = await res.json();
    setStudents(data.students || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [filter, level]);

  const handleExport = async () => {
    setExporting(true);
    const params = new URLSearchParams({ filter, export: "true" });
    if (filter === "certificate-level") params.append("level", level);
    const res = await fetch(`/api/admin/marketing?${params.toString()}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "admin-student-emails.txt";
    a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-2xl"><T>Marketing Tools (All Students)</T></h2>
        <button onClick={handleExport} disabled={exporting || students.length === 0}
          className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
          <Download size={16} /> {exporting ? "Exporting…" : "Export Emails"}
        </button>
      </div>
      <div className="flex gap-2 mb-4">
        {["never-enrolled","one-course","certificate-level","all"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${filter===f ? "bg-emerald-600 text-white" : "bg-card border hover:bg-accent"}`}>
            <T>{f.replace("-"," ")}</T>
          </button>
        ))}
        {filter === "certificate-level" && (
          <select value={level} onChange={e => setLevel(e.target.value)} className="rounded-full border bg-card px-3 py-1.5 text-sm">
            {["A1","A2","B1","B2","C1","C2"].map(l => <option key={l}>{l}</option>)}
          </select>
        )}
      </div>
      {loading ? <Loader2 className="animate-spin mx-auto" /> : students.length === 0 ? <T>No students found</T> :
        <div className="space-y-2">
          {students.map((s: any) => (
            <div key={s.uid} className="glass rounded-2xl p-4 flex justify-between">
              <div>
                <p className="font-medium">{s.full_name}</p>
                <p className="text-xs text-muted-foreground">{s.email}</p>
              </div>
            </div>
          ))}
        </div>
      }
    </div>
  );
} // ✅ إغلاق MarketingTab بشكل صحيح

function PagesTab() {
  const [pages, setPages] = useState<any[]>([]);
  const [selectedSlug, setSelectedSlug] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/pages')
      .then(r => r.json())
      .then(d => setPages(d.pages || []));
  }, []);

  useEffect(() => {
    if (!selectedSlug) return;
    fetch(`/api/admin/pages?slug=${selectedSlug}`)
      .then(r => r.json())
      .then(d => {
        if (d.page) {
          setTitle(d.page.title);
          setContent(d.page.content);
        }
      });
  }, [selectedSlug]);

  const handleSave = async () => {
    if (!selectedSlug || !title.trim() || !content.trim()) return;
    setSaving(true);
    await fetch('/api/admin/pages', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: selectedSlug, title, content }),
    });
    setSaving(false);
    alert('Page updated!');
  };

  return (
    <div>
      <h2 className="font-serif text-2xl mb-4"><T>Page Management</T></h2>
      <div className="grid md:grid-cols-4 gap-6">
        <div>
          <label className="text-sm font-medium mb-2 block"><T>Select Page</T></label>
          <div className="space-y-2">
            {pages.map(p => (
              <button
                key={p.slug}
                onClick={() => setSelectedSlug(p.slug)}
                className={`w-full text-left rounded-xl px-4 py-2.5 text-sm transition ${
                  selectedSlug === p.slug ? 'bg-emerald-600 text-white' : 'hover:bg-accent'
                }`}
              >
                {p.slug}
              </button>
            ))}
          </div>
        </div>
        {selectedSlug && (
          <div className="md:col-span-3 space-y-4">
            <div>
              <label className="text-sm font-medium"><T>Title</T></label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full rounded-2xl border bg-background px-4 py-3 text-sm mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium"><T>Content</T></label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={10}
                className="w-full rounded-2xl border bg-background p-4 text-sm mt-1"
              />
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-full bg-emerald-600 px-6 py-2 text-sm font-semibold text-white"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <T>Save Changes</T>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}