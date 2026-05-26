import { motion } from "framer-motion";
import { Star, Clock, Video, BookOpen } from "lucide-react";

const courses = [
  { title: "Foundations of Arabic — A1", type: "Recorded", price: 49, level: "A1", rating: 4.9, duration: "12h" },
  { title: "Conversational Mastery — B1", type: "Live Online", price: 100, level: "B1", rating: 5.0, duration: "8 weeks" },
  { title: "Quranic Arabic Essentials", type: "Recorded", price: 49, level: "A2", rating: 4.8, duration: "16h" },
  { title: "Advanced Iʿrāb & Grammar", type: "Live Online", price: 100, level: "C1", rating: 4.9, duration: "10 weeks" },
  { title: "Media & Modern Standard", type: "Recorded", price: 49, level: "B2", rating: 4.7, duration: "14h" },
  { title: "Classical Texts Reading", type: "Live Online", price: 100, level: "C2", rating: 5.0, duration: "12 weeks" },
];

export function CourseGrid() {
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {courses.map((c, i) => (
        <motion.div
          key={c.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="group overflow-hidden rounded-3xl border bg-card shadow-elegant transition hover:-translate-y-1"
        >
          <div className="relative h-32 gradient-emerald">
            <div className="absolute inset-0 opacity-30" style={{ background: "radial-gradient(circle at 30% 30%, white, transparent 60%)" }} />
            <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs text-primary-foreground backdrop-blur">
              {c.type === "Live Online" ? <Video className="h-3 w-3" /> : <BookOpen className="h-3 w-3" />}
              {c.type}
            </div>
            <div className="absolute right-4 top-4 rounded-full bg-gold px-2.5 py-1 text-xs font-bold text-gold-foreground">
              {c.level}
            </div>
            <div className="absolute bottom-3 left-4 font-serif text-3xl text-primary-foreground">${c.price}</div>
          </div>
          <div className="p-5">
            <h3 className="font-serif text-lg leading-snug">{c.title}</h3>
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1"><Star className="h-3 w-3 fill-gold text-gold" /> {c.rating}</span>
              <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {c.duration}</span>
            </div>
            <button className="mt-4 w-full rounded-full bg-primary py-2.5 text-xs font-semibold text-primary-foreground transition group-hover:gradient-gold group-hover:text-gold-foreground">
              Enroll Now
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
