import { motion } from "motion/react";

interface PropertyCardProps {
  name: string;
  color: string;
  price: string;
  rent: string;
}

export function PropertyCard({ name, color, price, rent }: PropertyCardProps) {
  return (
    <motion.div
      className="w-48 bg-[#fef9ed] border-4 border-[#2d1b0e] rounded-lg shadow-[4px_4px_0px_0px_#2d1b0e] overflow-hidden relative"
      whileHover={{ 
        scale: 1.05, 
        rotate: [0, -2, 2, 0],
        boxShadow: "6px 6px 0px 0px #2d1b0e"
      }}
    >
      {/* Color banner */}
      <div 
        className="h-16 border-b-4 border-[#2d1b0e] relative"
        style={{ backgroundColor: color }}
      >
        {/* Decorative scalloped edge */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-[#fef9ed]"
          style={{
            clipPath: "polygon(0 0, 10% 100%, 20% 0, 30% 100%, 40% 0, 50% 100%, 60% 0, 70% 100%, 80% 0, 90% 100%, 100% 0, 100% 100%, 0 100%)"
          }}
        />
        
        {/* Grain texture */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`
          }}
        />
      </div>

      {/* Property name */}
      <div className="p-4">
        <h3 className="text-center mb-4 uppercase tracking-wide text-[#2d1b0e]">{name}</h3>
        
        {/* Decorative divider */}
        <div className="flex items-center justify-center mb-4">
          <div className="h-0.5 flex-1 bg-[#2d1b0e]" />
          <div className="w-2 h-2 bg-[#2d1b0e] rotate-45 mx-2" />
          <div className="h-0.5 flex-1 bg-[#2d1b0e]" />
        </div>

        {/* Price info */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[#6b5642]">PRICE</span>
            <span className="px-2 py-1 bg-[#f4d35e] border-2 border-[#2d1b0e] rounded">{price}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#6b5642]">RENT</span>
            <span className="px-2 py-1 bg-[#f4d35e] border-2 border-[#2d1b0e] rounded">{rent}</span>
          </div>
        </div>

        {/* Decorative corner elements */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#2d1b0e]" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#2d1b0e]" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#2d1b0e]" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#2d1b0e]" />
      </div>

      {/* Overall grain texture */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`
        }}
      />
    </motion.div>
  );
}
