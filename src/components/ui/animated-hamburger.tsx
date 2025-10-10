"use client";

import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";

interface AnimatedHamburgerProps {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
}

export function AnimatedHamburger({ isOpen, onClick, className }: AnimatedHamburgerProps) {
  return (
    <button
      onClick={onClick}
      className={`relative w-6 h-6 flex items-center justify-center ${className}`}
    >
      <motion.svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        animate={isOpen ? "open" : "closed"}
        className="w-6 h-6"
      >
        {/* Top line */}
        <motion.line
          x1="4"
          y1="6"
          x2="20"
          y2="6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          variants={{
            closed: { rotate: 0, y: 0 },
            open: { rotate: 45, y: 6 }
          }}
          transition={{ duration: 0.2 }}
        />
        
        {/* Middle line */}
        <motion.line
          x1="4"
          y1="12"
          x2="20"
          y2="12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          variants={{
            closed: { opacity: 1 },
            open: { opacity: 0 }
          }}
          transition={{ duration: 0.2 }}
        />
        
        {/* Bottom line */}
        <motion.line
          x1="4"
          y1="18"
          x2="20"
          y2="18"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          variants={{
            closed: { rotate: 0, y: 0 },
            open: { rotate: -45, y: -6 }
          }}
          transition={{ duration: 0.2 }}
        />
      </motion.svg>
    </button>
  );
}