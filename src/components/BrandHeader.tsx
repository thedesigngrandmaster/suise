import suiseLogo from "@/assets/images/01. Suise's Logo (Mascot and Wordmark).png";
import mascot from "@/assets/images/02. Suise's Mascot.png";

interface BrandHeaderProps {
  collapsed?: boolean;
}

export function BrandHeader({ collapsed }: BrandHeaderProps) {
  return (
    <div className="flex items-center gap-2">
      <img 
        src={collapsed ? mascot : suiseLogo} 
        alt="Suise" 
        className={collapsed ? "h-10 w-auto" : "h-12 w-auto object-contain"}
      />

    </div>
  );
}