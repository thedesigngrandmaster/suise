import yoomaWave from "@/assets/yooma-wave.png";
import yoomaCelebrate from "@/assets/yooma-celebrate.png";
import { cn } from "@/lib/utils";

type YoomaVariant = "wave" | "celebrate";

interface YoomaAvatarProps {
  variant?: YoomaVariant;
  size?: "sm" | "md" | "lg" | "xl";
  animate?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "w-16 h-16",
  md: "w-24 h-24",
  lg: "w-32 h-32",
  xl: "w-48 h-48",
};

const images = {
  wave: yoomaWave,
  celebrate: yoomaCelebrate,
};

export function YoomaAvatar({ 
  variant = "wave", 
  size = "md", 
  animate = true,
  className 
}: YoomaAvatarProps) {
  return (
    <img
      src={images[variant]}
      alt="Yooma"
      className={cn(
        sizeClasses[size],
        "object-contain",
        animate && variant === "wave" && "yooma-wave",
        animate && variant === "celebrate" && "yooma-bounce",
        className
      )}
    />
  );
}

export function YoomaPlaceholder({ 
  size = "md",
  className 
}: { 
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  return (
    <div
      className={cn(
        sizeClasses[size],
        "yooma-gradient rounded-full neubrutalist-border flex items-center justify-center animate-float",
        className
      )}
    >
      <span className="text-2xl">✨</span>
    </div>
  );
}