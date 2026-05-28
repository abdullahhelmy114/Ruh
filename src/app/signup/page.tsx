"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { motion } from "framer-motion";
import { Mail, Lock, User, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { T } from "@/components/TranslatedText";
import { CustomCaptcha } from "@/components/CustomCaptcha";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const router = useRouter();

  const completeSignup = useCallback(
    async (token: string) => {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // إرسال كود التحقق
        await fetch("/api/send-verification-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userCredential.user.email }),
        });

        // إرسال بريد الترحيب
        await fetch("/api/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: userCredential.user.email,
            name,
            captchaToken: token,
          }),
        });

        localStorage.setItem("userRole", role);
        router.push(`/verify-email?email=${encodeURIComponent(userCredential.user.email || email)}`);
      } catch (err: any) {
        setError(err.message || "Signup failed");
        setLoading(false);
        setShowCaptcha(false);
      }
    },
    [email, password, name, role, router]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setShowCaptcha(true);
  };

  const handleCustomCaptcha = (token: string) => {
    completeSignup(token);
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      // إنشاء الملف الشخصي فورًا لأن Google لا يمر بصفحة تحقق
      await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: result.user.uid,
          email: result.user.email,
          fullName: result.user.displayName || "Student",
          role: "student",
        }),
      });

      localStorage.setItem("userRole", "student");
      router.push("/dashboard/student");
    } catch (err: any) {
      setError(err.message || "Google signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookSignUp = async () => {
    setLoading(true);
    setError("");
    try {
      const provider = new FacebookAuthProvider();
      const result = await signInWithPopup(auth, provider);

      await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: result.user.uid,
          email: result.user.email,
          fullName: result.user.displayName || "Student",
          role: "student",
        }),
      });

      localStorage.setItem("userRole", "student");
      router.push("/dashboard/student");
    } catch (err: any) {
      setError(err.message || "Facebook signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-[calc(100vh-4rem)] place-items-center bg-background px-4 py-12">
      <div className="relative w-full max-w-xl">
        <div className="pointer-events-none absolute -inset-10 -z-10 rounded-[3rem] bg-amber-500/20 blur-3xl" />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="glass overflow-hidden rounded-3xl bg-card p-8 shadow-elegant md:p-10"
        >
          <div className="mb-8 text-center">
            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-600">
              <T>Ruhulqudus Academy</T>
            </div>
            <h1 className="mt-3 font-serif text-3xl md:text-4xl"><T>Begin Your Journey</T></h1>
            <p className="mt-2 text-sm text-muted-foreground">
              <T>Join an elite community devoted to the Arabic language</T>
            </p>
          </div>

          {/* Role Toggle */}
          <div className="relative grid grid-cols-2 rounded-full border bg-muted p-1 mb-6">
            <motion.div
              layout
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="absolute inset-y-1 w-[calc(50%-4px)] rounded-full gradient-emerald shadow-elegant"
              style={{ left: role === "teacher" ? "calc(50% + 1px)" : "1px" }}
            />
            {(["student", "teacher"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`relative z-10 rounded-full py-2 text-sm font-medium capitalize transition-colors ${
                  role === r ? "text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                {r === "student" ? <T>Student</T> : <T>Teacher</T>}
              </button>
            ))}
          </div>

          {/* Social Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-full border bg-background px-4 py-2.5 text-sm font-medium shadow-sm transition hover:bg-accent disabled:opacity-50"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>
            <button
              type="button"
              onClick={handleFacebookSignUp}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-full border bg-background px-4 py-2.5 text-sm font-medium shadow-sm transition hover:bg-accent disabled:opacity-50"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Facebook
            </button>
          </div>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground"><T>or</T></span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="signup-name" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <User className="mr-1 inline h-3.5 w-3.5 text-gold" /> <T>Full Name</T>
              </label>
              <input
                id="signup-name" name="name" type="text" required
                value={name} onChange={(e) => setName(e.target.value)}
                className="w-full rounded-2xl border bg-background px-4 py-3 text-sm outline-none ring-ring/30 transition focus:ring-2 focus:ring-gold"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label htmlFor="signup-email" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <Mail className="mr-1 inline h-3.5 w-3.5 text-gold" /> <T>Email</T>
              </label>
              <input
                id="signup-email" name="email" type="email" required
                value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border bg-background px-4 py-3 text-sm outline-none ring-ring/30 transition focus:ring-2 focus:ring-gold"
                dir="ltr" placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="signup-password" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <Lock className="mr-1 inline h-3.5 w-3.5 text-gold" /> <T>Password</T>
              </label>
              <input
                id="signup-password" name="password" type="password" required
                value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border bg-background px-4 py-3 text-sm outline-none ring-ring/30 transition focus:ring-2 focus:ring-gold"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" /> {error}
              </div>
            )}

            {/* Captcha or Submit Button */}
            {showCaptcha ? (
              <CustomCaptcha onVerify={handleCustomCaptcha} />
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full rounded-full bg-linear-to-r from-amber-500 to-amber-600 py-3.5 text-sm font-semibold tracking-wide text-white shadow-elegant transition-transform hover:scale-[1.01] disabled:opacity-50"
              >
                {role === "teacher" ? (
                  <><T>Create</T> <T>Teacher</T> <T>Account</T></>
                ) : (
                  <><T>Create</T> <T>Student</T> <T>Account</T></>
                )}
              </button>
            )}

            <p className="text-center text-xs text-muted-foreground">
              <T>Already enrolled?</T>{" "}
              <Link href="/login" className="text-amber-600 underline-offset-4 hover:underline">
                <T>Sign in</T>
              </Link>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}