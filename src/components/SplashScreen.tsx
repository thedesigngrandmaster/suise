import mascot from "@/assets/images/02. Suise's Mascot.png";

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
          src={mascot} 
          alt="Yooma Mascot" 
          className="h-48 w-auto object-contain animate-pulse"
        />
      </div>
    </div>
  );
}
