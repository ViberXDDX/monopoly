import { motion } from "motion/react";
import avatarImage from "figma:asset/27882c2ca074455c0ceedbdc3e8fac50e0a85dfc.png";

interface PlayerTokenProps {
  playerIndex: number; // 0-3 for the 4 different avatars
  color: string;
  size?: "sm" | "md" | "lg";
}

export function PlayerToken({ playerIndex, color, size = "md" }: PlayerTokenProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };

  // Calculate sprite position based on player index
  // The image has 4 avatars in a row
  const spriteWidth = 25; // percentage per avatar (100 / 4)
  const xPosition = playerIndex * spriteWidth;

  return (
    <motion.div
      className={`${sizeClasses[size]} relative flex-shrink-0`}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
    >
      {/* Avatar background circle */}
      <div 
        className="absolute inset-0 rounded-full border-3 border-[#2d1b0e] shadow-[2px_2px_0px_0px_#2d1b0e]"
        style={{ backgroundColor: color }}
      />
      
      {/* Avatar sprite */}
      <div 
        className="absolute inset-0 rounded-full overflow-hidden"
        style={{
          backgroundImage: `url(${avatarImage})`,
          backgroundSize: '400% 100%',
          backgroundPosition: `${xPosition}% 0%`,
        }}
      />
      
      {/* Grain texture overlay */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none rounded-full"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`
        }}
      />
    </motion.div>
  );
}