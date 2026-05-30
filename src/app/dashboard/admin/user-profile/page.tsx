"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/firebase/AuthProvider";
import { T } from "@/components/TranslatedText";
import {
  Loader2, ArrowLeft, Mail, Phone, MapPin, Globe, User, Calendar, Award, BookOpen,
} from "lucide-react";
import Link from "next/link";

export default function AdminUserProfilePage() {
  const { user, isLoading: authLoading, role } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const uid = searchParams.get("uid");

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || role !== "admin" || !uid) {
      if (!user) router.push("/login");
      return;
    }
    setLoading(true);
    fetch(`/api/user?uid=${uid}`)
      .then(r => r.json())
      .then(d => {
        if (d.error || !d.profile) {
          setError("User not found");
        } else {
          setProfile(d.profile);
        }
      })
      .catch(() => setError("Failed to load user"))
      .finally(() => setLoading(false));
  }, [user, role, uid, router]);

  if (authLoading || loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <T>{error || "User not found"}</T>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link
        href="/dashboard/admin"
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft size={16} /> <T>Back to Users</T>
      </Link>

      <div className="glass rounded-3xl p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-full gradient-emerald text-white text-2xl font-bold">
            {profile.full_name?.charAt(0) || "?"}
          </div>
          <div>
            <h1 className="font-serif text-2xl">{profile.full_name}</h1>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
            <span className="inline-block mt-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-3 py-0.5 text-xs font-semibold capitalize">
              {profile.role}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoRow icon={Calendar} label="Joined" value={new Date(profile.created_at).toLocaleDateString()} />
          <InfoRow icon={Globe} label="Nationality" value={profile.nationality || "—"} />
          <InfoRow icon={MapPin} label="Residence" value={profile.residence || "—"} />
          <InfoRow icon={Phone} label="WhatsApp" value={profile.whatsapp || "—"} />
          <InfoRow icon={Mail} label="Telegram" value={profile.telegram || "—"} />
          <InfoRow icon={User} label="Gender" value={profile.gender || "—"} />
          <InfoRow icon={Calendar} label="Age" value={profile.age || "—"} />
          <InfoRow icon={Globe} label="Native Language" value={profile.native_language || profile.nativeLanguage || "—"} />
          <InfoRow icon={Globe} label="Other Languages" value={(profile.other_languages || profile.otherLanguages || []).join(", ") || "—"} />
        </div>

        {profile.role === "teacher" && (
          <div className="mt-4 pt-4 border-t">
            <h3 className="font-serif text-lg flex items-center gap-2 mb-2">
              <BookOpen className="h-5 w-5 text-amber-500" /> <T>Courses</T>
            </h3>
            <p className="text-sm text-muted-foreground"><T>Teacher info loaded from profile.</T></p>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-background/50">
      <Icon className="h-5 w-5 text-amber-500 mt-0.5" />
      <div>
        <div className="text-xs text-muted-foreground"><T>{label}</T></div>
        <div className="text-sm font-medium">{value}</div>
      </div>
    </div>
  );
}