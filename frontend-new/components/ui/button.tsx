import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 px-5 py-2 font-medium text-base border-2 transition-all duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-primary-500 text-white border-primary-600 hover:bg-primary-600 hover:border-primary-700 focus-visible:ring-primary-500",
        secondary:
          "bg-white text-neutral-900 border-neutral-300 hover:border-neutral-400 hover:shadow-sm focus-visible:ring-neutral-400",
        accent:
          "bg-accent-500 text-white border-accent-600 hover:bg-accent-600 hover:border-accent-700 focus-visible:ring-accent-500",
        outline:
          "border border-neutral-200 bg-white hover:bg-neutral-100 hover:text-neutral-900 text-neutral-900",
        ghost:
          "border-transparent hover:bg-neutral-100 hover:text-neutral-900 focus-visible:ring-neutral-400",
        link: "text-primary-600 underline-offset-4 hover:underline focus-visible:ring-primary-500 border-transparent px-0",
      },
      size: {
        sm: "h-8 px-3 py-1 text-sm",
        md: "h-10 px-5 py-2 text-base",
        lg: "h-13 px-8 py-3 text-lg",
        icon: "h-10 w-10 px-0",
      },
      radius: {
        none: "rounded-none",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      radius: "none",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
