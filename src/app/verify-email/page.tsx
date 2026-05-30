"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Mail, ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import { T } from "@/components/TranslatedText";
import { auth } from "@/lib/firebase/client";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ResendVerificationButton } from "@/components/ResendVerificationButton";
import Link from "next/link";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [code, setCode] = useState<string[]>(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleInput = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleSubmit = async () => {
    const fullCode = code.join("");
    if (fullCode.length < 6) {
      setError("Please enter the full 6-digit code.");
      return;
    }

    setLoading(true);
    setError("");

    const storedEmail = sessionStorage.getItem("signup_email") || "";
    const storedPassword = sessionStorage.getItem("signup_password") || "";
    const storedName = sessionStorage.getItem("signup_name") || "";
    const storedRole = sessionStorage.getItem("signup_role") || "student";
    const storedReferral = sessionStorage.getItem("referral_code") || null;

    if (!storedEmail || !storedPassword) {
      setError("Session expired. Please sign up again.");
      setLoading(false);
      return;
    }

    // 1. التحقق من الرمز عبر API
    const res = await fetch("/api/verify-email-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: storedEmail, code: fullCode }),
    });

    if (!res.ok) {
      const err = await res.json();
      setError(err.error || "Verification failed.");
      setCode(Array(6).fill(""));
      inputRefs.current[0]?.focus();
      setLoading(false);
      return;
    }

    // 2. إنشاء حساب Firebase (لأول مرة)
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        storedEmail,
        storedPassword
      );

      // 3. إنشاء الملف الشخصي في Neon (مع الإحالة)
      await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: userCredential.user.uid,
          email: storedEmail,
          fullName: storedName,
          role: storedRole,
          email_verified: true,
          referred_by: storedReferral,
        }),
      });

      // 4. تنظيف sessionStorage
      sessionStorage.removeItem("signup_name");
      sessionStorage.removeItem("signup_email");
      sessionStorage.removeItem("signup_password");
      sessionStorage.removeItem("signup_role");
      sessionStorage.removeItem("referral_code");

      // 5. توجيه مباشر إلى الداشبورد
      setSuccess(true);
      localStorage.setItem("userRole", storedRole);

      setTimeout(() => {
        if (
          storedEmail === "abdullahhelmy114@gmail.com" ||
          storedEmail === "info@ruhulqudus.com"
        ) {
          router.push("/dashboard/admin");
        } else if (storedRole === "teacher") {
          router.push("/dashboard/teacher");
        } else {
          router.push("/dashboard/student");
        }
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to create account. Please try again.");
      setLoading(false);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pastedData.length === 6) {
      const newCode = pastedData.split("");
      setCode(newCode);
      newCode.forEach((_, i) => {
        if (inputRefs.current[i]) inputRefs.current[i]!.value = newCode[i];
      });
      inputRefs.current[5]?.focus();
    }
  };

  return (
    <div className="grid min-h-[calc(100vh-4rem)] place-items-center bg-background px-4 py-12">
      <div className="relative w-full max-w-xl">
        <div className="pointer-events-none absolute -inset-10 -z-10 rounded-[3rem] bg-amber-500/20 blur-3xl" />
        <div className="glass rounded-3xl p-8 md:p-10 shadow-elegant text-center">
          {success ? (
            <>
              <ShieldCheck className="mx-auto h-12 w-12 text-emerald-500 mb-4" />
              <h1 className="font-serif text-2xl">
                <T>Email Verified!</T>
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                <T>Redirecting to your dashboard...</T>
              </p>
            </>
          ) : (
            <>
              <Mail className="mx-auto h-12 w-12 text-amber-500 mb-4" />
              <h1 className="font-serif text-2xl">
                <T>Enter Verification Code</T>
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                <T>We sent a 6-digit code to your email.</T>
              </p>

              <div className="flex justify-center gap-3 mt-6" onPaste={handlePaste}>
                {code.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { inputRefs.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleInput(idx, e.target.value)}
                    className="h-14 w-11 rounded-xl border bg-background text-center text-xl font-semibold outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                    autoFocus={idx === 0}
                  />
                ))}
              </div>

              {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

              <button
                onClick={handleSubmit}
                disabled={loading || code.some((d) => d === "")}
                className="mt-6 w-full rounded-full bg-amber-500 py-3 text-sm font-semibold text-black shadow-lg hover:bg-amber-400 disabled:opacity-50"
              >
                {loading ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : <T>Verify</T>}
              </button>

              <div className="mt-4">
                <ResendVerificationButton />
              </div>
              <Link href="/login" className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:underline">
                <ArrowLeft className="h-4 w-4" /> <T>Back to Sign In</T>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}