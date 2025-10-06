import { motion } from "motion/react";
import { Plus, Minus, Edit2 } from "lucide-react";
import { VintageButton } from "../VintageButton";
import { PlayerToken } from "./PlayerToken";

interface Player {
  id: string;
  name: string;
  color: string;
  avatarIndex: number;
  cash: number;
  position: number;
  properties: string[];
  isBankrupt: boolean;
}

interface PlayerPanelProps {
  players: Player[];
  currentPlayerId: string;
  onAddPlayer: () => void;
  onRemovePlayer: (id: string) => void;
  onEditPlayer: (id: string) => void;
}

export function PlayerPanel({ 
  players, 
  currentPlayerId, 
  onAddPlayer, 
  onRemovePlayer,
  onEditPlayer 
}: PlayerPanelProps) {
  return (
    <div className="w-full bg-[#fef9ed] border-4 border-[#2d1b0e] rounded-lg shadow-[6px_6px_0px_0px_#2d1b0e] p-4 h-full overflow-y-auto">
      {/* Header */}
      <div className="mb-4 pb-3 border-b-3 border-[#2d1b0e]">
        <h3 className="text-[#2d1b0e] uppercase tracking-wide text-center">Players</h3>
      </div>

      {/* Players list */}
      <div className="space-y-3 mb-4">
        {players.map((player) => (
          <motion.div
            key={player.id}
            className={`
              bg-[#f5f1e8] border-3 border-[#2d1b0e] rounded-lg p-3
              ${currentPlayerId === player.id ? "shadow-[3px_3px_0px_0px_#f4d35e]" : "shadow-[2px_2px_0px_0px_#2d1b0e]"}
            `}
            whileHover={{ scale: 1.02 }}
          >
            {/* Player info */}
            <div className="flex items-center gap-2 mb-2">
              {/* Avatar */}
              <PlayerToken 
                playerIndex={player.avatarIndex}
                color={player.color}
                size="md"
              />
              
              <div className="flex-1 min-w-0">
                <p className={`text-[#2d1b0e] truncate ${player.isBankrupt ? "line-through opacity-50" : ""}`}>
                  {player.name}
                </p>
                <p className={`text-[0.8rem] text-[#6b5642] ${player.isBankrupt ? "opacity-50" : ""}`}>
                  {player.isBankrupt ? "BANKRUPT" : `${player.cash}`}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-1">
                <motion.button
                  onClick={() => onEditPlayer(player.id)}
                  className="w-6 h-6 bg-[#5b9aa8] border-2 border-[#2d1b0e] rounded flex items-center justify-center"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Edit2 className="w-3 h-3 text-[#fef9ed]" />
                </motion.button>
                <motion.button
                  onClick={() => onRemovePlayer(player.id)}
                  className="w-6 h-6 bg-[#c44536] border-2 border-[#2d1b0e] rounded flex items-center justify-center"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Minus className="w-3 h-3 text-[#fef9ed]" />
                </motion.button>
              </div>
            </div>

            {/* Properties count */}
            <div className="text-[0.7rem] text-[#6b5642] flex items-center gap-1">
              <span>Properties: {player.properties.length}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add player button */}
      {players.length < 4 && (
        <motion.button
          onClick={onAddPlayer}
          className="w-full bg-[#f4d35e] border-3 border-[#2d1b0e] rounded-lg p-3 shadow-[3px_3px_0px_0px_#2d1b0e] flex items-center justify-center gap-2"
          whileHover={{ scale: 1.02, boxShadow: "4px 4px 0px 0px #2d1b0e" }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="w-5 h-5 text-[#2d1b0e]" />
          <span className="text-[#2d1b0e] uppercase tracking-wide">Add Player</span>
        </motion.button>
      )}

      {/* Grain texture */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none rounded-lg"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`
        }}
      />
    </div>
  );
}