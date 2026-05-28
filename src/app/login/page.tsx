"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { motion } from "framer-motion";
import { Mail, Lock, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { T } from "@/components/TranslatedText";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const redirectAfterLogin = (userEmail: string) => {
    if (userEmail === "abdullahhelmy114@gmail.com") {
      router.push("/profile/admin");
    } else {
      const storedRole = localStorage.getItem("userRole");
      if (storedRole === "teacher") {
        router.push("/profile/teacher");
      } else {
        router.push("/profile/student");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      redirectAfterLogin(userCredential.user.email || "");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      redirectAfterLogin(result.user.email || "");
    } catch (err: any) {
      setError(err.message || "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const provider = new FacebookAuthProvider();
      const result = await signInWithPopup(auth, provider);
      redirectAfterLogin(result.user.email || "");
    } catch (err: any) {
      setError(err.message || "Facebook login failed");
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
            <h1 className="mt-3 font-serif text-3xl md:text-4xl"><T>Welcome Back</T></h1>
            <p className="mt-2 text-sm text-muted-foreground">
              <T>Continue your path with Dr. Jehan Ali Ahmed</T>
            </p>
          </div>

          {/* Social Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button onClick={handleGoogleLogin} disabled={loading} className="...">
              <svg>...</svg>
              Google
            </button>
            <button onClick={handleFacebookLogin} disabled={loading} className="...">
              <svg>...</svg>
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
              <label><Mail /> <T>Email</T></label>
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label><Lock /> <T>Password</T></label>
              <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" /> {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-full bg-linear-to-r from-amber-500 to-amber-600 py-3.5 text-sm font-semibold tracking-wide text-white shadow-elegant transition-transform hover:scale-[1.01] disabled:opacity-50"
            >
              {loading ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : <T>Sign In</T>}
            </button>
            <p className="text-center text-xs text-muted-foreground">
              <T>Don't have an account?</T>{" "}
              <Link href="/signup" className="text-amber-600 underline-offset-4 hover:underline">
                <T>Create one</T>
              </Link>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}