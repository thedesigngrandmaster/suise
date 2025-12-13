import suiseLogo from "@/assets/images/01. Suise's Logo (Mascot and Wordmark).png";

export function BrandHeader() {
  return (
    <div className="flex items-center gap-2">
      <img 
        src={suiseLogo} 
        alt="Suise Logo" 
        className="h-10 w-auto object-contain"
      />
    </div>
  );
}