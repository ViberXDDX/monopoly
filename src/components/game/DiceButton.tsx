import { motion } from "motion/react";
import { useState } from "react";

interface DiceButtonProps {
  onRoll: (value: number) => void;
  disabled?: boolean;
}

export function DiceButton({ onRoll, disabled }: DiceButtonProps) {
  const [isRolling, setIsRolling] = useState(false);
  const [diceValue, setDiceValue] = useState(6);

  const handleRoll = () => {
    if (disabled || isRolling) return;
    
    setIsRolling(true);
    
    // Animate through random values
    let rolls = 0;
    const interval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      rolls++;
      
      if (rolls >= 10) {
        clearInterval(interval);
        const finalValue = Math.floor(Math.random() * 6) + 1;
        setDiceValue(finalValue);
        setIsRolling(false);
        onRoll(finalValue);
      }
    }, 100);
  };

  const getDots = (value: number) => {
    const positions: Record<number, Array<[number, number]>> = {
      1: [[20, 20]],
      2: [[12, 12], [28, 28]],
      3: [[12, 12], [20, 20], [28, 28]],
      4: [[12, 12], [28, 12], [12, 28], [28, 28]],
      5: [[12, 12], [28, 12], [20, 20], [12, 28], [28, 28]],
      6: [[12, 10], [28, 10], [12, 20], [28, 20], [12, 30], [28, 30]],
    };

    return positions[value].map(([cx, cy], i) => (
      <circle key={i} cx={cx} cy={cy} r="3" fill="#2d1b0e" />
    ));
  };

  return (
    <motion.button
      onClick={handleRoll}
      disabled={disabled || isRolling}
      className={`
        relative w-20 h-20 bg-[#fef9ed] border-4 border-[#2d1b0e] rounded-xl
        shadow-[4px_4px_0px_0px_#2d1b0e]
        ${disabled || isRolling ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
      whileHover={!disabled && !isRolling ? { scale: 1.1, rotate: [0, -5, 5, 0] } : {}}
      whileTap={!disabled && !isRolling ? { scale: 0.95 } : {}}
      animate={isRolling ? { 
        rotate: [0, 360],
        transition: { duration: 0.2, repeat: 10 }
      } : {}}
    >
      <svg viewBox="0 0 40 40" className="w-full h-full p-2">
        <rect x="2" y="2" width="36" height="36" rx="4" fill="#fef9ed" stroke="#2d1b0e" strokeWidth="2" />
        {getDots(diceValue)}
      </svg>

      {/* Label */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
        <span className="text-[0.7rem] text-[#2d1b0e] uppercase tracking-wide">
          Roll
        </span>
      </div>

      {/* Grain texture */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none rounded-xl"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`
        }}
      />
    </motion.button>
  );
}