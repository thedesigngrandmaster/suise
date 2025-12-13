import { useState } from "react";
import { X, Camera, FolderPlus, Sparkles, ArrowRight, Check } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { cn } from "@/lib/utils";
import { YoomaAvatar } from "./YoomaAvatar";

interface OnboardingTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onStartUpload: () => void;
}

const steps = [
  {
    id: 1,
    title: "Welcome to Suise!",
    description: "Let's get you started with your first memory. It only takes a minute!",
    icon: Sparkles,
  },
  {
    id: 2,
    title: "Upload Your First Memory",
    description: "Tap the + button to add a photo. You can add a caption to remember the moment.",
    icon: Camera,
  },
  {
    id: 3,
    title: "Create an Album",
    description: "Group your memories into albums. Perfect for trips, events, or daily moments.",
    icon: FolderPlus,
  },
  {
    id: 4,
    title: "You're All Set!",
    description: "Start capturing memories and watch your streak grow. Have fun!",
    icon: Check,
  },
];

export function OnboardingTutorial({ isOpen, onClose, onStartUpload }: OnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
      onStartUpload();
    }
  };

  const handleSkip = () => {
    onClose();
  };

  const step = steps[currentStep];
  const Icon = step.icon;
  const isLastStep = currentStep === steps.length - 1;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="sr-only">Getting Started</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center text-center py-6">
          {currentStep === 0 ? (
            <YoomaAvatar variant="wave" size="lg" animate />
          ) : (
            <div className="w-20 h-20 rounded-full bg-secondary/20 flex items-center justify-center mb-4">
              <Icon className="w-10 h-10 text-secondary" />
            </div>
          )}

          <h2 className="text-2xl font-bold font-bricolage mt-4 mb-2">{step.title}</h2>
          <p className="text-muted-foreground max-w-xs">{step.description}</p>

          {/* Progress dots */}
          <div className="flex gap-2 mt-6">
            {steps.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  index === currentStep ? "bg-secondary" : "bg-muted"
                )}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <Button variant="outline" onClick={handleSkip} className="flex-1">
            Skip
          </Button>
          <Button variant="suise" onClick={handleNext} className="flex-1">
            {isLastStep ? (
              <>
                <Camera className="w-4 h-4 mr-2" />
                Add First Memory
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
