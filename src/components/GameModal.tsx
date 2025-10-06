import { motion, AnimatePresence } from "motion/react";
import { ReactNode } from "react";
import { X } from "lucide-react";

interface GameModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function GameModal({ isOpen, onClose, title, children }: GameModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-[#2d1b0e] bg-opacity-60 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              rotate: 0,
              transition: {
                type: "spring",
                damping: 15,
                stiffness: 300
              }
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.5, 
              rotate: 10,
              transition: {
                duration: 0.2
              }
            }}
          >
            <div className="relative max-w-lg w-full bg-[#fef9ed] border-4 border-[#2d1b0e] rounded-2xl shadow-[8px_8px_0px_0px_#2d1b0e] overflow-hidden">
              {/* Decorative header wave */}
              <div className="h-4 bg-[#c44536] border-b-4 border-[#2d1b0e] relative">
                <div className="absolute bottom-0 left-0 right-0 h-2 bg-[#fef9ed]"
                  style={{
                    clipPath: "polygon(0 0, 5% 100%, 10% 0, 15% 100%, 20% 0, 25% 100%, 30% 0, 35% 100%, 40% 0, 45% 100%, 50% 0, 55% 100%, 60% 0, 65% 100%, 70% 0, 75% 100%, 80% 0, 85% 100%, 90% 0, 95% 100%, 100% 0, 100% 100%, 0 100%)"
                  }}
                />
              </div>

              {/* Content */}
              <div className="p-8">
                {/* Title with decorative elements */}
                <div className="relative mb-6">
                  <motion.h2 
                    className="text-center text-[#2d1b0e] uppercase tracking-wider relative z-10"
                    animate={{ 
                      y: [0, -3, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    {title}
                  </motion.h2>
                  
                  {/* Decorative stars */}
                  <motion.div 
                    className="absolute -left-8 top-1/2 -translate-y-1/2"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20">
                      <path d="M10 0 L12 8 L20 10 L12 12 L10 20 L8 12 L0 10 L8 8 Z" fill="#f4d35e" stroke="#2d1b0e" strokeWidth="1.5" />
                    </svg>
                  </motion.div>
                  <motion.div 
                    className="absolute -right-8 top-1/2 -translate-y-1/2"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20">
                      <path d="M10 0 L12 8 L20 10 L12 12 L10 20 L8 12 L0 10 L8 8 Z" fill="#f4d35e" stroke="#2d1b0e" strokeWidth="1.5" />
                    </svg>
                  </motion.div>
                </div>

                {/* Children content */}
                <div className="mb-6">
                  {children}
                </div>
              </div>

              {/* Close button */}
              <motion.button
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 bg-[#c44536] border-3 border-[#2d1b0e] rounded-full flex items-center justify-center shadow-[3px_3px_0px_0px_#2d1b0e]"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-6 h-6 text-[#fef9ed]" />
              </motion.button>

              {/* Decorative footer wave */}
              <div className="h-4 bg-[#5b9aa8] border-t-4 border-[#2d1b0e] relative">
                <div className="absolute top-0 left-0 right-0 h-2 bg-[#fef9ed]"
                  style={{
                    clipPath: "polygon(0 100%, 5% 0, 10% 100%, 15% 0, 20% 100%, 25% 0, 30% 100%, 35% 0, 40% 100%, 45% 0, 50% 100%, 55% 0, 60% 100%, 65% 0, 70% 100%, 75% 0, 80% 100%, 85% 0, 90% 100%, 95% 0, 100% 100%, 100% 0, 0 0)"
                  }}
                />
              </div>

              {/* Grain texture */}
              <div 
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`
                }}
              />

              {/* Corner decorations */}
              <div className="absolute top-16 left-4 w-6 h-6 border-t-3 border-l-3 border-[#2d1b0e] rounded-tl-lg" />
              <div className="absolute top-16 right-4 w-6 h-6 border-t-3 border-r-3 border-[#2d1b0e] rounded-tr-lg" />
              <div className="absolute bottom-16 left-4 w-6 h-6 border-b-3 border-l-3 border-[#2d1b0e] rounded-bl-lg" />
              <div className="absolute bottom-16 right-4 w-6 h-6 border-b-3 border-r-3 border-[#2d1b0e] rounded-br-lg" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
