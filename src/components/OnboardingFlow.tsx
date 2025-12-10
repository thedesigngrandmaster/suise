import { useState } from "react";
import { Button } from "./ui/button";
import { YoomaAvatar } from "./YoomaAvatar";
import { cn } from "@/lib/utils";
import { ChevronRight, Sparkles, Users, Flame, Heart } from "lucide-react";

interface OnboardingStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  yoomaVariant: "wave" | "celebrate";
}

const steps: OnboardingStep[] = [
  {
    title: "Save your memories",
    description: "Your personal vault for photos and videos. Safe, private, and always with you.",
    icon: <Sparkles className="w-8 h-8" />,
    yoomaVariant: "wave",
  },
  {
    title: "Share with friends",
    description: "Choose who sees your memories. Keep them private or share the joy.",
    icon: <Users className="w-8 h-8" />,
    yoomaVariant: "celebrate",
  },
  {
    title: "Keep your streak!",
    description: "Add a memory every day to grow your streak. Yooma loves celebrating with you!",
    icon: <Flame className="w-8 h-8" />,
    yoomaVariant: "celebrate",
  },
  {
    title: "Let's begin!",
    description: "Your memory journey starts now. Yooma can't wait to help you save moments.",
    icon: <Heart className="w-8 h-8" />,
    yoomaVariant: "wave",
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
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-background flex flex-col z-50">
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12">
        {/* Progress dots */}
        <div className="flex gap-2 mb-12">
          {steps.map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-2.5 h-2.5 rounded-full border-2 border-foreground transition-colors",
                i === currentStep ? "bg-primary" : "bg-transparent"
              )}
            />
          ))}
        </div>

        {/* Content */}
        <div key={currentStep} className="flex flex-col items-center text-center fade-in-up">
          <div className="mb-8 relative">
            <YoomaAvatar 
              variant={step.yoomaVariant} 
              size="xl" 
              animate 
            />
            <div className="absolute -bottom-2 -right-2 p-3 bg-accent rounded-full border-2 border-foreground shadow-neubrutalist-sm">
              {step.icon}
            </div>
          </div>

          <h2 className="text-3xl font-black text-foreground mb-4">
            {step.title}
          </h2>
          <p className="text-muted-foreground text-lg max-w-xs leading-relaxed">
            {step.description}
          </p>
        </div>
      </div>

      {/* Bottom actions */}
      <div className="px-8 pb-12 space-y-4">
        <Button
          size="lg"
          variant="suise"
          className="w-full"
          onClick={handleNext}
        >
          {isLastStep ? "Get Started" : "Continue"}
          <ChevronRight className="w-5 h-5 ml-1" />
        </Button>
        
        {!isLastStep && (
          <Button
            variant="ghost"
            className="w-full"
            onClick={onComplete}
          >
            Skip
          </Button>
        )}
      </div>
    </div>
  );
}