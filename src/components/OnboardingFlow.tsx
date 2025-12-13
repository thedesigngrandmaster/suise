import { useState } from "react";
import { Button } from "./ui/button";
import { BrandHeader } from "./BrandHeader";
import { ZKLoginModal } from "./ZKLoginModal";
import { ChevronRight } from "lucide-react";

import firstScreen from "@/assets/images/06. first-screen.png";
import secondScreen from "@/assets/images/07. second-screen.png";
import thirdScreen from "@/assets/images/08. thrid-screen.png";
import lastScreen from "@/assets/images/09. last-screen.png";
import brandShapeLeft from "@/assets/images/04. brand-shape.svg";
import brandShapeMirror from "@/assets/images/05. brand-shape-mirror.svg";

interface OnboardingStep {
  title: string;
  image: string;
  imagePosition: "left" | "right";
  maskShape: string;
}

const steps: OnboardingStep[] = [
  {
    title: "Store your moments in your own private vault.",
    image: firstScreen,
    imagePosition: "left",
    maskShape: brandShapeLeft,
  },
  {
    title: "Share only when you want. You're in control.",
    image: secondScreen,
    imagePosition: "right",
    maskShape: brandShapeMirror,
  },
  {
    title: "Add a memory every day to grow your streak!",
    image: thirdScreen,
    imagePosition: "left",
    maskShape: brandShapeLeft,
  },
  {
    title: "Ready to start",
    image: lastScreen,
    imagePosition: "left",
    maskShape: brandShapeLeft,
  },
];

interface OnboardingFlowProps {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      return;
    }
    setCurrentStep((prev) => prev + 1);
  };

  const handleLogin = () => {
    onComplete();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with brand logo */}
      <header className="p-6">
        <BrandHeader />
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-6 pb-6">
        <div className="w-full max-w-5xl">
          {isLastStep ? (
            <LastStepContent
              step={step}
              onLogin={handleLogin}
            />
          ) : (
            <StepContent
              key={currentStep}
              step={step}
            />
          )}
        </div>
      </main>

      {/* Bottom navigation */}
      <footer className="p-6 pb-8">
        <div className="max-w-5xl mx-auto flex flex-col items-center gap-4">
          {/* Progress dots */}
          <div className="flex gap-2">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  i === currentStep
                    ? "bg-secondary"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>

          {!isLastStep && (
            <Button
              size="lg"
              variant="suise"
              className="w-full max-w-md"
              onClick={handleNext}
            >
              Continue
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}

interface StepContentProps {
  step: OnboardingStep;
}

function StepContent({ step }: StepContentProps) {
  const isImageLeft = step.imagePosition === "left";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center fade-in-up">
      {/* Image side */}
      <div className={`${isImageLeft ? "lg:order-1" : "lg:order-2"} flex justify-center`}>
        <div 
          className="relative w-full max-w-sm aspect-square brand-shape-mask"
          style={{
            WebkitMaskImage: `url(${step.maskShape})`,
            maskImage: `url(${step.maskShape})`,
          }}
        >
          <img
            src={step.image}
            alt="Onboarding illustration"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Text side */}
      <div className={`${isImageLeft ? "lg:order-2" : "lg:order-1"} text-center lg:text-left`}>
        <h2 className="text-3xl lg:text-4xl font-bold font-bricolage text-foreground leading-tight">
          {step.title}
        </h2>
      </div>
    </div>
  );
}

interface LastStepContentProps {
  step: OnboardingStep;
  onLogin: () => void;
}

function LastStepContent({ step, onLogin }: LastStepContentProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center fade-in-up">
      {/* Left side - title and image */}
      <div className="flex flex-col items-center lg:items-start gap-6">
        <h2 className="text-3xl lg:text-4xl font-bold font-bricolage text-foreground">
          {step.title}
        </h2>
        <div 
          className="relative w-full max-w-sm aspect-square brand-shape-mask"
          style={{
            WebkitMaskImage: `url(${step.maskShape})`,
            maskImage: `url(${step.maskShape})`,
          }}
        >
          <img
            src={step.image}
            alt="Onboarding illustration"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Right side - ZKLogin modal */}
      <div className="flex justify-center lg:justify-end">
        <ZKLoginModal onLogin={onLogin} />
      </div>
    </div>
  );
}