"use client";

import { useEffect, useState } from "react";
import { T } from "@/components/TranslatedText";
import { Package, Check, Sparkles, UserPlus, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/firebase/AuthProvider";
import PayPalButton from "@/components/PayPalButton";
import { useRouter } from "next/navigation";

interface Bundle {
  id: string;
  title: string;
  description?: string;
  price: number;
  original_price: number;
  discount_percent: number;
  course_ids: string[];
  featured?: boolean;
}

export default function BundlesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // جلب محتوى الصفحة
    fetch("/api/pages/bundles")
      .then((r) => r.json())
      .then((d) => setPage(d.page))
      .catch(() =>
        setPage({
          title: "Course Bundles",
          content: "Save up to 33% with our carefully curated bundles.",
        })
      );

    // جلب الحزم
    fetch("/api/bundles")
      .then((r) => r.json())
      .then((data) => setBundles(data.bundles || []))
      .finally(() => setLoading(false));
  }, []);

  const handlePaymentSuccess = async (details: { orderID: string; payerID: string }, bundleId: string) => {
    if (!user) return;
    try {
      const res = await fetch("/api/payment/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderID: details.orderID,
          payerID: details.payerID,
          type: "bundle",
          bundle_id: bundleId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        router.push(data.redirect || "/payment/success");
      } else {
        alert(data.error || "Payment verification failed");
      }
    } catch {
      alert("Network error");
    }
  };

  if (!page || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 md:px-8">
      <div className="text-center mb-10">
        <Package className="mx-auto h-12 w-12 text-accent-foreground mb-4" />
        <h1 className="font-serif text-4xl text-foreground">{page.title}</h1>
        <p className="mt-2 text-muted-foreground">{page.content}</p>
      </div>

      {bundles.length === 0 ? (
        <p className="text-center text-muted-foreground"><T>No bundles available at the moment.</T></p>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {bundles.map((bundle) => (
            <div
              key={bundle.id}
              className={`glass rounded-3xl p-6 text-center relative ${
                bundle.featured ? "ring-2 ring-accent" : ""
              }`}
            >
              {bundle.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-xs font-bold px-4 py-1 rounded-full">
                  <Sparkles size={12} className="inline mr-1" /> <T>Best Value</T>
                </span>
              )}
              <h3 className="font-serif text-xl mt-2 text-foreground"><T>{bundle.title}</T></h3>
              {bundle.description && (
                <p className="text-sm text-muted-foreground mt-1">{bundle.description}</p>
              )}
              <div className="mt-4">
                <span className="font-serif text-3xl font-bold text-primary">${bundle.price}</span>
                {bundle.original_price > bundle.price && (
                  <>
                    <span className="text-sm line-through text-muted-foreground ml-2">
                      ${bundle.original_price.toFixed(0)}
                    </span>
                    <span className="ml-2 bg-secondary text-secondary-foreground text-xs px-2 py-0.5 rounded-full">
                      -{bundle.discount_percent}%
                    </span>
                  </>
                )}
              </div>
              <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
                {["Full access", "Certificates", "Live Q&A"].map((feature) => (
                  <li key={feature} className="flex items-center justify-center gap-1">
                    <Check size={14} className="text-primary" /> <T>{feature}</T>
                  </li>
                ))}
              </ul>
              <div className="mt-5">
                {user ? (
                  <PayPalButton
                    amount={bundle.price.toFixed(2)}
                    onSuccess={(details) => handlePaymentSuccess(details, bundle.id)}
                  />
                ) : (
                  <Link
                    href="/login"
                    className="inline-block w-full rounded-full bg-accent text-accent-foreground py-2.5 text-sm font-semibold hover:bg-accent/90"
                  >
                    <T>Login to Purchase</T>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!user && (
        <div className="mt-12 text-center">
          <div className="glass rounded-3xl p-8 inline-block">
            <UserPlus className="mx-auto h-12 w-12 text-accent-foreground mb-4" />
            <h2 className="font-serif text-2xl text-foreground mb-2"><T>Ready to save?</T></h2>
            <p className="text-muted-foreground mb-6"><T>Join now and get access to exclusive bundles.</T></p>
            <div className="flex justify-center gap-3">
              <Link
                href="/signup?role=student"
                className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2"
              >
                <T>Join as Student</T> <ArrowRight size={16} />
              </Link>
              <Link
                href="/signup?role=teacher"
                className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:bg-accent/90 inline-flex items-center gap-2"
              >
                <T>Join as Teacher</T> <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}