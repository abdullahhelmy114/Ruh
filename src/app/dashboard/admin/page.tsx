"use client";

import { useAuth } from "@/lib/firebase/AuthProvider";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users, GraduationCap, DollarSign, TrendingUp, ShieldCheck, FileText,
  CheckCircle2, XCircle, Search, BookOpen, Clock, Wallet,
  Sparkles, Settings2, Crown, AlertCircle, ArrowUpRight, MoreHorizontal,
  Filter, Download, Bot, Save, Loader2, Ban, UserCheck, ExternalLink, Video,
} from "lucide-react";
import { cn } from "@/lib/utils";

type TabKey = "overview" | "teachers" | "courses" | "users" | "finance" | "ai" | "settings";

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: "overview", label: "Overview", icon: TrendingUp },
  { key: "teachers", label: "Teacher Verification", icon: ShieldCheck },
  { key: "courses", label: "Course Moderation", icon: BookOpen },
  { key: "users", label: "User Management", icon: Users },
  { key: "finance", label: "Financial Center", icon: Wallet },
  { key: "ai", label: "AI Configuration", icon: Bot },
  { key: "settings", label: "Site Settings", icon: Settings2 },
];

export default function AdminDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [tab, setTab] = useState<TabKey>("overview");

  if (authLoading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  if (!user) return <div className="flex min-h-screen items-center justify-center"><Link href="/login" className="text-amber-600">تسجيل الدخول</Link></div>;
  if (user.email !== "abdullahhelmy114@gmail.com") return <div className="flex min-h-screen items-center justify-center"><h1 className="text-3xl text-red-600">غير مصرح</h1></div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 rounded-3xl border bg-card p-6 shadow-elegant md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-linear-to-r from-emerald-600 to-emerald-700 ring-4 ring-amber-500/30">
            <Crown className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-amber-600">Management Suite</div>
            <h1 className="font-serif text-3xl">Admin Control Panel</h1>
            <p className="text-sm text-muted-foreground">Oversee the entire Ruhulqudus Academy ecosystem.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 font-medium text-emerald-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> All systems operational
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
              <Icon className="h-4 w-4" /> {t.label}
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
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border bg-card p-6 shadow-elegant lg:col-span-2">
          <h3 className="font-serif text-xl">Revenue Trend (last 30 days)</h3>
          <div className="mt-4 h-40 flex items-end gap-2">
            {Array.from({length:12}).map((_,i)=> <div key={i} className="flex-1 rounded-t bg-linear-to-t from-primary to-amber-500/70" style={{height: `${Math.random()*100}%`}}/>)}
          </div>
        </div>
        <div className="rounded-3xl border bg-card p-6 shadow-elegant">
          <h3 className="font-serif text-xl">Pending Items</h3>
          <ul className="mt-4 space-y-3">
            {pendingList.map(item => {
              const Icon = item.icon;
              return (
                <li key={item.label} className="flex items-center justify-between rounded-2xl border bg-background px-4 py-3">
                  <div className="flex items-center gap-3"><Icon className="h-4 w-4 text-primary" /> {item.label}</div>
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
      <h2 className="font-serif text-2xl">Pending Teacher Applications</h2>
      {apps.length === 0 ? <div className="rounded-3xl border bg-card p-12 text-center text-muted-foreground">No pending applications</div> :
        apps.map(app => (
          <div key={app.id} className="rounded-3xl border bg-card p-5 shadow-elegant flex justify-between items-center">
            <div>
              <h3 className="font-serif text-lg">{app.full_name}</h3>
              <p className="text-xs text-muted-foreground">{app.email} · {app.country} · {app.years_experience} yrs · {app.specialization}</p>
              {app.cv_url && <a href={app.cv_url} target="_blank" className="text-xs text-amber-600 hover:underline inline-flex items-center gap-1 mt-1"><ExternalLink size={12} /> View CV</a>}
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleAction(app.id, 'rejected')} className="px-3 py-1 rounded-full border border-red-500/30 text-red-600 text-sm">Reject</button>
              <button onClick={() => handleAction(app.id, 'approved')} className="px-3 py-1 rounded-full bg-emerald-600 text-white text-sm">Approve</button>
            </div>
          </div>
        ))
      }
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
    await fetch(`/api/lessons/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setLessons(prev => prev.filter(l => l.id !== id));
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;

  const totalPending = courses.length + lessons.length;

  return (
    <div>
      <h2 className="font-serif text-2xl mb-4">Course & Lesson Moderation</h2>
      {totalPending === 0 ? (
        <div className="rounded-3xl border bg-card p-12 text-center text-muted-foreground">
          No pending courses or lessons
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pending Courses */}
          {courses.length > 0 && (
            <div>
              <h3 className="font-serif text-lg mb-3 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-amber-500" /> Courses ({courses.length})
              </h3>
              {courses.map(c => (
                <div key={c.id} className="rounded-2xl border bg-card p-4 mb-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-medium">{c.title}</h4>
                    <p className="text-xs text-muted-foreground">by {c.teacher_name} · Level {c.level} · ${c.price}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Submitted {new Date(c.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleCourseAction(c.id, 'rejected')} className="px-3 py-1 rounded-full border border-red-500/30 text-red-600 text-xs">Reject</button>
                    <button onClick={() => handleCourseAction(c.id, 'published')} className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs">Publish</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pending Lessons */}
          {lessons.length > 0 && (
            <div>
              <h3 className="font-serif text-lg mb-3 flex items-center gap-2">
                <Video className="h-5 w-5 text-amber-500" /> Lessons ({lessons.length})
              </h3>
              {lessons.map(l => (
                <div key={l.id} className="rounded-2xl border bg-card p-4 mb-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-medium">{l.title}</h4>
                    <p className="text-xs text-muted-foreground">Course: {l.course_title} · Type: {l.type}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Submitted {new Date(l.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleLessonAction(l.id, 'rejected')} className="px-3 py-1 rounded-full border border-red-500/30 text-red-600 text-xs">Reject</button>
                    <button onClick={() => handleLessonAction(l.id, 'approved')} className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs">Approve</button>
                  </div>
                </div>
              ))}
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

  return (
    <div>
      <h2 className="font-serif text-2xl mb-4">User Management</h2>
      <table className="w-full text-sm rounded-3xl border bg-card overflow-hidden">
        <thead className="bg-muted/40 text-xs uppercase">
          <tr>
            <th className="px-5 py-3 text-left">User</th><th>Role</th><th>Plan</th><th>Status</th><th>Joined</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u: any) => (
            <tr key={u.id} className="border-t hover:bg-accent/40">
              <td className="px-5 py-4">{u.full_name}<br/><span className="text-xs text-muted-foreground">{u.email}</span></td>
              <td>{u.role}</td><td>{u.plan}</td><td>{u.status}</td><td>{new Date(u.created_at).toLocaleDateString()}</td>
              <td>
                <button onClick={() => toggleBan(u.id, u.status)} className={`px-2 py-1 rounded-full text-xs ${u.status === 'Active' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                  {u.status === 'Active' ? 'Ban' : 'Unban'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
      <h2 className="font-serif text-2xl mb-4">Financial Center</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <h3 className="font-serif text-lg">Recent Transactions</h3>
          {transactions.map((t: any) => (
            <div key={t.id} className="flex justify-between p-2 border-b text-sm">
              <span>{t.user_name} – {t.item_name}</span>
              <span className="font-semibold">${t.amount}</span>
            </div>
          ))}
        </div>
        <div>
          <h3 className="font-serif text-lg">Pending Payouts</h3>
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

/* ─────────── AI Configuration Tab ─────────── */
function AIConfigurationTab() {
  const [config, setConfig] = useState({
    systemPrompt: "You are Nūr, a refined and knowledgeable assistant...",
    model: "gpt-5.2",
    temperature: 0.7,
    maxTokens: 2048,
  });

  const handleSave = () => {
    alert('Configuration saved!');
    // يمكنك إضافة API لحفظ الإعدادات في قاعدة البيانات
  };

  return (
    <div>
      <h2 className="font-serif text-2xl mb-4">AI Configuration</h2>
      <div className="space-y-4 max-w-2xl">
        <div>
          <label className="block text-sm font-medium">System Prompt</label>
          <textarea rows={4} value={config.systemPrompt} onChange={e => setConfig({...config, systemPrompt: e.target.value})}
            className="w-full rounded-2xl border bg-background p-4 text-sm mt-1" />
        </div>
        <div>
          <label className="block text-sm font-medium">Model</label>
          <select value={config.model} onChange={e => setConfig({...config, model: e.target.value})}
            className="w-full rounded-2xl border bg-background px-4 py-2 text-sm mt-1">
            <option>gpt-5.2</option>
            <option>gpt-5.2-mini</option>
            <option>claude-sonnet-4.5</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Temperature</label>
            <input type="number" step={0.1} value={config.temperature} onChange={e => setConfig({...config, temperature: parseFloat(e.target.value)})}
              className="w-full rounded-2xl border bg-background px-4 py-2 text-sm mt-1" />
          </div>
          <div>
            <label className="block text-sm font-medium">Max Tokens</label>
            <input type="number" value={config.maxTokens} onChange={e => setConfig({...config, maxTokens: parseInt(e.target.value)})}
              className="w-full rounded-2xl border bg-background px-4 py-2 text-sm mt-1" />
          </div>
        </div>
        <button onClick={handleSave} className="rounded-full bg-emerald-600 px-6 py-2 text-sm font-semibold text-white">Save Configuration</button>
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
      <h2 className="font-serif text-2xl mb-4">Site Settings</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Site Name</label>
          <input value={siteName} onChange={e => setSiteName(e.target.value)} className="w-full rounded-2xl border bg-background px-4 py-2 text-sm mt-1" />
        </div>
        <div>
          <label className="block text-sm font-medium">Contact Email</label>
          <input value={contactEmail} onChange={e => setContactEmail(e.target.value)} className="w-full rounded-2xl border bg-background px-4 py-2 text-sm mt-1" />
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium">Maintenance Mode</label>
          <button onClick={() => setMaintenanceMode(!maintenanceMode)} className={`h-6 w-11 rounded-full p-0.5 transition-colors ${maintenanceMode ? 'bg-emerald-600' : 'bg-gray-300'}`}>
            <div className={`h-5 w-5 rounded-full bg-white transition-transform ${maintenanceMode ? 'translate-x-5' : ''}`} />
          </button>
        </div>
        <button className="rounded-full bg-emerald-600 px-6 py-2 text-sm font-semibold text-white mt-4">Save Settings</button>
      </div>
    </div>
  );
}