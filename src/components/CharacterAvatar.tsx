import { motion } from "motion/react";

interface CharacterAvatarProps {
  name: string;
  color: string;
  expression?: "happy" | "surprised" | "wink" | "determined";
}

export function CharacterAvatar({ name, color, expression = "happy" }: CharacterAvatarProps) {
  const getEyes = () => {
    switch (expression) {
      case "happy":
        return (
          <>
            <circle cx="35" cy="45" r="8" fill="#2d1b0e" />
            <circle cx="65" cy="45" r="8" fill="#2d1b0e" />
            <circle cx="37" cy="43" r="3" fill="#fef9ed" />
            <circle cx="67" cy="43" r="3" fill="#fef9ed" />
          </>
        );
      case "surprised":
        return (
          <>
            <circle cx="35" cy="45" r="10" fill="#2d1b0e" />
            <circle cx="65" cy="45" r="10" fill="#2d1b0e" />
            <circle cx="35" cy="45" r="4" fill="#fef9ed" />
            <circle cx="65" cy="45" r="4" fill="#fef9ed" />
          </>
        );
      case "wink":
        return (
          <>
            <circle cx="35" cy="45" r="8" fill="#2d1b0e" />
            <circle cx="37" cy="43" r="3" fill="#fef9ed" />
            <path d="M 58 45 Q 65 42 72 45" stroke="#2d1b0e" strokeWidth="4" fill="none" strokeLinecap="round" />
          </>
        );
      case "determined":
        return (
          <>
            <path d="M 28 45 L 42 48" stroke="#2d1b0e" strokeWidth="4" strokeLinecap="round" />
            <path d="M 58 48 L 72 45" stroke="#2d1b0e" strokeWidth="4" strokeLinecap="round" />
          </>
        );
    }
  };

  const getMouth = () => {
    switch (expression) {
      case "happy":
        return <path d="M 35 65 Q 50 75 65 65" stroke="#2d1b0e" strokeWidth="4" fill="none" strokeLinecap="round" />;
      case "surprised":
        return <ellipse cx="50" cy="68" rx="8" ry="12" fill="#2d1b0e" />;
      case "wink":
        return <path d="M 35 65 Q 50 72 65 65" stroke="#2d1b0e" strokeWidth="4" fill="none" strokeLinecap="round" />;
      case "determined":
        return <line x1="35" y1="68" x2="65" y2="68" stroke="#2d1b0e" strokeWidth="4" strokeLinecap="round" />;
    }
  };

  return (
    <motion.div 
      className="flex flex-col items-center gap-2"
      whileHover={{ scale: 1.1, rotate: [0, -5, 5, -5, 0] }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative">
        <svg width="100" height="100" viewBox="0 0 100 100" className="filter drop-shadow-[3px_3px_0px_#2d1b0e]">
          {/* Main head */}
          <circle cx="50" cy="50" r="40" fill={color} stroke="#2d1b0e" strokeWidth="4" />
          
          {/* Cheeks */}
          <circle cx="25" cy="55" r="8" fill="#c44536" opacity="0.4" />
          <circle cx="75" cy="55" r="8" fill="#c44536" opacity="0.4" />
          
          {/* Eyes */}
          {getEyes()}
          
          {/* Mouth */}
          {getMouth()}
          
          {/* Nose */}
          <ellipse cx="50" cy="55" rx="3" ry="5" fill="#2d1b0e" />
        </svg>
        
        {/* Grain texture overlay */}
        <div 
          className="absolute inset-0 opacity-30 pointer-events-none rounded-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`
          }}
        />
      </div>
      <span className="text-[#2d1b0e] px-3 py-1 bg-[#fef9ed] border-2 border-[#2d1b0e] rounded shadow-[2px_2px_0px_0px_#2d1b0e]">
        {name}
      </span>
    </motion.div>
  );
}
