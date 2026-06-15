"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  ArrowRight,
  Award,
  Users,
  BookOpen,
  Sparkles,
  PackageOpen,
  ScrollText,
  Shield,
  Globe,
  GraduationCap,
  Heart,
  MessageCircle,
  Calendar,
  ChevronRight,
} from "lucide-react";
import { T } from "@/components/TranslatedText";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.6 },
};

export default function HomePage() {
  const [stats, setStats] = useState<{ students: string; completion: string; experience: string } | null>(null);
  const [featuredCourses, setFeaturedCourses] = useState<any[]>([]);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [bundles, setBundles] = useState<any[]>([]);
  const [certification, setCertification] = useState<any>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then(r => r.json())
      .then(d => setStats(d))
      .catch(() => setStats(null));

    fetch("/api/marketplace?limit=3")
      .then(r => r.json())
      .then(d => setFeaturedCourses((d.courses || []).slice(0, 3)))
      .catch(() => {});

    fetch("/api/blog/posts?limit=3")
      .then(r => r.json())
      .then(d => setBlogPosts((d.posts || []).slice(0, 3)))
      .catch(() => {});

    fetch("/api/bundles")
      .then(r => r.json())
      .then(d => setBundles(d.bundles || []))
      .catch(() => {});

    fetch("/api/certification")
      .then(r => r.json())
      .then(d => setCertification(d))
      .catch(() => {});
  }, []);

  return (
    <div className="relative overflow-hidden bg-[#fdfaf5]">
      {/* إضاءة خلفية شاملة – توهج بيج دافئ من أعلى اليسار */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: "radial-gradient(circle at top left, rgba(245,240,232,0.6), transparent 70%)",
        }}
      />

      <div className="relative z-10">
        {/* ========== Hero Section ========== */}
        <section className="relative overflow-hidden">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 md:grid-cols-2 md:px-8 md:py-28">
            {/* Left Column */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-[#4a4a4a]"
            >
              <div className="text-xs uppercase tracking-[0.3em] text-[#b8a68b] font-light">
                <T>Est. by Dr. Gehan Ali Ahmed</T>
              </div>

              <h1 className="mt-5 font-serif text-5xl leading-[1.2] md:text-7xl font-light text-[#2c3a4a]">
                <T>The art of</T>{" "}
                <em className="text-[#8b7a62] font-normal">
                  <T>Arabic</T>
                </em>
                ,<br />
                <T>taught with reverence.</T>
              </h1>

              <p className="mt-6 max-w-lg text-lg leading-relaxed text-[#5a5a5a] font-light">
                <T>An elite academy for those who seek mastery of the Arabic language — classical, modern, and Quranic — through live mentorship and timeless curriculum.</T>
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-full border border-[#d4c8b8] px-6 py-3 text-sm font-light text-[#4a4a4a] hover:text-[#2c3a4a] hover:border-[#8b7a62] transition-colors"
                >
                  <T>Begin Your Journey</T>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/marketplace"
                  className="inline-flex items-center gap-2 rounded-full border border-[#d4c8b8] px-6 py-3 text-sm font-light text-[#4a4a4a] hover:text-[#2c3a4a] hover:border-[#8b7a62] transition-colors"
                >
                  <T>Browse Courses</T>
                </Link>
              </div>

              {/* Stats أسفل الأزرار مباشرة */}
              {stats && (
                <div className="mt-12 grid grid-cols-3 gap-6">
                  <div>
                    <div className="font-serif text-3xl font-light text-[#8b7a62]">{stats.students}</div>
                    <div className="text-xs uppercase tracking-wider text-[#7a7a7a] font-light">
                      <T>Students</T>
                    </div>
                  </div>
                  <div>
                    <div className="font-serif text-3xl font-light text-[#8b7a62]">{stats.completion}</div>
                    <div className="text-xs uppercase tracking-wider text-[#7a7a7a] font-light">
                      <T>Completion</T>
                    </div>
                  </div>
                  <div>
                    <div className="font-serif text-3xl font-light text-[#8b7a62]">{stats.experience}</div>
                    <div className="text-xs uppercase tracking-wider text-[#7a7a7a] font-light">
                      <T>Years Teaching</T>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Right Column – بطاقة الآية بتصميم كحلي وبيج */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative flex justify-center md:justify-end"
            >
              <div
                className="relative w-full max-w-[300px] rounded-2xl p-8 text-white shadow-[-10px_-10px_30px_rgba(0,0,0,0.05),20px_20px_40px_rgba(0,0,0,0.02)]"
                style={{
                  background: "radial-gradient(circle at top left, rgba(245,240,232,0.4), transparent), linear-gradient(135deg, #1e3a5f, #0a1929)",
                }}
              >
                {/* توهج إضافي */}
                <div className="absolute -top-10 -left-10 h-20 w-20 rounded-full bg-white/10 blur-xl" />

                <div
                  className="text-right text-6xl leading-tight"
                  style={{ fontFamily: "Amiri, serif" }}
                >
                  ٱقْرَأْ
                </div>
                <div className="mt-2 text-right text-sm text-[#e8dcc8] font-light">
                  <T>Read</T> · <T>The first command</T>
                </div>

                <div className="mt-10 space-y-4">
                  {[
                    { icon: <Award className="h-4 w-4" />, t: "Certified Teacher Program" },
                    { icon: <Users className="h-4 w-4" />, t: "Live Cohorts via Zoom" },
                    { icon: <BookOpen className="h-4 w-4" />, t: "A1 — C2 Curriculum" },
                  ].map(f => (
                    <div
                      key={f.t}
                      className="flex items-center gap-3 rounded-xl bg-white/5 p-3 backdrop-blur"
                    >
                      <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#e8dcc8] text-[#0a1929]">
                        {f.icon}
                      </div>
                      <span className="text-sm font-light text-white/90">
                        <T>{f.t}</T>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ========== Three Pillars ========== */}
        <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
          <div className="text-center">
            <div className="text-xs uppercase tracking-[0.3em] text-[#b8a68b] font-light">
              <T>The Academy</T>
            </div>
            <h2 className="mt-3 font-serif text-4xl font-light text-[#2c3a4a]">
              <T>Three pillars of mastery</T>
            </h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              { t: "Curriculum", d: "Built on classical pedagogy and modern linguistic science.", i: <BookOpen className="h-6 w-6" /> },
              { t: "Mentorship", d: "Live guidance from certified scholars in intimate cohorts.", i: <Users className="h-6 w-6" /> },
              { t: "Certification", d: "Earn recognized credentials to teach the Arabic language.", i: <Award className="h-6 w-6" /> },
            ].map((p, i) => (
              <motion.div
                key={p.t}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="group rounded-3xl border border-[#e8dcc8] bg-white p-8 shadow-sm hover:shadow-md transition-all"
              >
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#f5f0e8] text-[#8b7a62]">
                  {p.i}
                </div>
                <h3 className="mt-5 font-serif text-2xl font-light text-[#2c3a4a]">
                  <T>{p.t}</T>
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#5a5a5a] font-light">
                  <T>{p.d}</T>
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ========== Featured Courses ========== */}
        {featuredCourses.length > 0 && (
          <section className="py-20 bg-[#fdfaf5]">
            <div className="mx-auto max-w-7xl px-4 md:px-8">
              <motion.div {...fadeInUp} className="text-center">
                <div className="text-xs font-bold uppercase tracking-[0.3em] text-[#b8a68b] font-light">
                  <T>Featured Courses</T>
                </div>
                <h2 className="mt-3 font-serif text-4xl md:text-5xl font-light text-[#2c3a4a]">
                  <T>Start your Arabic journey</T>
                </h2>
              </motion.div>

              <div className="mt-12 grid gap-6 md:grid-cols-3">
                {featuredCourses.map((course, i) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    className="group overflow-hidden rounded-3xl border border-[#e8dcc8] bg-white shadow-sm hover:shadow-md transition-all"
                  >
                    <Link href={`/courses/${course.id}`}>
                      <div className="h-40 bg-gradient-to-br from-[#f5f0e8] to-[#e8dcc8] flex items-center justify-center relative overflow-hidden">
                        {course.image_url ? (
                          <Image src={course.image_url} alt={course.title} fill className="object-cover" />
                        ) : (
                          <BookOpen className="h-12 w-12 text-[#b8a68b]" />
                        )}
                        <span className="absolute top-3 right-3 rounded-full bg-black/20 px-3 py-1 text-xs font-light text-white backdrop-blur-sm">
                          {course.level}
                        </span>
                      </div>
                    </Link>
                    <div className="p-5">
                      <Link href={`/courses/${course.id}`}>
                        <h3 className="font-serif text-lg font-light text-[#2c3a4a] hover:text-[#8b7a62] transition-colors line-clamp-1">
                          {course.title}
                        </h3>
                      </Link>
                      <p className="mt-1 text-xs text-[#7a7a7a] font-light">
                        <T>by</T> {course.teacher_name}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="font-serif text-2xl font-light text-[#8b7a62]">
                          {course.price === 0 ? <T>Free</T> : `$${course.price}`}
                        </span>
                        <Link
                          href={`/courses/${course.id}`}
                          className="rounded-full border border-[#d4c8b8] px-4 py-1.5 text-xs font-light text-[#4a4a4a] hover:text-[#2c3a4a] hover:border-[#8b7a62] transition"
                        >
                          <T>Learn More</T>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ========== Bundles ========== */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <motion.div {...fadeInUp} className="text-center">
              <div className="text-xs font-bold uppercase tracking-[0.3em] text-[#b8a68b] font-light">
                <T>Bundles</T>
              </div>
              <h2 className="mt-3 font-serif text-4xl md:text-5xl font-light text-[#2c3a4a]">
                <T>Curated learning paths</T>
              </h2>
            </motion.div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {bundles.length > 0 ? (
                bundles.map((bundle, i) => (
                  <motion.div
                    key={bundle.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    className="group overflow-hidden rounded-3xl border border-[#e8dcc8] bg-white shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="h-40 bg-gradient-to-br from-[#f5f0e8] to-[#e8dcc8] flex items-center justify-center">
                      <PackageOpen className="h-16 w-16 text-[#b8a68b]" />
                    </div>
                    <div className="p-5">
                      <h3 className="font-serif text-lg font-light text-[#2c3a4a]">{bundle.name}</h3>
                      <p className="mt-1 text-xs text-[#7a7a7a] font-light line-clamp-2">{bundle.description}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="font-serif text-2xl font-light text-[#8b7a62]">
                          ${bundle.price}
                        </span>
                        <Link
                          href="/bundles"
                          className="rounded-full border border-[#d4c8b8] px-4 py-1.5 text-xs font-light text-[#4a4a4a] hover:text-[#2c3a4a] hover:border-[#8b7a62] transition"
                        >
                          <T>View</T>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="md:col-span-3 flex flex-col items-center justify-center py-12 text-center">
                  <PackageOpen className="h-16 w-16 text-[#d4c8b8] mb-4" />
                  <p className="text-[#5a5a5a] text-lg font-light">
                    <T>No bundles available yet.</T>
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ========== Certification ========== */}
        <section className="py-20 bg-[#fdfaf5]">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <motion.div {...fadeInUp} className="text-center">
              <div className="text-xs font-bold uppercase tracking-[0.3em] text-[#b8a68b] font-light">
                <T>Certification</T>
              </div>
              <h2 className="mt-3 font-serif text-4xl md:text-5xl font-light text-[#2c3a4a]">
                <T>Become a certified Arabic teacher</T>
              </h2>
            </motion.div>

            <div className="mt-12 flex flex-col md:flex-row items-center gap-10">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="flex-1"
              >
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: <ScrollText className="h-6 w-6" />, text: "Internationally Recognized" },
                    { icon: <Shield className="h-6 w-6" />, text: "Trusted by Institutions" },
                    { icon: <Globe className="h-6 w-6" />, text: "Global Community" },
                    { icon: <Award className="h-6 w-6" />, text: "Prestigious Credential" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 rounded-2xl bg-white border border-[#e8dcc8] p-4 shadow-sm">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#f5f0e8] text-[#8b7a62]">
                        {item.icon}
                      </div>
                      <span className="text-sm font-light text-[#4a4a4a]"><T>{item.text}</T></span>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex-1 text-center"
              >
                <div className="inline-block rounded-3xl border-2 border-[#e8dcc8] bg-white p-8 shadow-sm">
                  <GraduationCap className="mx-auto h-16 w-16 text-[#8b7a62]" />
                  <h3 className="mt-4 font-serif text-2xl font-light text-[#2c3a4a]">
                    <T>Your Path to Certification</T>
                  </h3>
                  <p className="mt-2 text-sm text-[#5a5a5a] font-light">
                    {certification?.description || <T>Complete our program and earn a certificate to teach Arabic anywhere in the world.</T>}
                  </p>
                  <Link
                    href="/certification"
                    className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#8b7a62] bg-[#f5f0e8] px-6 py-3 text-sm font-light text-[#2c3a4a] hover:bg-[#e8dcc8] transition-colors"
                  >
                    <T>Learn More</T> <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ========== Blog ========== */}
        {blogPosts.length > 0 && (
          <section className="py-20">
            <div className="mx-auto max-w-7xl px-4 md:px-8">
              <motion.div {...fadeInUp} className="text-center">
                <div className="text-xs font-bold uppercase tracking-[0.3em] text-[#b8a68b] font-light">
                  <T>From Our Blog</T>
                </div>
                <h2 className="mt-3 font-serif text-4xl md:text-5xl font-light text-[#2c3a4a]">
                  <T>Tips, news & inspiration</T>
                </h2>
              </motion.div>

              <div className="mt-12 grid gap-6 md:grid-cols-3">
                {blogPosts.map((post, i) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    className="group overflow-hidden rounded-3xl border border-[#e8dcc8] bg-white shadow-sm hover:shadow-md transition-all"
                  >
                    {post.image_url && (
                      <div className="h-40 relative overflow-hidden">
                        <Image
                          src={post.image_url}
                          alt={post.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                    )}
                    <div className="p-5">
                      <div className="flex items-center gap-2 text-xs text-[#7a7a7a] font-light">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(post.created_at).toLocaleDateString()}
                        <span className="flex items-center gap-1 ml-auto">
                          <Heart className="h-3.5 w-3.5" /> {post.likes_count}
                          <MessageCircle className="h-3.5 w-3.5 ml-2" /> {post.comments_count}
                        </span>
                      </div>
                      <Link href={`/blog/${post.id}`}>
                        <h3 className="mt-2 font-serif text-lg font-light text-[#2c3a4a] hover:text-[#8b7a62] transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                      </Link>
                      <p className="mt-2 text-xs text-[#5a5a5a] font-light line-clamp-2">{post.excerpt}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-10 text-center">
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 rounded-full border border-[#d4c8b8] px-6 py-3 text-sm font-light text-[#4a4a4a] hover:text-[#2c3a4a] hover:border-[#8b7a62] transition"
                >
                  <T>Read More Posts</T> <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ========== Final CTA ========== */}
        <section className="py-20">
          <div className="mx-auto max-w-4xl px-4 text-center md:px-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0a1929] to-[#1e3a5f] p-10 text-white shadow-2xl md:p-16"
              style={{
                boxShadow: "-10px -10px 30px rgba(0,0,0,0.05), 20px 20px 40px rgba(0,0,0,0.02)",
              }}
            >
              <div className="absolute -top-10 -left-10 h-32 w-32 rounded-full bg-[#e8dcc8]/10 blur-2xl" />
              <Sparkles className="absolute right-10 top-10 h-8 w-8 text-[#e8dcc8]" />
              <div className="relative max-w-2xl">
                <h2 className="font-serif text-4xl md:text-5xl font-light text-white">
                  <T>A tradition of excellence, now at your fingertips.</T>
                </h2>
                <p className="mt-4 text-white/70 font-light">
                  <T>Whether you're beginning your first letter or refining your scholarly voice, the Academy welcomes you.</T>
                </p>
                <Link
                  href="/signup"
                  className="mt-8 inline-flex items-center gap-2 rounded-full border border-[#e8dcc8] bg-[#f5f0e8] px-6 py-3 text-sm font-light text-[#0a1929] hover:bg-[#e8dcc8] transition-colors"
                >
                  <T>Enroll Today</T>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}