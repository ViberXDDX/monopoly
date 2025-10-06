import { motion } from "motion/react";
import { ButtonHTMLAttributes, ReactNode } from "react";

interface VintageButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "accent";
}

export function VintageButton({ children, variant = "primary", className = "", ...props }: VintageButtonProps) {
  const variants = {
    primary: "bg-[#c44536] text-[#fef9ed] border-[#2d1b0e] hover:bg-[#a63a2f]",
    secondary: "bg-[#5b9aa8] text-[#fef9ed] border-[#2d1b0e] hover:bg-[#4a8795]",
    accent: "bg-[#f4d35e] text-[#2d1b0e] border-[#2d1b0e] hover:bg-[#e8c54d]"
  };

  return (
    <motion.button
      className={`
        relative px-8 py-4 border-4 border-[#2d1b0e] rounded-lg
        ${variants[variant]}
        shadow-[4px_4px_0px_0px_#2d1b0e]
        transition-all duration-200
        cursor-pointer
        ${className}
      `}
      whileHover={{ 
        scale: 1.05,
        y: -2,
        boxShadow: "6px 6px 0px 0px #2d1b0e"
      }}
      whileTap={{ 
        scale: 0.95,
        y: 0,
        boxShadow: "2px 2px 0px 0px #2d1b0e"
      }}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      {/* Vintage grain texture overlay */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none rounded-md"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`
        }}
      />
    </motion.button>
  );
}
