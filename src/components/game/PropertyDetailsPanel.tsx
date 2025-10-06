import { motion } from "motion/react";
import { VintageButton } from "../VintageButton";
import { Home, Hotel } from "lucide-react";

interface Property {
  id: string;
  name: string;
  color: string;
  price: number;
  rent: number;
  owner?: string;
  houses: number;
  hotel: boolean;
  group: string;
}

interface PropertyDetailsPanelProps {
  property: Property | null;
  onBuyProperty?: () => void;
  canBuy: boolean;
}

export function PropertyDetailsPanel({ property, onBuyProperty, canBuy }: PropertyDetailsPanelProps) {
  if (!property) {
    return (
      <div className="w-full bg-[#fef9ed] border-4 border-[#2d1b0e] rounded-lg shadow-[6px_6px_0px_0px_#2d1b0e] p-6 flex items-center justify-center h-96">
        <p className="text-[#6b5642] text-center uppercase text-[0.9rem]">
          Select a property<br/>to view details
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#fef9ed] border-4 border-[#2d1b0e] rounded-lg shadow-[6px_6px_0px_0px_#2d1b0e] overflow-hidden">
      {/* Color banner */}
      <div 
        className="h-16 border-b-4 border-[#2d1b0e] relative flex items-center justify-center"
        style={{ backgroundColor: property.color }}
      >
        <h3 className="text-[#fef9ed] uppercase tracking-wide text-center px-2 relative z-10 drop-shadow-[2px_2px_0px_#2d1b0e]">
          {property.name}
        </h3>
        
        {/* Decorative scalloped edge */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-[#fef9ed]"
          style={{
            clipPath: "polygon(0 0, 10% 100%, 20% 0, 30% 100%, 40% 0, 50% 100%, 60% 0, 70% 100%, 80% 0, 90% 100%, 100% 0, 100% 100%, 0 100%)"
          }}
        />
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Price info */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[#6b5642] uppercase text-[0.8rem]">Price</span>
            <span className="px-3 py-1 bg-[#f4d35e] border-2 border-[#2d1b0e] rounded text-[#2d1b0e]">
              ${property.price}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#6b5642] uppercase text-[0.8rem]">Rent</span>
            <span className="px-3 py-1 bg-[#f4d35e] border-2 border-[#2d1b0e] rounded text-[#2d1b0e]">
              ${property.rent}
            </span>
          </div>
        </div>

        {/* Decorative divider */}
        <div className="flex items-center justify-center">
          <div className="h-0.5 flex-1 bg-[#2d1b0e]" />
          <div className="w-2 h-2 bg-[#2d1b0e] rotate-45 mx-2" />
          <div className="h-0.5 flex-1 bg-[#2d1b0e]" />
        </div>

        {/* Owner info */}
        {property.owner ? (
          <div className="bg-[#f5f1e8] border-2 border-[#2d1b0e] rounded-lg p-3">
            <p className="text-[0.8rem] text-[#6b5642] uppercase text-center mb-2">Owner</p>
            <div 
              className="w-8 h-8 rounded-full border-3 border-[#2d1b0e] mx-auto"
              style={{ backgroundColor: property.owner }}
            />
          </div>
        ) : (
          <div className="bg-[#f5f1e8] border-2 border-[#2d1b0e] rounded-lg p-3">
            <p className="text-[0.8rem] text-[#2d1b0e] uppercase text-center">
              Unowned
            </p>
          </div>
        )}

        {/* Buildings */}
        {property.owner && (
          <div className="bg-[#f5f1e8] border-2 border-[#2d1b0e] rounded-lg p-3">
            <p className="text-[0.8rem] text-[#6b5642] uppercase text-center mb-2">Buildings</p>
            <div className="flex items-center justify-center gap-2">
              {property.hotel ? (
                <div className="flex items-center gap-1 px-2 py-1 bg-[#c44536] border-2 border-[#2d1b0e] rounded">
                  <Hotel className="w-4 h-4 text-[#fef9ed]" />
                  <span className="text-[0.8rem] text-[#fef9ed]">Hotel</span>
                </div>
              ) : (
                <>
                  {Array.from({ length: property.houses }).map((_, i) => (
                    <div key={i} className="flex items-center gap-1 px-2 py-1 bg-[#5b9aa8] border-2 border-[#2d1b0e] rounded">
                      <Home className="w-3 h-3 text-[#fef9ed]" />
                    </div>
                  ))}
                  {property.houses === 0 && (
                    <span className="text-[0.8rem] text-[#6b5642]">None</span>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Buy button */}
        {!property.owner && canBuy && (
          <VintageButton 
            variant="primary" 
            className="w-full"
            onClick={onBuyProperty}
          >
            Buy Property
          </VintageButton>
        )}
      </div>

      {/* Grain texture */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`
        }}
      />
    </div>
  );
}