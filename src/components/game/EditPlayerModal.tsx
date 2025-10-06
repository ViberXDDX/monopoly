import { useState, useEffect } from "react";
import { GameModal } from "../GameModal";
import { VintageButton } from "../VintageButton";

interface EditPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEditPlayer: (playerId: string, newName: string) => void;
  playerId: string | null;
  currentName: string;
}

export function EditPlayerModal({ isOpen, onClose, onEditPlayer, playerId, currentName }: EditPlayerModalProps) {
  const [name, setName] = useState(currentName);

  useEffect(() => {
    setName(currentName);
  }, [currentName, isOpen]);

  const handleSubmit = () => {
    if (name.trim() && playerId) {
      onEditPlayer(playerId, name.trim());
      onClose();
    }
  };

  return (
    <GameModal isOpen={isOpen} onClose={onClose} title="Edit Player Name">
      <div className="space-y-4">
        {/* Name input */}
        <div>
          <label className="block text-[#6b5642] uppercase text-[0.8rem] mb-2">
            Player Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter name..."
            className="w-full px-4 py-2 bg-[#f5f1e8] border-3 border-[#2d1b0e] rounded-lg text-[#2d1b0e] focus:outline-none focus:ring-2 focus:ring-[#f4d35e]"
            maxLength={20}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSubmit();
              }
            }}
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <VintageButton
            variant="primary"
            className="flex-1"
            onClick={handleSubmit}
            disabled={!name.trim()}
          >
            Save
          </VintageButton>
          <VintageButton variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </VintageButton>
        </div>
      </div>
    </GameModal>
  );
}