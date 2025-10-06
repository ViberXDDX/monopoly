import { motion } from "motion/react";
import { VintageButton } from "./VintageButton";
import { Play, Users, Settings, Trophy } from "lucide-react";

interface MainMenuProps {
  onStartGame: () => void;
}

export function MainMenu({ onStartGame }: MainMenuProps) {
  return (
    <div className="min-h-screen bg-[#f5f1e8] flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating circles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border-4 border-[#2d1b0e] opacity-20"
            style={{
              width: Math.random() * 100 + 50,
              height: Math.random() * 100 + 50,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              rotate: [0, 360],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Radial lines */}
        <div className="absolute inset-0 opacity-10">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute top-1/2 left-1/2 w-1 h-96 bg-[#2d1b0e] origin-top"
              style={{
                transform: `rotate(${i * 30}deg)`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10">
        {/* Title banner */}
        <motion.div
          className="mb-12"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            damping: 10,
            stiffness: 100,
          }}
        >
          {/* Decorative banner background */}
          <div className="relative">
            {/* Top ribbon */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-[#c44536] border-4 border-[#2d1b0e] transform -skew-y-2" />
            
            {/* Main title container */}
            <div className="relative bg-[#f4d35e] border-8 border-[#2d1b0e] rounded-2xl px-16 py-8 shadow-[10px_10px_0px_0px_#2d1b0e]">
              {/* Title text */}
              <motion.h1
                className="text-[4rem] text-[#2d1b0e] uppercase tracking-wider text-center relative"
                style={{
                  textShadow: "4px 4px 0px #fef9ed, 8px 8px 0px rgba(45, 27, 14, 0.3)",
                }}
                animate={{
                  y: [0, -8, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                Monopoly
              </motion.h1>
              
              {/* Subtitle */}
              <p className="text-center text-[#2d1b0e] uppercase tracking-widest mt-2">
                ~ Vintage Edition ~
              </p>

              {/* Decorative elements */}
              <div className="absolute -left-6 top-1/2 -translate-y-1/2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                >
                  <svg width="40" height="40" viewBox="0 0 40 40">
                    <circle cx="20" cy="20" r="15" fill="#5b9aa8" stroke="#2d1b0e" strokeWidth="3" />
                    <circle cx="20" cy="20" r="8" fill="#fef9ed" stroke="#2d1b0e" strokeWidth="2" />
                  </svg>
                </motion.div>
              </div>
              <div className="absolute -right-6 top-1/2 -translate-y-1/2">
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                >
                  <svg width="40" height="40" viewBox="0 0 40 40">
                    <circle cx="20" cy="20" r="15" fill="#c44536" stroke="#2d1b0e" strokeWidth="3" />
                    <circle cx="20" cy="20" r="8" fill="#fef9ed" stroke="#2d1b0e" strokeWidth="2" />
                  </svg>
                </motion.div>
              </div>

              {/* Grain texture */}
              <div 
                className="absolute inset-0 opacity-20 pointer-events-none rounded-2xl"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`
                }}
              />
            </div>

            {/* Bottom ribbon */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-[#5b9aa8] border-4 border-[#2d1b0e] transform skew-y-2" />
          </div>
        </motion.div>

        {/* Menu buttons */}
        <motion.div
          className="flex flex-col gap-4 items-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <VintageButton variant="primary" className="w-64 flex items-center justify-center gap-3" onClick={onStartGame}>
            <Play className="w-6 h-6" />
            <span>Start Game</span>
          </VintageButton>
          
          <VintageButton variant="secondary" className="w-64 flex items-center justify-center gap-3">
            <Users className="w-6 h-6" />
            <span>Multiplayer</span>
          </VintageButton>
          
          <VintageButton variant="accent" className="w-64 flex items-center justify-center gap-3">
            <Trophy className="w-6 h-6" />
            <span>Leaderboard</span>
          </VintageButton>
          
          <VintageButton variant="secondary" className="w-64 flex items-center justify-center gap-3">
            <Settings className="w-6 h-6" />
            <span>Settings</span>
          </VintageButton>
        </motion.div>

        {/* Decorative footer text */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="inline-block bg-[#fef9ed] border-3 border-[#2d1b0e] rounded-full px-6 py-2 shadow-[4px_4px_0px_0px_#2d1b0e]">
            <p className="text-[#6b5642] uppercase tracking-widest text-[0.9rem]">
              Est. 1935 • Rubber-Hose Style
            </p>
          </div>
        </motion.div>
      </div>

      {/* Overall grain texture */}
      <div 
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 1000 1000' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`
        }}
      />
    </div>
  );
}
