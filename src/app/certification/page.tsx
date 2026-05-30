import { T } from "@/components/TranslatedText";
import { Shield, CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CertificationPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 md:px-8">
      <div className="text-center mb-10">
        <Shield className="mx-auto h-12 w-12 text-amber-500 mb-4" />
        <h1 className="font-serif text-4xl"><T>Teacher Certification</T></h1>
        <p className="mt-2 text-muted-foreground"><T>Become a certified Ruhulqudus instructor.</T></p>
      </div>

      <div className="glass rounded-3xl p-8 md:p-10 space-y-6">
        <h2 className="font-serif text-2xl text-amber-600"><T>How It Works</T></h2>
        <div className="space-y-4">
          {[
            "Complete the 'How to Teach Arabic' course.",
            "Submit a sample lesson for review.",
            "Pass an interview with Dr. Gehan.",
            "Receive your official certification.",
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <CheckCircle size={18} className="text-emerald-500 mt-0.5" />
              <span className="text-muted-foreground"><T>{step}</T></span>
            </div>
          ))}
        </div>

        <div className="text-center pt-4">
          <Link href="/signup?role=teacher" className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-black hover:bg-amber-400">
            <T>Apply Now</T> <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}