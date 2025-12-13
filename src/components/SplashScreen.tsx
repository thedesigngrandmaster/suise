import { useEffect } from "react";
import mascot from "@/assets/images/02. Suise's Mascot.png";

interface SplashScreenProps {
  onComplete?: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.();
    }, 6000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-primary flex flex-col items-center justify-center z-50">
      <div className="flex flex-col items-center gap-6 fade-in-up">
        <img 
          src={mascot} 
          alt="Yooma Mascot" 
          className="h-48 w-auto object-contain"
        />
      </div>
    </div>
  );
}
