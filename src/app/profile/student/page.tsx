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

  // الحماية: توجيه غير المسجلين أو الأدوار غير المسموحة
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login");
        return;
      }

      // السماح بالدخول للطلاب، الأدمن، والمعلمين (لمشاهدة طلابهم)
      if (role !== "student" && role !== "admin" && role !== "teacher") {
        router.push("/profile/teacher");
      }
    }
  }, [user, isLoading, role, router]);

  // شاشة التحميل
  if (isLoading || !user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  // عدم عرض أي شيء إذا كان الدور غير مسموح (يتجنب وميض المحتوى)
  if (role !== "student" && role !== "admin" && role !== "teacher") return null;

  // هل هذا المعلم يشاهد طالبًا؟ (إخفاء الجولة والحفظ)
  const isTeacherView = role === "teacher";

  // خطوات الجولة الإرشادية (للطالب فقط)
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

  // لا تعرض الجولة على الشاشات الصغيرة (عرض أقل من 768px)
  const isMobile =
    typeof window !== "undefined" ? window.innerWidth < 768 : false;

  return (
    <>
      {/* غلاف متجاوب يمنع التمدد الأفقي */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-hidden pb-20">
        {/* تمرير خاصية readOnly للمكون ليخفي أزرار الحفظ */}
        <StudentProfile readOnly={isTeacherView} />
      </div>

      {/* الجولة الإرشادية تظهر فقط للطالب على الشاشات الكبيرة */}
      {!isMobile && !isTeacherView &&
        typeof window !== "undefined" &&
        !localStorage.getItem("profile_tour_student") && (
          <OnboardingTour
            steps={steps}
            tourKey="profile_tour_student"
          />
        )}
    </>
  );
}