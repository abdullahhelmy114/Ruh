"use client";

import { useState } from "react";
import { Loader2, Mail } from "lucide-react";
import { T } from "@/components/TranslatedText";
import { auth } from "@/lib/firebase/client";

export function ResendVerificationButton() {
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  const handleResend = async () => {
    const user = auth.currentUser;
    if (!user?.email) {
      setMessage("No user email found. Please sign up again.");
      return;
    }
    setSending(true);
    try {
      // استدعاء API إرسال الكود الجديد
      const res = await fetch("/api/send-verification-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });
      if (res.ok) {
        setMessage("Verification code resent. Check your inbox.");
      } else {
        const err = await res.json();
        setMessage(err.error || "Failed to resend code.");
      }
    } catch (err: any) {
      setMessage(err.message || "Network error.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="text-center">
      <button
        onClick={handleResend}
        disabled={sending}
        className="inline-flex items-center gap-2 rounded-full border bg-background px-5 py-2.5 text-sm font-medium hover:bg-accent disabled:opacity-50"
      >
        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
        <T>Resend Code</T>
      </button>
      {message && <p className="mt-2 text-xs text-muted-foreground">{message}</p>}
    </div>
  );
}