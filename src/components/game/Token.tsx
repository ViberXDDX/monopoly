import { motion } from "motion/react";

interface TokenProps {
  color: string;
  size?: "sm" | "md";
  position: number;
}

export function Token({ color, size = "md", position }: TokenProps) {
  const sizeClasses = size === "sm" ? "w-4 h-4" : "w-6 h-6";
  
  return (
    <motion.div
      className={`absolute ${sizeClasses} -translate-x-1/2 -translate-y-1/2 z-20`}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      style={{
        left: `${(position % 10) * 10}%`,
        top: `${Math.floor(position / 10) * 10}%`,
      }}
    >
      <svg viewBox="0 0 40 40" className="filter drop-shadow-[2px_2px_0px_#2d1b0e]">
        {/* Token base */}
        <circle cx="20" cy="25" rx="12" ry="6" fill={color} opacity="0.3" />
        
        {/* Token body */}
        <ellipse cx="20" cy="20" rx="15" ry="18" fill={color} stroke="#2d1b0e" strokeWidth="2.5" />
        
        {/* Shine effect */}
        <ellipse cx="16" cy="15" rx="5" ry="7" fill="#fef9ed" opacity="0.6" />
      </svg>
    </motion.div>
  );
}