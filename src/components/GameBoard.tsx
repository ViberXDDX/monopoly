import { motion } from "motion/react";

export function GameBoard() {
  const properties = [
    { name: "START", color: "#c44536", position: "corner" },
    { name: "PARK AVE", color: "#5b9aa8" },
    { name: "LUCKY DRAW", color: "#f4d35e" },
    { name: "MAIN ST", color: "#5b9aa8" },
    { name: "TAX TIME", color: "#e8dcc4" },
    { name: "RAILROAD", color: "#2d1b0e" },
    { name: "BROADWAY", color: "#e8956f" },
    { name: "CHANCE", color: "#f4d35e" },
    { name: "PLAZA", color: "#e8956f" },
    { name: "HOTEL", color: "#e8956f" },
    { name: "JAIL", color: "#c44536", position: "corner" },
  ];

  const PropertySpace = ({ name, color, position }: { name: string; color: string; position?: string }) => {
    const isCorner = position === "corner";

    return (
      <motion.div
        className={`
          bg-[#fef9ed] border-4 border-[#2d1b0e] relative overflow-hidden
          ${isCorner ? "w-32 h-32" : "w-24 h-32"}
        `}
        whileHover={{ scale: 1.05 }}
      >
        <div
          className={`${isCorner ? "h-12" : "h-8"} border-b-4 border-[#2d1b0e]`}
          style={{ backgroundColor: color }}
        />
        <div className="p-2 flex items-center justify-center h-full">
          <span className="text-[0.7rem] text-center text-[#2d1b0e] uppercase tracking-tight leading-tight">
            {name}
          </span>
        </div>
        {/* Grain */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`
          }}
        />
      </motion.div>
    );
  };

  return (
    <div className="relative w-[600px] h-[600px] bg-[#e8dcc4] border-8 border-[#2d1b0e] rounded-lg shadow-[8px_8px_0px_0px_#2d1b0e]">
      {/* Board edges */}
      {/* Bottom row */}
      <div className="absolute bottom-0 left-0 right-0 flex">
        <PropertySpace name="JAIL" color="#c44536" position="corner" />
        <PropertySpace name="AVENUE A" color="#c44536" />
        <PropertySpace name="CHANCE" color="#f4d35e" />
        <PropertySpace name="AVENUE B" color="#c44536" />
        <PropertySpace name="AVENUE C" color="#c44536" />
        <PropertySpace name="STATION" color="#2d1b0e" />
        <PropertySpace name="AVENUE D" color="#5b9aa8" />
      </div>

      {/* Left column */}
      <div className="absolute left-0 top-0 bottom-32 flex flex-col">
        <PropertySpace name="START" color="#5b9aa8" position="corner" />
        <div className="rotate-90 origin-top-left translate-x-32">
          <PropertySpace name="STREET 1" color="#e8956f" />
        </div>
        <div className="rotate-90 origin-top-left translate-x-32 translate-y-24">
          <PropertySpace name="LUCKY" color="#f4d35e" />
        </div>
        <div className="rotate-90 origin-top-left translate-x-32 translate-y-48">
          <PropertySpace name="STREET 2" color="#e8956f" />
        </div>
      </div>

      {/* Top row */}
      <div className="absolute top-0 left-0 right-0 flex">
        <PropertySpace name="PARK" color="#f4d35e" position="corner" />
        <PropertySpace name="PLAZA A" color="#8b6f47" />
        <PropertySpace name="TAX" color="#e8dcc4" />
        <PropertySpace name="PLAZA B" color="#8b6f47" />
        <PropertySpace name="PLAZA C" color="#8b6f47" />
        <PropertySpace name="DEPOT" color="#2d1b0e" />
        <PropertySpace name="PLAZA D" color="#e8956f" />
      </div>

      {/* Right column */}
      <div className="absolute right-0 top-32 bottom-0 flex flex-col items-end">
        <div className="rotate-[-90deg] origin-top-right -translate-x-32">
          <PropertySpace name="BLVD 1" color="#5b9aa8" />
        </div>
        <div className="rotate-[-90deg] origin-top-right -translate-x-32 -translate-y-24">
          <PropertySpace name="CHANCE" color="#f4d35e" />
        </div>
        <div className="rotate-[-90deg] origin-top-right -translate-x-32 -translate-y-48">
          <PropertySpace name="BLVD 2" color="#5b9aa8" />
        </div>
        <PropertySpace name="TAX" color="#e8dcc4" position="corner" />
      </div>

      {/* Center area */}
      <div className="absolute inset-32 flex items-center justify-center bg-[#fef9ed] border-4 border-[#2d1b0e] rounded-lg">
        <motion.div
          className="text-center"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <h2 className="text-[#2d1b0e] mb-4 uppercase tracking-widest">Monopoly</h2>
          <p className="text-[#6b5642] uppercase text-[0.8rem] tracking-wide">Board Game</p>

          {/* Decorative dice */}
          <div className="flex gap-4 justify-center mt-6">
            <motion.div
              className="w-12 h-12 bg-[#fef9ed] border-3 border-[#2d1b0e] rounded-lg shadow-[3px_3px_0px_0px_#2d1b0e] flex items-center justify-center"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <div className="grid grid-cols-2 gap-1 p-2">
                <div className="w-2 h-2 bg-[#2d1b0e] rounded-full" />
                <div className="w-2 h-2 bg-[#2d1b0e] rounded-full" />
                <div className="w-2 h-2 bg-[#2d1b0e] rounded-full" />
                <div className="w-2 h-2 bg-[#2d1b0e] rounded-full" />
              </div>
            </motion.div>
            <motion.div
              className="w-12 h-12 bg-[#fef9ed] border-3 border-[#2d1b0e] rounded-lg shadow-[3px_3px_0px_0px_#2d1b0e] flex items-center justify-center"
              whileHover={{ rotate: -360 }}
              transition={{ duration: 0.5 }}
            >
              <div className="grid grid-cols-3 gap-1 p-2">
                <div className="w-2 h-2 bg-[#2d1b0e] rounded-full" />
                <div />
                <div className="w-2 h-2 bg-[#2d1b0e] rounded-full" />
                <div />
                <div className="w-2 h-2 bg-[#2d1b0e] rounded-full" />
                <div />
                <div className="w-2 h-2 bg-[#2d1b0e] rounded-full" />
                <div />
                <div className="w-2 h-2 bg-[#2d1b0e] rounded-full" />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Overall grain texture */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none rounded-lg"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 600 600' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`
        }}
      />
    </div>
  );
}
