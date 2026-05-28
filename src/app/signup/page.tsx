"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
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
        await sendEmailVerification(userCredential.user);

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
        setShowCaptcha(false); // إخفاء الكابتشا عند الفشل لإعادة المحاولة
      }
    },
    [email, password, name, role, router]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // التحقق من الحقول
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    // إظهار الكابتشا وبدء التحميل
    setLoading(true);
    setShowCaptcha(true);
  };

  const handleCustomCaptcha = (token: string) => {
    // تم التحقق بنجاح من الكابتشا، أكمل التسجيل
    completeSignup(token);
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
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
            <button type="button" onClick={handleGoogleSignUp} disabled={loading} className="...">
              <svg>...</svg> Google
            </button>
            <button type="button" onClick={handleFacebookSignUp} disabled={loading} className="...">
              <svg>...</svg> Facebook
            </button>
          </div>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground"><T>or</T></span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="signup-name" className="..."><User /> <T>Full Name</T></label>
              <input id="signup-name" name="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} className="..." placeholder="Your full name" />
            </div>
            <div>
              <label htmlFor="signup-email" className="..."><Mail /> <T>Email</T></label>
              <input id="signup-email" name="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="..." dir="ltr" placeholder="you@example.com" />
            </div>
            <div>
              <label htmlFor="signup-password" className="..."><Lock /> <T>Password</T></label>
              <input id="signup-password" name="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="..." placeholder="••••••••" />
            </div>

            {error && <div className="..."><AlertCircle /> {error}</div>}

            {/* الكابتشا تظهر فقط بعد الضغط على زر التسجيل */}
            {showCaptcha && (
              <CustomCaptcha onVerify={handleCustomCaptcha} />
            )}

            {!showCaptcha && (
              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full rounded-full bg-linear-to-r from-amber-500 to-amber-600 py-3.5 text-sm font-semibold tracking-wide text-white shadow-elegant transition-transform hover:scale-[1.01] disabled:opacity-50"
              >
                {role === "teacher" ? <><T>Create</T> <T>Teacher</T> <T>Account</T></> : <><T>Create</T> <T>Student</T> <T>Account</T></>}
              </button>
            )}

            <p className="text-center text-xs text-muted-foreground">
              <T>Already enrolled?</T> <Link href="/login" className="text-amber-600 underline-offset-4 hover:underline"><T>Sign in</T></Link>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}