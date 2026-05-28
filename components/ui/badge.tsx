import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-white/15 bg-white/10 text-slate-100",
        blue: "border-blue-400/30 bg-blue-500/15 text-blue-100",
        green: "border-emerald-400/30 bg-emerald-500/15 text-emerald-100",
        yellow: "border-amber-400/40 bg-amber-500/15 text-amber-100",
        red: "border-red-400/40 bg-red-500/15 text-red-100",
        dark: "border-slate-200 bg-slate-950 text-white"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
