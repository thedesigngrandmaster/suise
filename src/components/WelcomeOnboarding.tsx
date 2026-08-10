import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FolderHeart, Users, ArrowRightLeft } from "lucide-react";
import mascot from "@/assets/images/02. Suise's Mascot.png";

const STEPS = [
  {
    icon: FolderHeart,
    title: "Everything lives in folders",
    body: "A folder is a little home for a set of memories — a trip, a family, a year. Private until you decide otherwise.",
  },
  {
    icon: Users,
    title: "Share the ones that matter",
    body: "Invite co-owners so everyone can add their side of the story. One folder, many hands.",
  },
  {
    icon: ArrowRightLeft,
    title: "Ownership can be handed over",
    body: "When a folder should belong to someone else, hand it over. It takes a deliberate confirmation, and it's permanent.",
  },
];

interface WelcomeOnboardingProps {
  open: boolean;
  onComplete: () => void;
}

export function WelcomeOnboarding({ open, onComplete }: WelcomeOnboardingProps) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onComplete()}>
      <DialogContent className="sm:max-w-md rounded-3xl text-center p-6 sm:p-8">
        <img src={mascot} alt="" className="w-20 h-20 mx-auto object-contain" />

        <div className="w-14 h-14 mx-auto rounded-3xl bg-secondary/12 flex items-center justify-center">
          <Icon className="w-7 h-7 text-secondary" />
        </div>

        <h2 className="text-xl font-bold font-bricolage">{current.title}</h2>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">{current.body}</p>

        <div className="flex items-center justify-center gap-1.5 pt-1" aria-hidden>
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === step ? "w-6 bg-secondary" : "w-1.5 bg-muted"
              )}
            />
          ))}
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <Button
            variant="suise"
            size="lg"
            onClick={() => (isLast ? onComplete() : setStep((s) => s + 1))}
          >
            {isLast ? "Start my first folder" : "Next"}
          </Button>
          {!isLast && (
            <button
              onClick={onComplete}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}