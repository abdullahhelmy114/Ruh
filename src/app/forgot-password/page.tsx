"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { T } from "@/components/TranslatedText";
import { Mail, ArrowLeft, Loader2, Send } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    try {
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/login`,
        handleCodeInApp: false,
      });
      setSent(true);
    } catch (err: any) {
      setError(err.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-[calc(100vh-4rem)] place-items-center bg-background px-4 py-12">
      <div className="relative w-full max-w-md">
        <div className="pointer-events-none absolute -inset-10 -z-10 rounded-[3rem] bg-amber-500/20 blur-3xl" />
        <div className="glass rounded-3xl p-8 md:p-10 shadow-elegant text-center">
          {sent ? (
            <>
              <Send className="mx-auto h-12 w-12 text-emerald-500 mb-4" />
              <h1 className="font-serif text-2xl"><T>Check Your Email</T></h1>
              <p className="mt-2 text-sm text-muted-foreground">
                <T>We have sent a password reset link to your email.</T>
              </p>
              <Link
                href="/login"
                className="mt-6 inline-flex items-center gap-2 text-amber-600 hover:underline"
              >
                <ArrowLeft size={16} /> <T>Back to Sign In</T>
              </Link>
            </>
          ) : (
            <>
              <Mail className="mx-auto h-12 w-12 text-amber-500 mb-4" />
              <h1 className="font-serif text-2xl"><T>Forgot Password?</T></h1>
              <p className="mt-2 text-sm text-muted-foreground">
                <T>Enter your email and we will send you a reset link.</T>
              </p>
              <form onSubmit={handleReset} className="mt-6 space-y-4">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-2xl border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gold"
                  dir="ltr"
                />
                {error && <p className="text-sm text-red-500">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-amber-500 py-3 text-sm font-semibold text-black hover:bg-amber-400 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                  ) : (
                    <T>Send Reset Link</T>
                  )}
                </button>
              </form>
              <Link
                href="/login"
                className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:underline"
              >
                <ArrowLeft size={16} /> <T>Back to Sign In</T>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}