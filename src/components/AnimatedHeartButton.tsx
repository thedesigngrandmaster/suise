import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface AnimatedHeartButtonProps {
  isLoved: boolean;
  loveCount: number;
  onClick: () => void;
  disabled?: boolean;
  showCount?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "ghost" | "overlay";
}

export function AnimatedHeartButton({
  isLoved,
  loveCount,
  onClick,
  disabled = false,
  showCount = true,
  size = "md",
  variant = "default",
}: AnimatedHeartButtonProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    
    setIsAnimating(true);
    onClick();
    
    setTimeout(() => setIsAnimating(false), 300);
  };

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const buttonSizeClasses = {
    sm: "h-8 px-2",
    md: "h-9 px-3",
    lg: "h-10 px-4",
  };

  if (variant === "overlay") {
    return (
      <button
        onClick={handleClick}
        disabled={disabled}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all",
          "bg-background/80 backdrop-blur-sm hover:bg-background/90",
          isLoved && "text-red-500",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <Heart
          className={cn(
            sizeClasses[size],
            "transition-all duration-300",
            isLoved && "fill-current",
            isAnimating && "scale-125"
          )}
        />
        {showCount && (
          <span className="text-sm font-medium">{loveCount}</span>
        )}
      </button>
    );
  }

  return (
    <Button
      variant={variant === "ghost" ? "ghost" : "outline"}
      size="sm"
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        buttonSizeClasses[size],
        "gap-1.5 transition-all",
        isLoved && "text-red-500 border-red-500/30 bg-red-500/10 hover:bg-red-500/20 hover:text-red-500"
      )}
    >
      <Heart
        className={cn(
          sizeClasses[size],
          "transition-all duration-300",
          isLoved && "fill-current",
          isAnimating && "scale-125"
        )}
      />
      {showCount && (
        <span className={cn(
          "transition-all duration-300",
          isAnimating && "scale-110"
        )}>
          {loveCount}
        </span>
      )}
    </Button>
  );
}
