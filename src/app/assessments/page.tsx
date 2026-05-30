import { T } from "@/components/TranslatedText";
import { GraduationCap, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function AssessmentsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 md:px-8">
      <div className="text-center mb-10">
        <GraduationCap className="mx-auto h-12 w-12 text-amber-500 mb-4" />
        <h1 className="font-serif text-4xl"><T>Placement Tests</T></h1>
        <p className="mt-2 text-muted-foreground"><T>Find your perfect starting point.</T></p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {[
          { title: "Beginner (A1-A2)", desc: "For those new to Arabic." },
          { title: "Intermediate (B1-B2)", desc: "You can read and hold basic conversations." },
          { title: "Advanced (C1-C2)", desc: "You aim for fluency and classical texts." },
          { title: "Quranic Arabic", desc: "Focus on Quranic vocabulary and grammar." },
        ].map((test) => (
          <div key={test.title} className="glass rounded-3xl p-6 text-center">
            <h3 className="font-serif text-xl"><T>{test.title}</T></h3>
            <p className="text-sm text-muted-foreground mt-2"><T>{test.desc}</T></p>
            <Link href="#" className="mt-4 inline-flex items-center gap-2 text-amber-600 hover:underline text-sm font-medium">
              <T>Start Test</T> <ArrowRight size={16} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}