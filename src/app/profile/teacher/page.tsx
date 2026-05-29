"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/AuthProvider";
import { TeacherProfile } from "@/components/profile/TeacherProfile";
import { Loader2 } from "lucide-react";
import { T } from "@/components/TranslatedText";
import { OnboardingTour } from "@/components/OnboardingTour";

export default function TeacherProfilePage() {
  const { user, isLoading, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login");
      } else if (role !== "teacher" && role !== "admin") {
        router.push("/profile/student");
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

  if (role !== "teacher" && role !== "admin") return null;

  // خطوات الجولة الإرشادية لبروفايل المعلم
  const steps = [
    {
      target: ".profile-fullname",
      title: "👤 الاسم الكامل",
      content: "أدخل اسمك الكامل هنا.",
      placement: "bottom" as const,
      disableBeacon: true,
    },
    {
      target: ".profile-gender",
      title: "⚥ الجنس",
      content: "اختر الجنس من القائمة.",
      placement: "bottom" as const,
    },
    {
      target: ".profile-nationality",
      title: "🌍 الجنسية",
      content: "أدخل جنسيتك (مطلوب).",
      placement: "bottom" as const,
    },
    {
      target: ".profile-residence",
      title: "🏠 بلد الإقامة",
      content: "أدخل الدولة التي تقيم فيها (مطلوب).",
      placement: "bottom" as const,
    },
    {
      target: ".profile-native-language",
      title: "🗣️ اللغة الأم",
      content: "أدخل لغتك الأم (مطلوب).",
      placement: "bottom" as const,
    },
    {
      target: ".profile-languages",
      title: "🌐 اللغات التي تجيدها",
      content: "أضف اللغات الأخرى التي تتحدثها.",
      placement: "bottom" as const,
    },
    {
      target: ".profile-whatsapp",
      title: "📱 واتساب",
      content: "أدخل رقم واتساب الخاص بك (مطلوب).",
      placement: "bottom" as const,
    },
    {
      target: ".profile-telegram",
      title: "💬 تيليجرام",
      content: "أدخل اسم المستخدم في تيليجرام (مطلوب).",
      placement: "bottom" as const,
    },
    {
      target: ".profile-bio",
      title: "📝 نبذة عنك",
      content: "اكتب نبذة عن خبراتك ومؤهلاتك.",
      placement: "bottom" as const,
    },
    {
      target: ".profile-cv",
      title: "📄 السيرة الذاتية",
      content: "ارفع ملف السيرة الذاتية بصيغة PDF.",
      placement: "top" as const,
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
      <TeacherProfile />
      {typeof window !== "undefined" && !localStorage.getItem("profile_tour_teacher") && (
        <OnboardingTour
          steps={steps}
          tourKey="profile_tour_teacher"
        />
      )}
    </>
  );
}