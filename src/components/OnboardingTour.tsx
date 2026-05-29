"use client";

import { useState, useEffect, useCallback } from "react";
import { X, ArrowRight } from "lucide-react";
import { T } from "@/components/TranslatedText";

interface TourStep {
  target: string;
  title: string;
  content: string;
}

interface OnboardingTourProps {
  steps: TourStep[];
  tourKey?: string;
  onFinish?: () => void;
}

export function OnboardingTour({ steps, tourKey = "onboarding_tour_seen", onFinish }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setIsVisible(false);
      localStorage.setItem(tourKey, "true");
      if (onFinish) onFinish();
    }
  }, [currentStep, steps, tourKey, onFinish]);

  const handleSkip = useCallback(() => {
    setIsVisible(false);
    localStorage.setItem(tourKey, "true");
    if (onFinish) onFinish();
  }, [tourKey, onFinish]);

  if (!isVisible) return null;

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60">
      <div className="w-80 rounded-2xl bg-white dark:bg-gray-800 shadow-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-lg"><T>{step.title}</T></h3>
          <button onClick={handleSkip} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 mb-5"><T>{step.content}</T></p>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {currentStep + 1} / {steps.length}
          </span>
          <button
            onClick={handleNext}
            className="flex items-center gap-1 rounded-full bg-amber-500 px-4 py-1.5 text-xs font-semibold text-black hover:bg-amber-400"
          >
            <T>{currentStep === steps.length - 1 ? "إنهاء" : "التالي"}</T> <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}