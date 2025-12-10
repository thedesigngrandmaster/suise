import { YoomaAvatar } from "./YoomaAvatar";
import { cn } from "@/lib/utils";

interface SplashScreenProps {
  onComplete?: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  return (
    <div 
      className="fixed inset-0 bg-primary flex flex-col items-center justify-center z-50 cursor-pointer"
      onClick={onComplete}
    >
      <div className="flex flex-col items-center gap-6 fade-in-up">
        <YoomaAvatar variant="wave" size="xl" animate />
        
        <div className="text-center">
          <h1 className="text-5xl font-black text-foreground tracking-tight">
            Suise
          </h1>
          <p className="text-foreground/80 font-semibold mt-2">
            Your memory vault
          </p>
        </div>
      </div>
      
      <p className="absolute bottom-12 text-foreground/60 text-sm font-medium animate-pulse">
        Tap anywhere to continue
      </p>
    </div>
  );
}