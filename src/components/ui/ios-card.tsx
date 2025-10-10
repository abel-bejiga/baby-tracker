"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface IOSCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "liquid";
  intensity?: "low" | "medium" | "high";
  classValue?: string;
}

const IOSCard = forwardRef<HTMLDivElement, IOSCardProps>(
  ({ className, variant = "default", intensity = "medium", classValue="", children, ...props }, ref) => {
    const getVariantClasses = () => {
      switch (variant) {
        case "glass":
          return "bg-white/10 backdrop-blur-xl border-white/20 shadow-lg";
        case "liquid":
          return "bg-gradient-to-br from-white/20 via-white/10 to-white/5 backdrop-blur-2xl border-white/30 shadow-2xl";
        default:
          return "bg-white/80 backdrop-blur-lg border-white/40 shadow-xl";
      }
    };

    const getIntensityClasses = () => {
      switch (intensity) {
        case "low":
          return "rounded-2xl";
        case "high":
          return "rounded-[2.5rem]";
        default:
          return "rounded-3xl";
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl",
          getVariantClasses(),
          getIntensityClasses(),
          "border",
          className
        )}
        {...props}
      >
        {/* Liquid-like background effect */}
        {variant === "liquid" && (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 via-purple-100/20 to-pink-100/20 animate-pulse" />
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,rgba(120,119,198,0.1),transparent_50%)]" />
            <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,rgba(120,119,198,0.1),transparent_50%)]" />
          </>
        )}
        
        {/* Subtle inner shadow for depth */}
        <div className="absolute inset-0 rounded-[inherit] shadow-inner shadow-black/5" />
        
        <div className={cn("relative z-10", classValue)}>{children}</div>
      </div>
    );
  }
);

IOSCard.displayName = "IOSCard";

const IOSCardHeader = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));

IOSCardHeader.displayName = "IOSCardHeader";

const IOSCardTitle = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));

IOSCardTitle.displayName = "IOSCardTitle";

const IOSCardDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));

IOSCardDescription.displayName = "IOSCardDescription";

const IOSCardContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));

IOSCardContent.displayName = "IOSCardContent";

const IOSCardFooter = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));

IOSCardFooter.displayName = "IOSCardFooter";

export { IOSCard, IOSCardHeader, IOSCardFooter, IOSCardTitle, IOSCardDescription, IOSCardContent };