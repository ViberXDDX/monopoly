import { motion } from "motion/react";
import { CharacterAvatar } from "../CharacterAvatar";

interface PlayerTokenProps {
  playerIndex: number; // 0-3 for the 4 different avatars (keeps identity)
  color: string;
  size?: "sm" | "md" | "lg" | "xlg";
}

export function PlayerToken({ playerIndex, color, size = "md" }: PlayerTokenProps) {
  // Map avatarIndex to a default name/expression for variety
  const avatarNames = ["P1", "P2", "P3", "P4"];
  const expressions: any = ["happy", "surprised", "wink", "determined"];

  // Size variants: for small tokens we'll render a compact circular avatar without the name
  if (size === "sm") {
    return (
      <motion.div
        className="w-5 h-5 relative flex-shrink-0"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.03 }}
      >
        <div className="absolute inset-0 rounded-full border-2 border-[#2d1b0e] overflow-hidden" style={{ backgroundColor: color }} />
        <div className="absolute inset-0 p-0.5">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="36" fill={color} stroke="#2d1b0e" strokeWidth="2" />
            <circle cx="37" cy="45" r="4" fill="#2d1b0e" />
            <circle cx="63" cy="45" r="4" fill="#2d1b0e" />
          </svg>
        </div>
      </motion.div>
    );
  }

  // Medium / Large / XLarge show the full CharacterAvatar (compact)
  const sizeClassMap: Record<string, string> = {
    sm: "w-5 h-5",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    // larger xlg to show full icon in top bar
    xlg: "w-20 h-20",
  };

  const sizeClass = sizeClassMap[size] || sizeClassMap.md;

  return (
    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} whileHover={{ scale: 1.05 }} className={sizeClass}>
      {/* Use a compact CharacterAvatar presentation to avoid name label overflow in tight UI areas (it will still show a small badge when space allows) */}
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <CharacterAvatar name={avatarNames[playerIndex % avatarNames.length]} color={color} expression={expressions[playerIndex % expressions.length]} compact />
        </div>
      </div>
    </motion.div>
  );
}