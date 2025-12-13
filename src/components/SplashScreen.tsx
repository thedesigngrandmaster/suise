import suiseLogo from "@/assets/images/01. Suise's Logo (Mascot and Wordmark).png";

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
        <img 
          src={suiseLogo} 
          alt="Suise Logo" 
          className="h-32 w-auto object-contain"
        />
        
        <p className="text-foreground/80 font-semibold text-lg font-bricolage">
          Your memory vault
        </p>
      </div>
      
      <p className="absolute bottom-12 text-foreground/60 text-sm font-medium animate-pulse">
        Tap anywhere to continue
      </p>
    </div>
  );
}