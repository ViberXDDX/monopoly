import { GameModal } from "../GameModal";
import { VintageButton } from "../VintageButton";

interface Property {
  id: string;
  name: string;
  price: number;
}

interface BankruptcyModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerName: string;
  currentCash: number;
  amountOwed: number;
  properties: Property[];
  onSellProperty: (propertyId: string) => void;
  onDeclarebankruptcy: () => void;
}

export function BankruptcyModal({
  isOpen,
  onClose,
  playerName,
  currentCash,
  amountOwed,
  properties,
  onSellProperty,
  onDeclarebankruptcy
}: BankruptcyModalProps) {
  const deficit = amountOwed - currentCash;

  return (
    <GameModal isOpen={isOpen} onClose={onClose} title="Insufficient Funds!">
      <div className="space-y-4">
        <div className="bg-[#c44536] border-3 border-[#2d1b0e] rounded-lg p-4 text-center">
          <p className="text-[#fef9ed] mb-2">
            <strong>{playerName}</strong> cannot afford this payment!
          </p>
          <div className="grid grid-cols-2 gap-2 text-[#fef9ed] text-[0.9rem]">
            <div>
              <p className="text-[#e8dcc4]">Current Cash:</p>
              <p>${currentCash}</p>
            </div>
            <div>
              <p className="text-[#e8dcc4]">Amount Owed:</p>
              <p>${amountOwed}</p>
            </div>
          </div>
          <p className="text-[#f4d35e] mt-2">
            Need: ${deficit}
          </p>
        </div>

        {properties.length > 0 ? (
          <>
            <p className="text-[#2d1b0e] text-center">
              Sell properties at half price to raise funds:
            </p>
            
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {properties.map((property) => (
                <div
                  key={property.id}
                  className="bg-[#f5f1e8] border-2 border-[#2d1b0e] rounded-lg p-3 flex items-center justify-between"
                >
                  <div>
                    <p className="text-[#2d1b0e]">{property.name}</p>
                    <p className="text-[0.8rem] text-[#6b5642]">
                      Sell for: ${property.price / 2}
                    </p>
                  </div>
                  <VintageButton
                    variant="secondary"
                    onClick={() => onSellProperty(property.id)}
                  >
                    Sell
                  </VintageButton>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <p className="text-[#2d1b0e] text-center">
              No properties left to sell!
            </p>
            <div className="bg-[#f4d35e] border-3 border-[#2d1b0e] rounded-lg p-4 text-center">
              <p className="text-[#2d1b0e]">
                {playerName} must declare <strong>BANKRUPTCY</strong>
              </p>
            </div>
            <VintageButton
              variant="primary"
              className="w-full"
              onClick={onDeclarebankruptcy}
            >
              Declare Bankruptcy
            </VintageButton>
          </>
        )}
      </div>
    </GameModal>
  );
}