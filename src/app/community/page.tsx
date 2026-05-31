"use client";

import { useEffect, useState } from "react";
import { MessageCircle, Heart, Plus, Send, X, MoreVertical, Trash2 } from "lucide-react";
import { T } from "@/components/TranslatedText";
import { useAuth } from "@/lib/firebase/AuthProvider";
import Link from "next/link";

interface Thread {
  id: string;
  author_name: string;
  author_uid: string;
  title: string;
  content: string;
  likes: number;
  created_at: string;
}

export default function CommunityPage() {
  const { user, role } = useAuth();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewThread, setShowNewThread] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [filter, setFilter] = useState("All");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const fetchThreads = () => {
    setLoading(true);
    fetch('/api/community/threads')
      .then(r => r.json())
      .then(d => setThreads(d.threads || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchThreads(); }, []);

  const handleCreateThread = async () => {
    if (!user || !newTitle.trim() || !newContent.trim()) return;
    await fetch('/api/community/threads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authorUid: user.uid, title: newTitle, content: newContent }),
    });
    setNewTitle("");
    setNewContent("");
    setShowNewThread(false);
    fetchThreads();
  };

  const handleDelete = async (threadId: string) => {
    if (!user) return;
    await fetch('/api/community/threads', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ threadId, userUid: user.uid, isAdmin: role === 'admin' }),
    });
    setMenuOpen(null);
    fetchThreads();
  };

  const canDelete = (authorUid: string) => {
    return role === 'admin' || user?.uid === authorUid;
  };

  const filteredThreads = filter === "All"
    ? threads
    : threads.filter(t => t.title.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="mx-auto max-w-6xl min-h-screen space-y-8 px-4 py-12 md:px-8">
      {/* Header Banner */}
      <header className="gradient-hero relative overflow-hidden rounded-[2.5rem] p-8 shadow-elegant md:p-12">
        <div className="pointer-events-none absolute -mr-20 -mt-20 right-0 top-0 h-80 w-80 rounded-full bg-gold/15 blur-[100px]" />
        <div className="relative z-10">
          <div className="hero-accent text-xs font-bold uppercase tracking-[0.4em]">
            <T>Arabic Community Hub</T>
          </div>
          <h1 className="hero-text mt-4 font-serif text-4xl leading-[1.1] tracking-tight md:text-6xl">
            <T>Where language becomes</T> <br className="hidden md:block" /> <T>conversation.</T>
          </h1>
          <p className="hero-text-muted mt-4 max-w-xl text-lg leading-relaxed">
            <T>Ask, share, practice, and grow alongside students and teachers from around the world.</T>
          </p>
          {user ? (
            <button
              onClick={() => setShowNewThread(true)}
              className="mt-8 inline-flex items-center gap-3 rounded-full gradient-gold px-8 py-4 text-sm font-bold text-gold-foreground shadow-xl transition hover:scale-105 active:scale-95"
            >
              <Plus className="h-5 w-5" /> <T>Start a Thread</T>
            </button>
          ) : (
            <div className="mt-8 flex gap-3">
              <Link href="/signup?role=student" className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700">
                <T>Join as Student</T>
              </Link>
              <Link href="/signup?role=teacher" className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-black hover:bg-amber-400">
                <T>Join as Teacher</T>
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* New Thread Modal */}
      {showNewThread && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card rounded-3xl p-6 max-w-lg w-full shadow-elegant space-y-4">
            <h2 className="font-serif text-2xl"><T>New Thread</T></h2>
            <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Thread title" className="w-full rounded-2xl border bg-background px-4 py-3 text-sm" />
            <textarea value={newContent} onChange={e => setNewContent(e.target.value)} rows={4} placeholder="Share your thoughts..." className="w-full rounded-2xl border bg-background px-4 py-3 text-sm" />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowNewThread(false)} className="rounded-full border px-4 py-2 text-sm"><T>Cancel</T></button>
              <button onClick={handleCreateThread} className="rounded-full bg-amber-500 px-6 py-2 text-sm font-semibold text-black"><T>Post</T></button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Chips */}
      <div className="flex flex-wrap gap-3">
        {["All", "Grammar", "Vocabulary", "Conversation", "Quranic", "Resources"].map((t, i) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`rounded-full px-5 py-2 text-xs font-semibold transition-all ${
              filter === t
                ? "gradient-emerald text-white shadow-md"
                : "border bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <T>{t}</T>
          </button>
        ))}
      </div>

      {/* Threads List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : filteredThreads.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <MessageCircle className="mx-auto h-12 w-12 mb-4 text-amber-500/50" />
          <p><T>No threads yet. Start the conversation!</T></p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredThreads.map((t) => (
            <article
              key={t.id}
              className="group flex gap-4 rounded-3xl border bg-card p-6 shadow-elegant transition-all hover:border-gold/40 hover:shadow-lg relative"
            >
              <div className="grid h-14 w-14 flex-none place-items-center rounded-2xl gradient-emerald font-serif text-xl text-white shadow-inner">
                {t.author_name?.charAt(0) || "?"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-bold text-foreground">{t.author_name}</span>
                  <span>· {new Date(t.created_at).toLocaleString()}</span>
                </div>
                <h3 className="font-serif text-xl leading-snug text-foreground">{t.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t.content}</p>
                <div className="mt-4 flex items-center gap-6 text-xs text-muted-foreground">
                  <button className="inline-flex items-center gap-1.5 transition-colors hover:text-primary">
                    <MessageCircle className="h-4 w-4" /> 0
                  </button>
                  <button className="inline-flex items-center gap-1.5 transition-colors hover:text-red-500">
                    <Heart className="h-4 w-4" /> {t.likes}
                  </button>
                </div>
              </div>

              {/* قائمة النقاط الثلاث */}
              {canDelete(t.author_uid) && (
                <div className="absolute top-4 right-4">
                  <button
                    onClick={() => setMenuOpen(menuOpen === t.id ? null : t.id)}
                    className="p-1 rounded-full hover:bg-accent"
                  >
                    <MoreVertical size={16} />
                  </button>
                  {menuOpen === t.id && (
                    <div className="absolute right-0 mt-1 w-32 rounded-xl border bg-card shadow-elegant z-10">
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={14} /> <T>Delete</T>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}