import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // Confidence badges for CB Lens
        "confidence-high": "border-transparent bg-confidence-high text-white shadow-sm",
        "confidence-medium": "border-transparent bg-confidence-medium text-white shadow-sm",
        "confidence-low": "border-transparent bg-confidence-low text-white shadow-sm",
        // Nutrition badges
        protein: "border-transparent bg-accent-vibrant/20 text-accent-vibrant border-accent-vibrant/30",
        carbs: "border-transparent bg-primary-light/20 text-primary border-primary/30",
        fat: "border-transparent bg-warm-sand/60 text-secondary-dark border-warm-sand",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
