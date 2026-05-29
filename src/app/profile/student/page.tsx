"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/AuthProvider";
import { StudentProfile } from "@/components/profile/StudentProfile";
import { Loader2 } from "lucide-react";
import { T } from "@/components/TranslatedText";
import { OnboardingTour } from "@/components/OnboardingTour";

export default function StudentProfilePage() {
  const { user, isLoading, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login");
      } else if (role !== "student" && role !== "admin") {
        router.push("/profile/teacher");
      }
    }
  }, [user, isLoading, role, router]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  if (role !== "student" && role !== "admin") return null;

  // خطوات الجولة الإرشادية لبروفايل الطالب
  const steps = [
    {
      target: ".profile-gender",
      title: "👤 الجنس",
      content: "اختر الجنس من القائمة.",
      placement: "bottom" as const,
      disableBeacon: true,
    },
    {
      target: ".profile-age",
      title: "🎂 العمر",
      content: "أدخل عمرك هنا.",
      placement: "bottom" as const,
    },
    {
      target: ".profile-nationality",
      title: "🌍 الجنسية",
      content: "أدخل جنسيتك.",
      placement: "bottom" as const,
    },
    {
      target: ".profile-residence",
      title: "🏠 بلد الإقامة",
      content: "أدخل اسم الدولة التي تعيش فيها.",
      placement: "bottom" as const,
    },
    {
      target: ".profile-native-language",
      title: "🗣️ اللغة الأم",
      content: "أدخل لغتك الأم (مطلوب).",
      placement: "bottom" as const,
    },
    {
      target: ".profile-other-languages",
      title: "🌐 لغات أخرى",
      content: "أضف أي لغات أخرى تجيدها.",
      placement: "bottom" as const,
    },
    {
      target: ".profile-whatsapp",
      title: "📱 واتساب",
      content: "أدخل رقم واتساب الخاص بك.",
      placement: "bottom" as const,
    },
    {
      target: ".profile-telegram",
      title: "💬 تيليجرام",
      content: "أدخل اسم المستخدم في تيليجرام.",
      placement: "bottom" as const,
    },
    {
      target: ".profile-save-btn",
      title: "💾 حفظ",
      content: "اضغط هنا لحفظ جميع التغييرات.",
      placement: "top" as const,
    },
  ];

  return (
    <>
      <StudentProfile />
      {typeof window !== "undefined" && !localStorage.getItem("profile_tour_student") && (
        <OnboardingTour
          steps={steps}
          tourKey="profile_tour_student"
        />
      )}
    </>
  );
}