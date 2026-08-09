import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-base font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0 border border-transparent active:translate-y-px active:shadow-neubrutalist-pressed",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-neubrutalist-sm hover:brightness-105",
        destructive: "bg-destructive text-destructive-foreground shadow-neubrutalist-sm hover:brightness-105",
        outline: "border-border/70 bg-card text-foreground shadow-neubrutalist-sm hover:bg-muted",
        secondary: "bg-secondary text-secondary-foreground shadow-neubrutalist-sm hover:brightness-105",
        ghost: "border-transparent shadow-none hover:bg-accent hover:text-accent-foreground",
        link: "border-transparent shadow-none text-foreground underline-offset-4 hover:underline",
        accent: "bg-accent text-accent-foreground shadow-neubrutalist-sm hover:brightness-105",
        suise: "bg-secondary text-secondary-foreground shadow-neubrutalist-sm hover:brightness-110 rounded-full",
      },
      size: {
        default: "h-11 px-5 py-2.5 rounded-full",
        sm: "h-9 px-4 py-2 rounded-full text-sm",
        lg: "h-12 px-8 py-4 rounded-full text-base",
        icon: "h-11 w-11 rounded-full",
        fab: "h-16 w-16 rounded-full shadow-neubrutalist",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };