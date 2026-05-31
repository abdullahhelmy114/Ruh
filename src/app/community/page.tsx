"use client";

import { useState } from "react";
import { MessageCircle, Heart, Pin, Plus, Send, User, UserPlus, ArrowRight } from "lucide-react";
import { T } from "@/components/TranslatedText";
import { useAuth } from "@/lib/firebase/AuthProvider";
import Link from "next/link";

interface Thread {
  id: string;
  author: string;
  role: string;
  title: string;
  content: string;
  replies: number;
  likes: number;
  pinned?: boolean;
  time: string;
  liked?: boolean;
}

const initialThreads: Thread[] = [
  {
    id: "1",
    author: "Dr. Jehan",
    role: "Instructor",
    title: "Weekly Conversation Challenge — Travel Vocabulary",
    content: "Share your favorite Arabic travel phrases and practice them with fellow learners!",
    replies: 42,
    likes: 128,
    pinned: true,
    time: "2h",
  },
  {
    id: "2",
    author: "Yusuf",
    role: "Student",
    title: "Help understanding the difference between إنّ and أنّ",
    content: "I keep confusing these two particles. Can someone explain with examples?",
    replies: 18,
    likes: 36,
    time: "4h",
  },
  {
    id: "3",
    author: "Aisha",
    role: "Student",
    title: "Best resources for memorizing 100 verbs?",
    content: "Looking for effective methods to memorize common Arabic verbs quickly.",
    replies: 27,
    likes: 54,
    time: "1d",
  },
  {
    id: "4",
    author: "Ustadh Khalid",
    role: "Teacher",
    title: "Sharing my curriculum for B1 conversational fluency",
    content: "I've developed a 12-week curriculum focused on speaking. Happy to share!",
    replies: 12,
    likes: 88,
    time: "2d",
  },
];

export default function CommunityPage() {
  const { user } = useAuth();
  const [threads, setThreads] = useState<Thread[]>(initialThreads);
  const [filter, setFilter] = useState("All");
  const [showNewThread, setShowNewThread] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");

  const filters = ["All", "Grammar", "Vocabulary", "Conversation", "Quranic", "Resources"];

  const filteredThreads =
    filter === "All" ? threads : threads.filter((t) => t.title.toLowerCase().includes(filter.toLowerCase()));

  const handleLike = (id: string) => {
    setThreads((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, likes: t.liked ? t.likes - 1 : t.likes + 1, liked: !t.liked }
          : t
      )
    );
  };

  const handleCreateThread = () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    const newThread: Thread = {
      id: Date.now().toString(),
      author: user?.email?.split("@")[0] || "Anonymous",
      role: "Student",
      title: newTitle,
      content: newContent,
      replies: 0,
      likes: 0,
      time: "Just now",
    };
    setThreads([newThread, ...threads]);
    setNewTitle("");
    setNewContent("");
    setShowNewThread(false);
  };

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
              <Link
                href="/signup?role=student"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                <T>Join as Student</T> <ArrowRight size={16} />
              </Link>
              <Link
                href="/signup?role=teacher"
                className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-black hover:bg-amber-400"
              >
                <T>Join as Teacher</T> <ArrowRight size={16} />
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
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Thread title"
              className="w-full rounded-2xl border bg-background px-4 py-3 text-sm"
            />
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows={4}
              placeholder="Share your thoughts..."
              className="w-full rounded-2xl border bg-background px-4 py-3 text-sm"
            />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowNewThread(false)} className="rounded-full border px-4 py-2 text-sm">
                <T>Cancel</T>
              </button>
              <button onClick={handleCreateThread} className="rounded-full bg-amber-500 px-6 py-2 text-sm font-semibold text-black">
                <T>Post</T>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Chips */}
      <div className="flex flex-wrap gap-3">
        {filters.map((t, i) => (
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
      <div className="space-y-4">
        {filteredThreads.map((t) => (
          <article
            key={t.id}
            className="group flex gap-4 rounded-3xl border bg-card p-6 shadow-elegant transition-all hover:border-gold/40 hover:shadow-lg"
          >
            <div className="grid h-14 w-14 flex-none place-items-center rounded-2xl gradient-emerald font-serif text-xl text-white shadow-inner">
              {t.author[0]}
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="font-bold text-foreground">{t.author}</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    t.role === "Instructor" || t.role === "Teacher"
                      ? "border border-gold/20 bg-gold/10 text-gold"
                      : "bg-accent text-muted-foreground"
                  }`}
                >
                  <T>{t.role}</T>
                </span>
                <span>· {t.time}</span>
                {t.pinned && (
                  <span className="inline-flex items-center gap-1 font-bold text-gold">
                    <Pin className="h-3 w-3" /> <T>Pinned</T>
                  </span>
                )}
              </div>
              <h3 className="font-serif text-xl leading-snug text-foreground">{t.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t.content}</p>
              <div className="mt-4 flex items-center gap-6 text-xs text-muted-foreground">
                <button className="inline-flex items-center gap-1.5 transition-colors hover:text-primary">
                  <MessageCircle className="h-4 w-4" /> {t.replies}
                </button>
                <button
                  onClick={() => handleLike(t.id)}
                  className={`inline-flex items-center gap-1.5 transition-colors ${
                    t.liked ? "text-red-500" : "hover:text-red-500"
                  }`}
                >
                  <Heart className={`h-4 w-4 ${t.liked ? "fill-current" : ""}`} /> {t.likes}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}