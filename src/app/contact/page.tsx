"use client";

import { useState } from "react";
import { T } from "@/components/TranslatedText";
import { CustomCaptcha } from "@/components/CustomCaptcha";
import { Mail, User, MessageSquare, Send, Loader2, MapPin, Phone } from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [showCaptcha, setShowCaptcha] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setShowCaptcha(true);
  };

  const handleCaptchaVerify = async (token: string) => {
    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, captchaToken: token }),
      });
      if (res.ok) {
        setSent(true);
      } else {
        const err = await res.json();
        setError(err.error || "Failed to send message.");
      }
    } catch {
      setError("Network error.");
    } finally {
      setSending(false);
      setShowCaptcha(false);
    }
  };

  if (sent) {
    return (
      <div className="grid min-h-[calc(100vh-4rem)] place-items-center px-4 py-12">
        <div className="glass rounded-3xl p-8 md:p-10 text-center max-w-md">
          <Send className="mx-auto h-12 w-12 text-emerald-500 mb-4" />
          <h1 className="font-serif text-2xl"><T>Message Sent!</T></h1>
          <p className="mt-2 text-muted-foreground"><T>We'll get back to you shortly.</T></p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
      <div className="text-center mb-10">
        <Mail className="mx-auto h-12 w-12 text-amber-500 mb-4" />
        <h1 className="font-serif text-4xl"><T>Contact Us</T></h1>
        <p className="mt-2 text-muted-foreground"><T>We'd love to hear from you.</T></p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {/* Info */}
        <div className="glass rounded-3xl p-6 space-y-6 self-start">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-amber-500 mt-0.5" />
            <div>
              <h3 className="font-medium"><T>Address</T></h3>
              <p className="text-sm text-muted-foreground"><T>Istanbul, Turkey</T></p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-amber-500 mt-0.5" />
            <div>
              <h3 className="font-medium"><T>Email</T></h3>
              <a href="mailto:info@ruhulqudus.com" className="text-sm text-amber-600 hover:underline">info@ruhulqudus.com</a>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="h-5 w-5 text-amber-500 mt-0.5" />
            <div>
              <h3 className="font-medium"><T>Phone</T></h3>
              <p className="text-sm text-muted-foreground">+90 555 123 4567</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="glass rounded-3xl p-6 md:p-8">
          {showCaptcha ? (
            <CustomCaptcha onVerify={handleCaptchaVerify} />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-1.5">
                  <User size={14} /> <T>Name</T>
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-2xl border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gold"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-1.5">
                  <Mail size={14} /> <T>Email</T>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gold"
                  dir="ltr"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-1.5">
                  <MessageSquare size={14} /> <T>Message</T>
                </label>
                <textarea
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-2xl border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gold resize-none"
                  placeholder="How can we help?"
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button
                type="submit"
                className="w-full rounded-full bg-amber-500 py-3 text-sm font-semibold text-black hover:bg-amber-400 inline-flex items-center justify-center gap-2"
              >
                <Send size={16} /> <T>Send Message</T>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}