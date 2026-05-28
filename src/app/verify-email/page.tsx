"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Mail, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { T } from "@/components/TranslatedText";
import { sendEmailVerification } from "firebase/auth";
import { auth } from "@/lib/firebase/client";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "your email";
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState("");

  const handleResend = async () => {
    const user = auth.currentUser;
    if (!user) return;
    setResending(true);
    try {
      await sendEmailVerification(user);
      setMessage("Verification email resent. Please check your inbox.");
    } catch {
      setMessage("Failed to resend. Please try again later.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="grid min-h-[calc(100vh-4rem)] place-items-center bg-background px-4 py-12">
      <div className="relative w-full max-w-xl">
        <div className="pointer-events-none absolute -inset-10 -z-10 rounded-[3rem] bg-amber-500/20 blur-3xl" />
        <div className="glass rounded-3xl p-8 md:p-10 shadow-elegant text-center">
          <Mail className="mx-auto h-12 w-12 text-amber-500 mb-4" />
          <h1 className="font-serif text-2xl"><T>Check your email</T></h1>
          <p className="mt-3 text-sm text-muted-foreground">
            <T>We sent a verification link to</T>
          </p>
          <p className="text-sm font-semibold text-foreground mt-1">{email}</p>

          {/* 6 مربعات رقمية باهتة للشكل فقط */}
          <div className="flex justify-center gap-3 mt-6">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-12 w-10 rounded-xl border border-border bg-muted/50 flex items-center justify-center text-lg font-mono text-muted-foreground/40 shadow-inner select-none"
              >
                0
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            <T>This is a secure code placeholder.</T>
          </p>

          {message && (
            <p className="mt-4 text-sm text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-full inline-block">
              {message}
            </p>
          )}

          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleResend}
              disabled={resending}
              className="inline-flex items-center justify-center gap-2 rounded-full border bg-background px-5 py-2.5 text-sm font-medium hover:bg-accent disabled:opacity-50"
            >
              {resending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              <T>Resend Email</T>
            </button>
            <button
              onClick={() => router.push("/login")}
              className="inline-flex items-center justify-center gap-2 rounded-full border bg-background px-5 py-2.5 text-sm font-medium hover:bg-accent"
            >
              <ArrowLeft className="h-4 w-4" />
              <T>Back to Sign In</T>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}