"use client";

import { useAuth } from "@/lib/firebase/AuthProvider";
import { T } from "@/components/TranslatedText";
import { DollarSign, Users, Gift, Copy, CheckCircle } from "lucide-react";
import { useState } from "react";

export default function AffiliatePage() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const referralCode = user?.uid?.slice(0, 8) || "signup";

  const copyCode = () => {
    navigator.clipboard.writeText(`https://ruhulqudus.net/r/${referralCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 md:px-8">
      <div className="text-center mb-10">
        <DollarSign className="mx-auto h-12 w-12 text-amber-500 mb-4" />
        <h1 className="font-serif text-4xl"><T>Affiliate Program</T></h1>
        <p className="mt-2 text-muted-foreground"><T>Earn 20% commission on every referral.</T></p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-10">
        {[
          { icon: Users, title: "Share", text: "Share your unique link." },
          { icon: Gift, title: "Enroll", text: "Friends join a course." },
          { icon: DollarSign, title: "Earn", text: "Get 20% of their purchase." },
        ].map((item) => (
          <div key={item.title} className="glass rounded-3xl p-6 text-center">
            <item.icon className="mx-auto h-10 w-10 text-amber-500 mb-3" />
            <h3 className="font-serif text-xl"><T>{item.title}</T></h3>
            <p className="text-sm text-muted-foreground mt-2"><T>{item.text}</T></p>
          </div>
        ))}
      </div>

      {user && (
        <div className="glass rounded-3xl p-6 text-center">
          <h3 className="font-serif text-xl mb-2"><T>Your Referral Link</T></h3>
          <div className="flex items-center justify-center gap-2 mt-3">
            <code className="bg-background px-4 py-2 rounded-full text-sm">ruhulqudus.net/r/{referralCode}</code>
            <button onClick={copyCode} className="rounded-full bg-amber-500 p-2 text-black hover:bg-amber-400">
              {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}