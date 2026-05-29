"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { X, ArrowRight, ArrowLeft } from "lucide-react";

interface TourStep {
  target: string;      // محدد CSS للعنصر المراد تسليط الضوء عليه
  title: string;
  content: string;
  placement?: "top" | "bottom" | "left" | "right" | "center";
}

interface OnboardingTourProps {
  steps: TourStep[];
  tourKey?: string;
  onFinish?: () => void;
}

export function OnboardingTour({ steps, tourKey = "onboarding_tour_seen", onFinish }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const overlayRef = useRef<HTMLDivElement>(null);

  const totalSteps = steps.length;

  // بدء الجولة
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 800);
    return () => clearTimeout(timer);
  }, []);

  // تحديث موضع البطاقة بناءً على العنصر المستهدف
  useEffect(() => {
    if (!isVisible || currentStep >= totalSteps) return;

    const step = steps[currentStep];
    const targetEl = document.querySelector(step.target) as HTMLElement;

    if (!targetEl || step.placement === "center") {
      // توسيط البطاقة إذا لم يتم العثور على العنصر أو كان placement = center
      setTooltipStyle({
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      });
      return;
    }

    // حساب موضع البطاقة
    const rect = targetEl.getBoundingClientRect();
    const placement = step.placement || "bottom";
    let top = 0;
    let left = 0;

    switch (placement) {
      case "bottom":
        top = rect.bottom + 12;
        left = rect.left + rect.width / 2 - 150;
        break;
      case "top":
        top = rect.top - 12 - 300;
        left = rect.left + rect.width / 2 - 150;
        break;
      case "left":
        top = rect.top + rect.height / 2 - 50;
        left = rect.left - 12 - 320;
        break;
      case "right":
        top = rect.top + rect.height / 2 - 50;
        left = rect.right + 12;
        break;
    }

    // التأكد من عدم خروج البطاقة عن الشاشة
    top = Math.max(10, Math.min(top, window.innerHeight - 200));
    left = Math.max(10, Math.min(left, window.innerWidth - 320));

    // إضافة تأثير التمرير للعنصر
    targetEl.scrollIntoView({ behavior: "smooth", block: "center" });

    setTooltipStyle({
      top: `${top}px`,
      left: `${left}px`,
    });
  }, [currentStep, isVisible, steps]);

  const handleNext = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // إنهاء الجولة
      setIsVisible(false);
      localStorage.setItem(tourKey, "true");
      if (onFinish) onFinish();
    }
  }, [currentStep, totalSteps, tourKey, onFinish]);

  const handleSkip = useCallback(() => {
    setIsVisible(false);
    localStorage.setItem(tourKey, "true");
    if (onFinish) onFinish();
  }, [tourKey, onFinish]);

  if (!isVisible || currentStep >= totalSteps) return null;

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-[1000]">
      {/* طبقة التعتيم */}
      <div ref={overlayRef} className="absolute inset-0 bg-black/60" />

      {/* بطاقة الخطوة */}
      <div
        className="absolute z-[1001] w-80 rounded-2xl bg-white dark:bg-gray-800 shadow-2xl p-5 transition-all duration-300"
        style={tooltipStyle}
      >
        {/* رأس البطاقة */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">{step.title}</h3>
          <button onClick={handleSkip} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        {/* المحتوى */}
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-5">{step.content}</p>

        {/* الأزرار */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {currentStep + 1} / {totalSteps}
          </span>
          <div className="flex gap-2">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="flex items-center gap-1 rounded-full border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100"
              >
                <ArrowLeft size={14} /> السابق
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex items-center gap-1 rounded-full bg-amber-500 px-4 py-1.5 text-xs font-semibold text-black hover:bg-amber-400"
            >
              {currentStep === totalSteps - 1 ? "إنهاء" : "التالي"} <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* إطار تسليط الضوء */}
      {step.target !== "body" && (
        <div
          className="absolute z-[1001] rounded-lg ring-4 ring-amber-400 pointer-events-none transition-all duration-300"
          style={{
            top: (document.querySelector(step.target) as HTMLElement)?.getBoundingClientRect().top - 4 + "px",
            left: (document.querySelector(step.target) as HTMLElement)?.getBoundingClientRect().left - 4 + "px",
            width: (document.querySelector(step.target) as HTMLElement)?.getBoundingClientRect().width + 8 + "px",
            height: (document.querySelector(step.target) as HTMLElement)?.getBoundingClientRect().height + 8 + "px",
          }}
        />
      )}
    </div>
  );
}