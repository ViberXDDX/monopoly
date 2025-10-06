import { useState } from "react";
import { GameModal } from "../GameModal";
import { VintageButton } from "../VintageButton";

interface AddPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPlayer: (name: string, color: string) => void;
  existingColors: string[];
}

export function AddPlayerModal({ isOpen, onClose, onAddPlayer, existingColors }: AddPlayerModalProps) {
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  const availableColors = [
    { name: "Red", value: "#c44536" },
    { name: "Blue", value: "#5b9aa8" },
    { name: "Yellow", value: "#f4d35e" },
    { name: "Orange", value: "#e8956f" },
  ].filter(c => !existingColors.includes(c.value));

  const handleSubmit = () => {
    if (name.trim() && selectedColor) {
      onAddPlayer(name.trim(), selectedColor);
      setName("");
      setSelectedColor("");
      onClose();
    }
  };

  return (
    <GameModal isOpen={isOpen} onClose={onClose} title="Add Player">
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
          />
        </div>

        {/* Color selection */}
        <div>
          <label className="block text-[#6b5642] uppercase text-[0.8rem] mb-2">
            Choose Color
          </label>
          <div className="grid grid-cols-2 gap-3">
            {availableColors.map((color) => (
              <button
                key={color.value}
                onClick={() => setSelectedColor(color.value)}
                className={`
                  p-3 border-3 border-[#2d1b0e] rounded-lg
                  flex items-center gap-3
                  ${selectedColor === color.value ? "ring-4 ring-[#f4d35e]" : ""}
                `}
                style={{ backgroundColor: color.value }}
              >
                <div className="w-8 h-8 rounded-full bg-[#fef9ed] border-2 border-[#2d1b0e]" />
                <span className="text-[#fef9ed] drop-shadow-[1px_1px_0px_#2d1b0e]">
                  {color.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <VintageButton
            variant="primary"
            className="flex-1"
            onClick={handleSubmit}
            disabled={!name.trim() || !selectedColor}
          >
            Add Player
          </VintageButton>
          <VintageButton variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </VintageButton>
        </div>
      </div>
    </GameModal>
  );
}