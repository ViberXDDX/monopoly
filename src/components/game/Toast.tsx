import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";

export interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "info" | "warning" | "error";
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function Toast({ toasts, onDismiss }: ToastProps) {
  const getColors = (type: ToastMessage["type"]) => {
    switch (type) {
      case "success":
        return { bg: "#5b9aa8", border: "#2d1b0e" };
      case "warning":
        return { bg: "#f4d35e", border: "#2d1b0e" };
      case "error":
        return { bg: "#c44536", border: "#2d1b0e" };
      default:
        return { bg: "#fef9ed", border: "#2d1b0e" };
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const colors = getColors(toast.type);
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.8 }}
              className="pointer-events-auto"
            >
              <div 
                className="min-w-64 border-4 rounded-lg shadow-[4px_4px_0px_0px_#2d1b0e] p-4 flex items-center gap-3 relative"
                style={{ 
                  backgroundColor: colors.bg,
                  borderColor: colors.border
                }}
              >
                <p className="flex-1 text-[#fef9ed] uppercase tracking-wide text-[0.9rem]">
                  {toast.message}
                </p>
                
                <motion.button
                  onClick={() => onDismiss(toast.id)}
                  className="w-6 h-6 bg-[#2d1b0e] border-2 border-[#fef9ed] rounded-full flex items-center justify-center flex-shrink-0"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-4 h-4 text-[#fef9ed]" />
                </motion.button>

                {/* Grain texture */}
                <div 
                  className="absolute inset-0 opacity-20 pointer-events-none rounded-lg"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`
                  }}
                />
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}