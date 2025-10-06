import { motion } from "motion/react";
import { ReactNode } from "react";

interface BoardTileProps {
  type:
    | "property"
    | "corner"
    | "chance"
    | "chest"
    | "railroad"
    | "utility"
    | "tax";
  name: string;
  color?: string;
  price?: number;
  owner?: string;
  position: number;
  orientation?: "bottom" | "left" | "top" | "right";
  isCorner?: boolean;
  icon?: ReactNode;
  onClick?: () => void;
}

export function BoardTile({
  type,
  name,
  color,
  price,
  owner,
  position,
  orientation = "bottom",
  isCorner = false,
  icon,
  onClick,
}: BoardTileProps) {
  const getRotation = () => {
    switch (orientation) {
      case "left":
        return "rotate-90";
      case "top":
        return "rotate-180";
      case "right":
        return "rotate-[-90deg]";
      default:
        return "";
    }
  };

  return (
    <motion.div
      className={`
        bg-[#fef9ed] border-3 border-[#2d1b0e] relative overflow-hidden cursor-pointer
        ${isCorner ? "w-full h-full" : "w-full h-24"}
        ${getRotation()}
      `}
      whileHover={{ scale: 1.05, zIndex: 10 }}
      onClick={onClick}
    >
      {/* Color banner for properties */}
      {type === "property" && color && (
        <div
          className="h-6 border-b-3 border-[#2d1b0e]"
          style={{ backgroundColor: color }}
        />
      )}

      {/* Special tile headers */}
      {(type === "railroad" || type === "utility") && (
        <div className="h-6 bg-[#2d1b0e] border-b-3 border-[#2d1b0e] flex items-center justify-center">
          {icon}
        </div>
      )}

      {/* Content */}
      <div className="p-1 flex flex-col items-center justify-center h-full text-center">
        <span className="text-[0.5rem] text-[#2d1b0e] uppercase tracking-tight leading-tight">
          {name}
        </span>
        {price && (
          <span className="text-[0.4rem] text-[#6b5642] mt-0.5">${price}</span>
        )}
      </div>

      {/* Owner indicator */}
      {owner && (
        <div
          className="absolute top-0 right-0 w-3 h-3 border-2 border-[#2d1b0e] rounded-full"
          style={{ backgroundColor: owner }}
        />
      )}

      {/* Grain texture */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
        }}
      />
    </motion.div>
  );
}
