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
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────
type TabKey = "overview" | "teachers" | "courses" | "users" | "finance" | "ai" | "settings" | "messaging" | "notifications";

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: "overview", label: "Overview", icon: TrendingUp },
  { key: "teachers", label: "Teacher Verification", icon: ShieldCheck },
  { key: "courses", label: "Course Moderation", icon: BookOpen },
  { key: "users", label: "User Management", icon: Users },
  { key: "finance", label: "Financial Center", icon: Wallet },
  { key: "messaging", label: "Messaging", icon: MessageSquare },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "ai", label: "AI Configuration", icon: Bot },
  { key: "settings", label: "Site Settings", icon: Settings2 },
];

// ─── Main Component ────────────────────────────────────
export default function AdminDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [tab, setTab] = useState<TabKey>("overview");
  const router = useRouter();

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

  if (authLoading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  if (!user) return <div className="flex min-h-screen items-center justify-center"><Link href="/login" className="text-amber-600"><T>تسجيل الدخول</T></Link></div>;
  if (user.email !== "abdullahhelmy114@gmail.com" && user.email !== "info@ruhulqudus.com") {
  return <div className="flex min-h-screen items-center justify-center"><h1 className="text-3xl text-red-600"><T>غير مصرح</T></h1></div>;
}

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 rounded-3xl border bg-card p-6 shadow-elegant md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-linear-to-r from-emerald-600 to-emerald-700 ring-4 ring-amber-500/30">
            <Crown className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-amber-600"><T>Management Suite</T></div>
            <h1 className="font-serif text-3xl"><T>Admin Control Panel</T></h1>
            <p className="text-sm text-muted-foreground"><T>Oversee the entire Ruhulqudus Academy ecosystem.</T></p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 font-medium text-emerald-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> <T>All systems operational</T>
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex gap-1 overflow-x-auto rounded-2xl border bg-card p-1.5">
        {TABS.map(t => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button key={t.key} onClick={() => setTab(t.key)} className={cn("inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all", active ? "bg-linear-to-r from-emerald-600 to-emerald-700 text-white shadow-elegant" : "text-muted-foreground hover:bg-accent hover:text-foreground")}>
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
        {tab === "messaging" && <MessagingTab />}
        {tab === "notifications" && <NotificationsTab />}
        {tab === "ai" && <AIConfigurationTab />}
        {tab === "settings" && <SiteSettingsTab />}
      </div>
    </div>
  );
}

/* ─────────── Overview Tab ─────────── */
function OverviewTab() {
  const [stats, setStats] = useState<any>(null);
  const [pending, setPending] = useState<any>(null);

  useEffect(() => {
    fetch('/api/admin/stats').then(r => r.json()).then(d => { setStats(d.stats); setPending(d.pending); });
  }, []);

  if (!stats) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;

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
            {Array.from({length:12}).map((_,i)=> <div key={i} className="flex-1 rounded-t bg-linear-to-t from-primary to-amber-500/70" style={{height: `${Math.random()*100}%`}}/>)}
          </div>
        </div>
        <div className="rounded-3xl border bg-card p-6 shadow-elegant">
          <h3 className="font-serif text-xl"><T>Pending Items</T></h3>
          <ul className="mt-4 space-y-3">
            {pendingList.map(item => {
              const Icon = item.icon;
              return (
                <li key={item.label} className="flex items-center justify-between rounded-2xl border bg-background px-4 py-3">
                  <div className="flex items-center gap-3"><Icon className="h-4 w-4 text-primary" /> <T>{item.label}</T></div>
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
    fetch('/api/admin/teacher-applications').then(r => r.json()).then(d => { setApps(d.applications); setLoading(false); });
  }, []);

  const handleAction = async (id: string, status: string) => {
    await fetch(`/api/admin/teacher-applications/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setApps(apps.filter(a => a.id !== id));
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <h2 className="font-serif text-2xl"><T>Pending Teacher Applications</T></h2>
      {apps.length === 0 ? <div className="rounded-3xl border bg-card p-12 text-center text-muted-foreground"><T>No pending applications</T></div> :
        apps.map(app => (
          <div key={app.id} className="rounded-3xl border bg-card p-5 shadow-elegant flex justify-between items-center">
            <div>
              <h3 className="font-serif text-lg">{app.full_name}</h3>
              <p className="text-xs text-muted-foreground">{app.email} · {app.country} · {app.years_experience} <T>yrs</T> · {app.specialization}</p>
              {app.cv_url && <a href={app.cv_url} target="_blank" className="text-xs text-amber-600 hover:underline inline-flex items-center gap-1 mt-1"><ExternalLink size={12} /> <T>View CV</T></a>}
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleAction(app.id, 'rejected')} className="px-3 py-1 rounded-full border border-red-500/30 text-red-600 text-sm"><T>Reject</T></button>
              <button onClick={() => handleAction(app.id, 'approved')} className="px-3 py-1 rounded-full bg-emerald-600 text-white text-sm"><T>Approve</T></button>
            </div>
          </div>
        ))
      }
    </div>
  );
}

/* ─────────── Course Moderation Tab (Updated) ─────────── */
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

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;

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
          {/* Pending Courses */}
          {courses.length > 0 && (
            <div>
              <h3 className="font-serif text-lg mb-3 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-amber-500" /> <T>Courses</T> ({courses.length})
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

          {/* Pending Lessons */}
          {lessons.length > 0 && (
            <div>
              <h3 className="font-serif text-lg mb-3 flex items-center gap-2">
                <Video className="h-5 w-5 text-amber-500" /> <T>Lessons</T> ({lessons.length})
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

/* ─────────── User Management Tab (Enhanced) ─────────── */
function UserManagementTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showMessageModal, setShowMessageModal] = useState<any>(null);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch('/api/admin/users').then(r => r.json()).then(d => setUsers(d.users));
  }, []);

  const toggleBan = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    await fetch(`/api/admin/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: newStatus } : u));
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

  const filteredUsers = users.filter(u =>
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
            onChange={(e) => setSearchTerm(e.target.value)}
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
              <td className="px-5 py-4">{u.full_name}<br /><span className="text-xs text-muted-foreground">{u.email}</span></td>
              <td>{u.role}</td>
              <td>{u.status}</td>
              <td>{new Date(u.created_at).toLocaleDateString()}</td>
              <td className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <button onClick={() => { setSelectedUser(u); setShowProfile(true); }} className="p-1.5 rounded-full hover:bg-accent" title="View Profile"><Eye className="h-4 w-4" /></button>
                  <button onClick={() => setShowMessageModal(u)} className="p-1.5 rounded-full hover:bg-accent" title="Send Message"><Mail className="h-4 w-4" /></button>
                  <button onClick={() => toggleBan(u.id, u.status)} className={`px-2 py-1 rounded-full text-xs ${u.status === 'Active' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    {u.status === 'Active' ? <T>Ban</T> : <T>Unban</T>}
                  </button>
                  <button onClick={() => setShowDeleteConfirm(u.id)} className="p-1.5 rounded-full hover:bg-red-100 text-red-500" title="Delete"><Trash2 className="h-4 w-4" /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* View Profile Modal */}
      {showProfile && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card rounded-3xl p-6 max-w-md w-full shadow-elegant space-y-3">
            <h3 className="font-serif text-xl">{selectedUser.full_name}</h3>
            <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
            <p className="text-sm"><T>Role</T>: {selectedUser.role}</p>
            <p className="text-sm"><T>Status</T>: {selectedUser.status}</p>
            <p className="text-sm"><T>Joined</T>: {new Date(selectedUser.created_at).toLocaleDateString()}</p>
            <button onClick={() => setShowProfile(false)} className="mt-4 rounded-full border px-4 py-2 text-sm"><T>Close</T></button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card rounded-3xl p-6 max-w-sm w-full shadow-elegant text-center space-y-4">
            <Trash2 className="mx-auto h-10 w-10 text-red-500" />
            <p className="font-medium"><T>Are you sure you want to delete this user?</T></p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setShowDeleteConfirm(null)} className="rounded-full border px-4 py-2 text-sm"><T>Cancel</T></button>
              <button onClick={() => deleteUser(showDeleteConfirm)} className="rounded-full bg-red-600 text-white px-4 py-2 text-sm"><T>Delete</T></button>
            </div>
          </div>
        </div>
      )}

      {/* Send Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card rounded-3xl p-6 max-w-md w-full shadow-elegant space-y-4">
            <h3 className="font-serif text-xl"><T>Send Message to</T> {showMessageModal.full_name}</h3>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              rows={4}
              className="w-full rounded-2xl border bg-background p-4 text-sm"
              placeholder="Type your message..."
            />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowMessageModal(null)} className="rounded-full border px-4 py-2 text-sm"><T>Cancel</T></button>
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

/* ─────────── Financial Center Tab ─────────── */
function FinancialCenterTab() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  useEffect(() => {
    fetch('/api/admin/finance').then(r => r.json()).then(d => {
      setTransactions(d.transactions); setPayouts(d.payouts);
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

/* ─────────── Messaging Tab (New) ─────────── */
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
                onChange={(e) => setMessage(e.target.value)}
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

/* ─────────── Notifications Tab (New) ─────────── */
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
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-2xl border bg-background px-4 py-3 text-sm mt-1" placeholder="Notification title" />
        </div>
        <div>
          <label className="text-sm font-medium"><T>Body</T></label>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} className="w-full rounded-2xl border bg-background p-4 text-sm mt-1" placeholder="Notification body..." />
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
          <textarea rows={4} value={config.systemPrompt} onChange={e => setConfig({...config, systemPrompt: e.target.value})}
            className="w-full rounded-2xl border bg-background p-4 text-sm mt-1" />
        </div>
        <div>
          <label className="block text-sm font-medium"><T>Model</T></label>
          <select value={config.model} onChange={e => setConfig({...config, model: e.target.value})}
            className="w-full rounded-2xl border bg-background px-4 py-2 text-sm mt-1">
            <option>gpt-5.2</option>
            <option>gpt-5.2-mini</option>
            <option>claude-sonnet-4.5</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium"><T>Temperature</T></label>
            <input type="number" step={0.1} value={config.temperature} onChange={e => setConfig({...config, temperature: parseFloat(e.target.value)})}
              className="w-full rounded-2xl border bg-background px-4 py-2 text-sm mt-1" />
          </div>
          <div>
            <label className="block text-sm font-medium"><T>Max Tokens</T></label>
            <input type="number" value={config.maxTokens} onChange={e => setConfig({...config, maxTokens: parseInt(e.target.value)})}
              className="w-full rounded-2xl border bg-background px-4 py-2 text-sm mt-1" />
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