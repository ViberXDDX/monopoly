import { motion } from "motion/react";
import { ReactNode } from "react";
import { Gift, Zap } from "lucide-react";

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
      case "right":
        return "rotate-[-90deg]";
      default:
        return "";
    }
  };

  return (
    <motion.div
      className={`bg-[#fef9ed] border-3 border-[#2d1b0e] relative overflow-hidden cursor-pointer`}
      style={{ width: "100%", height: "100%" }}
      whileHover={{ scale: 1.03, zIndex: 10 }}
      onClick={onClick}
    >
      {/* Color banner for properties: horizontal for top/bottom, vertical for left/right */}
      {type === "property" && color && !isCorner && (
        (orientation === "top" || orientation === "bottom") ? (
          orientation === "top" ? (
            // top-row tiles: color panel should face down (toward board center)
            <div className="absolute bottom-0 w-full" style={{ backgroundColor: color, height: "14%" }} />
          ) : (
            // bottom-row tiles: color panel at top
            <div className="w-full" style={{ backgroundColor: color, height: "14%" }} />
          )
        ) : (
          // For left column we want the color panel to face right (toward center)
          // For right column we want the color panel to face left
          orientation === "left" ? (
            <div className="absolute right-0 top-0 bottom-0" style={{ backgroundColor: color, width: "14%" }} />
          ) : (
            <div className="absolute left-0 top-0 bottom-0" style={{ backgroundColor: color, width: "14%" }} />
          )
        )
      )}

      {/* Special tile headers */}
      {type === "chance" && (
        <div className="absolute top-0 left-0 right-0 flex items-center justify-center" style={{ height: '22%' }}>
          <div className="bg-[#c44536] text-white rounded-md px-2 py-1 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            <span className="text-[0.6rem] font-bold uppercase">Chance</span>
          </div>
        </div>
      )}
      {type === "chest" && (
        <div className="absolute top-0 left-0 right-0 flex items-center justify-center" style={{ height: '22%' }}>
          <div className="bg-[#f4d35e] text-[#2d1b0e] rounded-md px-2 py-1 flex items-center gap-2 border-2 border-[#2d1b0e]">
            <Gift className="w-4 h-4" />
            <span className="text-[0.6rem] font-bold uppercase">Community Chest</span>
          </div>
        </div>
      )}
      {/* Rotate only the inner content so banners remain positioned correctly */}
      <div className={getRotation()} style={{ width: "100%", height: "100%" }}>
        {(type === "railroad" || type === "utility") && (
          (orientation === "top" || orientation === "bottom") ? (
            <div className="h-6 bg-[#2d1b0e] border-b-3 border-[#2d1b0e] flex items-center justify-center">
              {icon}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="w-6 h-6 bg-[#2d1b0e] flex items-center justify-center">
                {icon}
              </div>
            </div>
          )
        )}

        {/* Content */}
        <div className="p-1 flex flex-col items-center justify-center h-full text-center" style={{ boxSizing: "border-box" }}>
          <span className="text-[0.5rem] font-semibold text-[#2d1b0e] uppercase tracking-tight leading-tight">
            {name}
          </span>
          {price && (
            <span className="text-[0.5rem] font-medium text-[#6b5642] mt-0.5">${price}</span>
          )}
        </div>
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
