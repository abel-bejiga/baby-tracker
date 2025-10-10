"use client";

import { forwardRef, useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LiquidCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "bubble" | "wave" | "organic";
  colorScheme?: "blue" | "purple" | "pink" | "green" | "rainbow";
  intensity?: "subtle" | "medium" | "strong";
  interactive?: boolean;
}

const LiquidCard = forwardRef<HTMLDivElement, LiquidCardProps>(
  ({ 
    className, 
    variant = "bubble", 
    colorScheme = "blue", 
    intensity = "medium", 
    interactive = true,
    children, 
    ...props 
  }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    const getColorScheme = () => {
      const schemes = {
        blue: ["#3B82F6", "#1E40AF", "#60A5FA"],
        purple: ["#8B5CF6", "#5B21B6", "#A78BFA"],
        pink: ["#EC4899", "#BE185D", "#F472B6"],
        green: ["#10B981", "#047857", "#34D399"],
        rainbow: ["#3B82F6", "#8B5CF6", "#EC4899", "#10B981"]
      };
      return schemes[colorScheme];
    };

    const getIntensityClasses = () => {
      const baseClasses = "relative overflow-hidden backdrop-blur-xl border";
      const intensityClasses = {
        subtle: "bg-white/20 border-white/30 shadow-lg",
        medium: "bg-white/30 border-white/40 shadow-xl",
        strong: "bg-white/40 border-white/50 shadow-2xl"
      };
      return `${baseClasses} ${intensityClasses[intensity]}`;
    };

    useEffect(() => {
      if (variant === "bubble" && canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const bubbles: Array<{x: number, y: number, radius: number, dx: number, dy: number, color: string}> = [];
        const colors = getColorScheme();

        // Create bubbles
        for (let i = 0; i < 15; i++) {
          bubbles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 30 + 10,
            dx: (Math.random() - 0.5) * 2,
            dy: (Math.random() - 0.5) * 2,
            color: colors[Math.floor(Math.random() * colors.length)]
          });
        }

        const animate = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          bubbles.forEach(bubble => {
            // Update position
            bubble.x += bubble.dx;
            bubble.y += bubble.dy;

            // Bounce off walls
            if (bubble.x + bubble.radius > canvas.width || bubble.x - bubble.radius < 0) {
              bubble.dx = -bubble.dx;
            }
            if (bubble.y + bubble.radius > canvas.height || bubble.y - bubble.radius < 0) {
              bubble.dy = -bubble.dy;
            }

            // Draw bubble
            ctx.beginPath();
            ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
            ctx.fillStyle = bubble.color + "20"; // Add transparency
            ctx.fill();
            ctx.strokeStyle = bubble.color + "40";
            ctx.lineWidth = 2;
            ctx.stroke();
          });

          requestAnimationFrame(animate);
        };

        animate();
      }
    }, [variant, colorScheme]);

    const renderLiquidBackground = () => {
      const colors = getColorScheme();
      
      switch (variant) {
        case "bubble":
          return (
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full opacity-30"
              width={400}
              height={300}
            />
          );
        case "wave":
          return (
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -bottom-1/4 left-0 w-full h-full">
                <div 
                  className="absolute inset-0 opacity-20"
                  style={{
                    background: `linear-gradient(45deg, ${colors[0]}20, ${colors[1]}20, ${colors[2]}20)`,
                    borderRadius: "50%",
                    transform: "scale(1.5)",
                    animation: "wave 6s ease-in-out infinite"
                  }}
                />
              </div>
            </div>
          );
        case "organic":
          return (
            <div className="absolute inset-0">
              <div className="absolute top-0 left-0 w-full h-full">
                <div 
                  className="absolute top-1/4 left-1/4 w-1/2 h-1/2 rounded-full opacity-20"
                  style={{
                    background: `radial-gradient(circle, ${colors[0]}30, transparent 70%)`,
                    filter: "blur(40px)"
                  }}
                />
                <div 
                  className="absolute bottom-1/4 right-1/4 w-1/3 h-1/3 rounded-full opacity-20"
                  style={{
                    background: `radial-gradient(circle, ${colors[1]}30, transparent 70%)`,
                    filter: "blur(30px)"
                  }}
                />
              </div>
            </div>
          );
        default:
          return null;
      }
    };

    return (
      <motion.div
        ref={ref}
        className={cn(
          "rounded-3xl transition-all duration-500",
          getIntensityClasses(),
          interactive && "hover:scale-[1.02] hover:shadow-2xl cursor-pointer",
          className
        )}
        whileHover={interactive ? { scale: 1.02 } : {}}
        onHoverStart={() => interactive && setIsHovered(true)}
        onHoverEnd={() => interactive && setIsHovered(false)}
        {...props}
      >
        {/* Liquid background effects */}
        {renderLiquidBackground()}
        
        {/* Interactive glow effect */}
        {interactive && isHovered && (
          <motion.div
            className="absolute inset-0 rounded-3xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            exit={{ opacity: 0 }}
            style={{
              background: `radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${getColorScheme()[0]}40, transparent 50%)`
            }}
          />
        )}
        
        {/* Content overlay */}
        <div className="relative z-10 bg-gradient-to-br from-white/10 via-white/5 to-transparent rounded-3xl py-2">
          {children}
        </div>
        
        {/* Subtle border animation */}
        <motion.div
          className="absolute inset-0 rounded-3xl border-2 border-transparent"
          animate={{
            borderColor: isHovered ? `${getColorScheme()[0]}40` : "transparent"
          }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>
    );
  }
);

LiquidCard.displayName = "LiquidCard";

// Add CSS animation for wave effect
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = `
    @keyframes wave {
      0%, 100% { transform: scale(1.5) translateY(0); }
      50% { transform: scale(1.6) translateY(-20px); }
    }
  `;
  document.head.appendChild(style);
}

export { LiquidCard };