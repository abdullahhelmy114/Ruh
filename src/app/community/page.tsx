"use client";

import { MessageCircle, Heart, Pin, Plus } from "lucide-react";
import { T } from "@/components/TranslatedText";

const threads = [
  { author: "Dr. Jehan", role: "Instructor", title: "Weekly Conversation Challenge — Travel Vocabulary", replies: 42, likes: 128, pinned: true, time: "2h" },
  { author: "Yusuf", role: "Student", title: "Help understanding the difference between إنّ and أنّ", replies: 18, likes: 36, time: "4h" },
  { author: "Aisha", role: "Student", title: "Best resources for memorizing 100 verbs?", replies: 27, likes: 54, time: "1d" },
  { author: "Ustadh Khalid", role: "Teacher", title: "Sharing my curriculum for B1 conversational fluency", replies: 12, likes: 88, time: "2d" },
];

export default function CommunityPage() {
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

          <button className="mt-8 inline-flex items-center gap-3 rounded-full gradient-gold px-8 py-4 text-sm font-bold text-gold-foreground shadow-xl transition hover:scale-105 active:scale-95">
            <Plus className="h-5 w-5" /> <T>Start a Thread</T>
          </button>
        </div>
      </header>

      {/* Filter Chips */}
      <div className="flex flex-wrap gap-3">
        {["All", "Grammar", "Vocabulary", "Conversation", "Quranic", "Resources"].map((t, i) => (
          <button
            key={t}
            className={`rounded-full px-5 py-2 text-xs font-semibold transition-all ${
              i === 0
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
        {threads.map((t) => (
          <article
            key={t.title}
            className="group flex gap-4 rounded-3xl border bg-card p-6 shadow-elegant transition-all hover:border-gold/40 hover:shadow-lg"
          >
            <div className="grid h-14 w-14 flex-none place-items-center rounded-2xl gradient-emerald font-serif text-xl text-white shadow-inner">
              {t.author[0]}
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="font-bold text-foreground transition-colors group-hover:text-primary">{t.author}</span>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  t.role === "Instructor" || t.role === "Teacher"
                    ? "border border-gold/20 bg-gold/10 text-gold"
                    : "bg-accent text-muted-foreground"
                }`}>
                  <T>{t.role}</T>
                </span>
                <span>· {t.time}</span>
                {t.pinned && (
                  <span className="inline-flex items-center gap-1 font-bold text-gold">
                    <Pin className="h-3 w-3" /> <T>Pinned</T>
                  </span>
                )}
              </div>

              <h3 className="font-serif text-xl leading-snug text-foreground transition-colors group-hover:text-gold">
                {t.title}
              </h3>

              <div className="mt-4 flex items-center gap-6 text-xs text-muted-foreground">
                <button className="inline-flex items-center gap-1.5 transition-colors hover:text-primary">
                  <MessageCircle className="h-4 w-4" /> {t.replies}
                </button>
                <button className="inline-flex items-center gap-1.5 transition-colors hover:text-red-500">
                  <Heart className="h-4 w-4" /> {t.likes}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}