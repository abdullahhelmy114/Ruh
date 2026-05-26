import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Award, Users, BookOpen, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Ruhulqudus Academy — Elite Arabic Language Learning",
  description: "An elite digital institution for the Arabic language led by Dr. Gehan Ali Ahmed.",
};

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 left-1/3 h-96 w-96 rounded-full bg-gold/20 blur-3xl" />
          <div className="absolute right-0 top-40 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        </div>

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 md:grid-cols-2 md:px-8 md:py-28">
          <div className="animate-fade-in-up">
            <div className="text-xs uppercase tracking-[0.3em] text-gold ornament">Est. by Dr. Jehan Ali Ahmed</div>
            <h1 className="mt-5 font-serif text-5xl leading-[1.05] md:text-7xl">
              The art of <em className="text-gold">Arabic</em>,<br />taught with reverence.
            </h1>
            <p className="mt-6 max-w-lg text-lg text-muted-foreground">
              An elite academy for those who seek mastery of the Arabic language —
              classical, modern, and Quranic — through live mentorship and timeless curriculum.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-full gradient-emerald px-6 py-3 text-sm font-semibold text-white shadow-elegant transition hover:scale-[1.02]"
              >
                Begin Your Journey <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-2 rounded-full border bg-card px-6 py-3 text-sm font-semibold transition hover:bg-accent"
              >
                Browse Courses
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-6 border-t pt-6">
              {[
                { v: "12K+", l: "Students" },
                { v: "98%", l: "Completion" },
                { v: "20+", l: "Years Teaching" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="font-serif text-2xl text-gold">{s.v}</div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative animate-fade-in-scale">
            <div className="absolute -inset-6 rounded-[2.5rem] bg-gold/20 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2.5rem] gradient-hero p-10 shadow-elegant">
              {/* hero-text → أسود في light، أبيض في dark تلقائياً */}
              <div
                className="hero-text text-right text-7xl leading-tight"
                style={{ fontFamily: "Amiri, serif" }}
              >
                ٱقْرَأْ
              </div>
              <div className="hero-accent mt-2 text-right text-sm">
                Read · The first command
              </div>

              <div className="mt-10 space-y-4">
                {[
                  { icon: <Award className="h-4 w-4" />, t: "Certified Teacher Program" },
                  { icon: <Users className="h-4 w-4" />, t: "Live Cohorts via Zoom" },
                  { icon: <BookOpen className="h-4 w-4" />, t: "A1 — C2 Curriculum" },
                ].map((f) => (
                  <div key={f.t} className="hero-row-bg flex items-center gap-3 rounded-2xl p-3 backdrop-blur">
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-gold text-gold-foreground">
                      {f.icon}
                    </div>
                    <span className="hero-text-muted text-sm">{f.t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <div className="text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-gold ornament">The Academy</div>
          <h2 className="mt-3 font-serif text-4xl">Three pillars of mastery</h2>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            { t: "Curriculum", d: "Built on classical pedagogy and modern linguistic science.", i: <BookOpen /> },
            { t: "Mentorship", d: "Live guidance from certified scholars in intimate cohorts.", i: <Users /> },
            { t: "Certification", d: "Earn recognized credentials to teach the Arabic language.", i: <Award /> },
          ].map((p) => (
            <div key={p.t} className="rounded-3xl border bg-card p-8 shadow-elegant">
              <div className="grid h-12 w-12 place-items-center rounded-2xl gradient-emerald text-white">
                {p.i}
              </div>
              <h3 className="mt-5 font-serif text-2xl">{p.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{p.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-20 md:px-8">
        <div className="relative overflow-hidden rounded-3xl gradient-hero p-10 shadow-elegant md:p-16">
          <Sparkles className="hero-accent absolute right-10 top-10 h-8 w-8" />
          <div className="relative max-w-2xl">
            {/* hero-text → أسود في light، أبيض في dark تلقائياً */}
            <h2 className="hero-text font-serif text-4xl md:text-5xl">
              A tradition of excellence, now at your fingertips.
            </h2>
            <p className="hero-text-muted mt-4">
              Whether you're beginning your first letter or refining your scholarly voice, the Academy welcomes you.
            </p>
            <Link
              href="/signup"
              className="mt-8 inline-flex items-center gap-2 rounded-full gradient-gold px-6 py-3 text-sm font-semibold text-gold-foreground shadow-gold"
            >
              Enroll Today <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}