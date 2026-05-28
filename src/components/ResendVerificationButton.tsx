"use client";

import { useState } from "react";
import { sendEmailVerification } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { Loader2, Mail } from "lucide-react";
import { T } from "@/components/TranslatedText";

export function ResendVerificationButton() {
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  const handleResend = async () => {
    const user = auth.currentUser;
    if (!user) {
      setMessage("No user found. Please sign up again.");
      return;
    }
    setSending(true);
    try {
      await sendEmailVerification(user);
      setMessage("Verification email sent. Please check your inbox.");
    } catch (err: any) {
      setMessage(err.message || "Failed to resend email.");
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
        <T>Resend Email</T>
      </button>
      {message && <p className="mt-2 text-xs text-muted-foreground">{message}</p>}
    </div>
  );
}