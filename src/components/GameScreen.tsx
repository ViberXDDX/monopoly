import { useState } from "react";
import { motion } from "motion/react";
import { BoardTile } from "./game/BoardTile";
import { PlayerToken } from "./game/PlayerToken";
import { DiceButton } from "./game/DiceButton";
import { PlayerPanel } from "./game/PlayerPanel";
import { PropertyDetailsPanel } from "./game/PropertyDetailsPanel";
import { Toast, ToastMessage } from "./game/Toast";
import { GameModal } from "./GameModal";
import { AddPlayerModal } from "./game/AddPlayerModal";
import { EditPlayerModal } from "./game/EditPlayerModal";
import { BankruptcyModal } from "./game/BankruptcyModal";
import { VintageButton } from "./VintageButton";
import { Star, Gift, ArrowLeft } from "lucide-react";

interface Player {
  id: string;
  name: string;
  color: string;
  avatarIndex: number; // 0-3 for the 4 avatar faces
  cash: number;
  position: number;
  properties: string[];
  inJail: boolean;
  isBankrupt: boolean;
}

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
  type: "property" | "railroad" | "utility";
}

interface GameScreenProps {
  onBack: () => void;
}

export function GameScreen({ onBack }: GameScreenProps) {
  const [players, setPlayers] = useState<Player[]>([
    {
      id: "1",
      name: "Player 1",
      color: "#c44536",
      avatarIndex: 0,
      cash: 1500,
      position: 0,
      properties: [],
      inJail: false,
      isBankrupt: false,
    },
    {
      id: "2",
      name: "Player 2",
      color: "#5b9aa8",
      avatarIndex: 1,
      cash: 1500,
      position: 0,
      properties: [],
      inJail: false,
      isBankrupt: false,
    },
  ]);

  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [modalState, setModalState] = useState<{
    type:
      | "buy"
      | "rent"
      | "chance"
      | "chest"
      | "jail"
      | "addPlayer"
      | "editPlayer"
      | "bankruptcy"
      | null;
    data?: any;
  }>({ type: null });
  const [editingPlayer, setEditingPlayer] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [bankruptcyState, setBankruptcyState] = useState<{
    playerId: string;
    amountOwed: number;
  } | null>(null);

  // Board configuration
  const boardTiles = [
    // Bottom row (positions 0-10)
    { id: "0", name: "GO", type: "corner", color: "#5b9aa8", position: 0 },
    {
      id: "1",
      name: "Mediterranean Ave",
      type: "property",
      color: "#8b6f47",
      price: 60,
      rent: 2,
      group: "brown",
    },
    { id: "2", name: "Community Chest", type: "chest", color: "#f4d35e" },
    {
      id: "3",
      name: "Baltic Ave",
      type: "property",
      color: "#8b6f47",
      price: 60,
      rent: 4,
      group: "brown",
    },
    { id: "4", name: "Income Tax", type: "tax", color: "#e8dcc4" },
    {
      id: "5",
      name: "Reading RR",
      type: "railroad",
      color: "#2d1b0e",
      price: 200,
      rent: 25,
      group: "railroad",
    },
    {
      id: "6",
      name: "Oriental Ave",
      type: "property",
      color: "#5b9aa8",
      price: 100,
      rent: 6,
      group: "lightblue",
    },
    { id: "7", name: "Chance", type: "chance", color: "#c44536" },
    {
      id: "8",
      name: "Vermont Ave",
      type: "property",
      color: "#5b9aa8",
      price: 100,
      rent: 6,
      group: "lightblue",
    },
    {
      id: "9",
      name: "Connecticut Ave",
      type: "property",
      color: "#5b9aa8",
      price: 120,
      rent: 8,
      group: "lightblue",
    },
    { id: "10", name: "Jail", type: "corner", color: "#c44536" },

    // Left column (positions 11-19)
    {
      id: "11",
      name: "St. Charles",
      type: "property",
      color: "#e8956f",
      price: 140,
      rent: 10,
      group: "pink",
    },
    {
      id: "12",
      name: "Electric Co",
      type: "utility",
      color: "#f4d35e",
      price: 150,
      rent: 4,
      group: "utility",
    },
    {
      id: "13",
      name: "States Ave",
      type: "property",
      color: "#e8956f",
      price: 140,
      rent: 10,
      group: "pink",
    },
    {
      id: "14",
      name: "Virginia Ave",
      type: "property",
      color: "#e8956f",
      price: 160,
      rent: 12,
      group: "pink",
    },
    {
      id: "15",
      name: "Penn RR",
      type: "railroad",
      color: "#2d1b0e",
      price: 200,
      rent: 25,
      group: "railroad",
    },
    {
      id: "16",
      name: "St. James",
      type: "property",
      color: "#e8956f",
      price: 180,
      rent: 14,
      group: "orange",
    },
    { id: "17", name: "Comm Chest", type: "chest", color: "#f4d35e" },
    {
      id: "18",
      name: "Tennessee",
      type: "property",
      color: "#e8956f",
      price: 180,
      rent: 14,
      group: "orange",
    },
    {
      id: "19",
      name: "New York Ave",
      type: "property",
      color: "#e8956f",
      price: 200,
      rent: 16,
      group: "orange",
    },

    // Top row (positions 20-30)
    { id: "20", name: "Free Parking", type: "corner", color: "#f4d35e" },
    {
      id: "21",
      name: "Kentucky Ave",
      type: "property",
      color: "#c44536",
      price: 220,
      rent: 18,
      group: "red",
    },
    { id: "22", name: "Chance", type: "chance", color: "#c44536" },
    {
      id: "23",
      name: "Indiana Ave",
      type: "property",
      color: "#c44536",
      price: 220,
      rent: 18,
      group: "red",
    },
    {
      id: "24",
      name: "Illinois Ave",
      type: "property",
      color: "#c44536",
      price: 240,
      rent: 20,
      group: "red",
    },
    {
      id: "25",
      name: "B&O RR",
      type: "railroad",
      color: "#2d1b0e",
      price: 200,
      rent: 25,
      group: "railroad",
    },
    {
      id: "26",
      name: "Atlantic Ave",
      type: "property",
      color: "#f4d35e",
      price: 260,
      rent: 22,
      group: "yellow",
    },
    {
      id: "27",
      name: "Ventnor Ave",
      type: "property",
      color: "#f4d35e",
      price: 260,
      rent: 22,
      group: "yellow",
    },
    {
      id: "28",
      name: "Water Works",
      type: "utility",
      color: "#5b9aa8",
      price: 150,
      rent: 4,
      group: "utility",
    },
    {
      id: "29",
      name: "Marvin Gardens",
      type: "property",
      color: "#f4d35e",
      price: 280,
      rent: 24,
      group: "yellow",
    },
    { id: "30", name: "Go To Jail", type: "corner", color: "#c44536" },

    // Right column (positions 31-39)
    {
      id: "31",
      name: "Pacific Ave",
      type: "property",
      color: "#5b9aa8",
      price: 300,
      rent: 26,
      group: "green",
    },
    {
      id: "32",
      name: "N Carolina",
      type: "property",
      color: "#5b9aa8",
      price: 300,
      rent: 26,
      group: "green",
    },
    { id: "33", name: "Comm Chest", type: "chest", color: "#f4d35e" },
    {
      id: "34",
      name: "Penn Ave",
      type: "property",
      color: "#5b9aa8",
      price: 320,
      rent: 28,
      group: "green",
    },
    {
      id: "35",
      name: "Short Line",
      type: "railroad",
      color: "#2d1b0e",
      price: 200,
      rent: 25,
      group: "railroad",
    },
    { id: "36", name: "Chance", type: "chance", color: "#c44536" },
    {
      id: "37",
      name: "Park Place",
      type: "property",
      color: "#2d1b0e",
      price: 350,
      rent: 35,
      group: "darkblue",
    },
    { id: "38", name: "Luxury Tax", type: "tax", color: "#e8dcc4" },
    {
      id: "39",
      name: "Boardwalk",
      type: "property",
      color: "#2d1b0e",
      price: 400,
      rent: 50,
      group: "darkblue",
    },
  ];

  const [properties, setProperties] = useState<Property[]>(
    boardTiles
      .filter(
        (tile) =>
          tile.type === "property" ||
          tile.type === "railroad" ||
          tile.type === "utility"
      )
      .map((tile) => ({
        id: tile.id,
        name: tile.name,
        color: tile.color,
        price: tile.price || 0,
        rent: tile.rent || 0,
        houses: 0,
        hotel: false,
        group: (tile as any).group || "",
        type: tile.type as "property" | "railroad" | "utility",
      }))
  );

  const addToast = (message: string, type: ToastMessage["type"] = "info") => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const handleRollDice = (value: number) => {
    // Mark game as started on first dice roll
    if (!gameStarted) {
      setGameStarted(true);
    }

    const currentPlayer = players[currentPlayerIndex];

    // Skip bankrupt players
    if (currentPlayer.isBankrupt) {
      addToast(`${currentPlayer.name} is bankrupt!`, "error");
      setCurrentPlayerIndex((prev) => (prev + 1) % players.length);
      return;
    }

    const newPosition = (currentPlayer.position + value) % 40;

    // Check if passed GO
    if (newPosition < currentPlayer.position) {
      addToast(`${currentPlayer.name} passed GO! +$200`, "success");
      setPlayers((prev) =>
        prev.map((p) =>
          p.id === currentPlayer.id ? { ...p, cash: p.cash + 200 } : p
        )
      );
    }

    // Move player
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === currentPlayer.id ? { ...p, position: newPosition } : p
      )
    );

    addToast(`${currentPlayer.name} rolled ${value}!`, "info");

    // Handle landing
    setTimeout(() => {
      handleLanding(newPosition, currentPlayer);
    }, 500);
  };

  const handleLanding = (position: number, player: Player) => {
    const tile = boardTiles[position];

    if (
      tile.type === "property" ||
      tile.type === "railroad" ||
      tile.type === "utility"
    ) {
      const property = properties.find((p) => p.id === tile.id);
      if (property) {
        setSelectedProperty(property);

        // Only show buy prompt if property is unowned
        if (!property.owner) {
          setModalState({ type: "buy", data: property });
        } else if (property.owner !== player.color) {
          // Pay rent to owner
          handleRent(property, player);
        } else {
          // Player owns this property, no action needed
          addToast(`You own this property!`, "info");
        }
      }
    } else if (tile.type === "chance") {
      handleChance();
    } else if (tile.type === "chest") {
      handleCommunityChest();
    } else if (tile.name === "Go To Jail") {
      handleGoToJail(player);
    }

    // Next turn
    setTimeout(() => {
      setCurrentPlayerIndex((prev) => (prev + 1) % players.length);
    }, 2000);
  };

  const handleBuyProperty = () => {
    if (!modalState.data) return;

    const property = modalState.data as Property;
    const currentPlayer = players[currentPlayerIndex];

    if (currentPlayer.cash >= property.price) {
      setPlayers((prev) =>
        prev.map((p) =>
          p.id === currentPlayer.id
            ? {
                ...p,
                cash: p.cash - property.price,
                properties: [...p.properties, property.id],
              }
            : p
        )
      );

      setProperties((prev) =>
        prev.map((p) =>
          p.id === property.id ? { ...p, owner: currentPlayer.color } : p
        )
      );

      addToast(`${currentPlayer.name} bought ${property.name}!`, "success");
      setSelectedProperty({ ...property, owner: currentPlayer.color });
    } else {
      addToast("Not enough cash!", "error");
    }

    setModalState({ type: null });
  };

  const handleRent = (property: Property, player: Player) => {
    const rentAmount = property.rent;
    const newCash = player.cash - rentAmount;

    // Check if player can afford rent
    if (newCash < 0) {
      // Player cannot afford, need to sell properties or go bankrupt
      setBankruptcyState({ playerId: player.id, amountOwed: rentAmount });
      setModalState({ type: "bankruptcy" });
      return;
    }

    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id === player.id) {
          return { ...p, cash: newCash };
        }
        if (p.color === property.owner) {
          return { ...p, cash: p.cash + rentAmount };
        }
        return p;
      })
    );

    addToast(`Paid ${rentAmount} rent!`, "warning");
  };

  const handleChance = () => {
    const chances = [
      "Advance to GO! Collect $200",
      "Bank pays you $50!",
      "Go to Jail!",
      "Get out of Jail Free!",
    ];
    const message = chances[Math.floor(Math.random() * chances.length)];
    setModalState({ type: "chance", data: { message } });
  };

  const handleCommunityChest = () => {
    const chests = [
      "Doctor's fee: Pay $50",
      "From sale of stock you get $50",
      "Grand Opera Night: Collect $50",
      "Income tax refund: Collect $20",
    ];
    const message = chests[Math.floor(Math.random() * chests.length)];
    setModalState({ type: "chest", data: { message } });
  };

  const handleGoToJail = (player: Player) => {
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === player.id ? { ...p, position: 10, inJail: true } : p
      )
    );
    addToast(`${player.name} sent to Jail!`, "error");
  };

  const handleAddPlayer = (name: string, color: string) => {
    // Determine the next available avatar index
    const usedIndices = players.map((p) => p.avatarIndex);
    const availableIndex =
      [0, 1, 2, 3].find((i) => !usedIndices.includes(i)) || 0;

    const newPlayer: Player = {
      id: Date.now().toString(),
      name,
      color,
      avatarIndex: availableIndex,
      cash: 1500,
      position: 0,
      properties: [],
      inJail: false,
      isBankrupt: false,
    };
    setPlayers((prev) => [...prev, newPlayer]);
    addToast(`${name} joined the game!`, "success");
  };

  const handleEditPlayer = (playerId: string, newName: string) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === playerId ? { ...p, name: newName } : p))
    );
    addToast("Player name updated!", "success");
  };

  const handleSellProperty = (propertyId: string) => {
    if (!bankruptcyState) return;

    const player = players.find((p) => p.id === bankruptcyState.playerId);
    const property = properties.find((p) => p.id === propertyId);

    if (!player || !property) return;

    const salePrice = property.price / 2;

    // Update player cash and remove property
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === player.id
          ? {
              ...p,
              cash: p.cash + salePrice,
              properties: p.properties.filter((pid) => pid !== propertyId),
            }
          : p
      )
    );

    // Remove property owner
    setProperties((prev) =>
      prev.map((p) => (p.id === propertyId ? { ...p, owner: undefined } : p))
    );

    addToast(`Sold ${property.name} for ${salePrice}`, "success");

    // Check if player can now afford the payment
    const updatedPlayer = { ...player, cash: player.cash + salePrice };
    if (updatedPlayer.cash >= bankruptcyState.amountOwed) {
      // Can afford now, complete the payment
      handleCompleteBankruptcyPayment(updatedPlayer);
    }
  };

  const handleCompleteBankruptcyPayment = (player: Player) => {
    if (!bankruptcyState) return;

    const rentAmount = bankruptcyState.amountOwed;

    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id === player.id) {
          return { ...p, cash: p.cash - rentAmount };
        }
        // Find property owner and pay them
        const property = properties.find(
          (prop) =>
            boardTiles[player.position] &&
            prop.id === boardTiles[player.position].id
        );
        if (property && p.color === property.owner) {
          return { ...p, cash: p.cash + rentAmount };
        }
        return p;
      })
    );

    addToast(`Payment completed!`, "success");
    setModalState({ type: null });
    setBankruptcyState(null);
  };

  const handleDeclareBankruptcy = () => {
    if (!bankruptcyState) return;

    const player = players.find((p) => p.id === bankruptcyState.playerId);
    if (!player) return;

    // Mark player as bankrupt and transfer all properties
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === player.id ? { ...p, isBankrupt: true, cash: 0 } : p
      )
    );

    // Remove all properties from bankrupt player
    setProperties((prev) =>
      prev.map((p) =>
        player.properties.includes(p.id) ? { ...p, owner: undefined } : p
      )
    );

    addToast(`${player.name} is bankrupt!`, "error");
    setModalState({ type: null });
    setBankruptcyState(null);

    // Check if game is over (only one player left)
    const remainingPlayers = players.filter(
      (p) => !p.isBankrupt && p.id !== player.id
    );
    if (remainingPlayers.length === 1) {
      addToast(`${remainingPlayers[0].name} wins!`, "success");
    }
  };

  // Get tile position in grid layout
  const getTilePosition = (index: number): { row: number; col: number } => {
    // Bottom row: 0-10
    if (index <= 10) {
      return { row: 10, col: 10 - index };
    }
    // Left column: 11-19
    if (index <= 19) {
      return { row: 10 - (index - 10), col: 0 };
    }
    // Top row: 20-30
    if (index <= 30) {
      return { row: 0, col: index - 20 };
    }
    // Right column: 31-39
    return { row: index - 30, col: 10 };
  };

  const getTileOrientation = (index: number) => {
    if (index <= 10) return "bottom";
    if (index <= 19) return "left";
    if (index <= 30) return "top";
    return "right";
  };

  const isCorner = (index: number) => {
    return index === 0 || index === 10 || index === 20 || index === 30;
  };

  return (
    <div className="min-h-screen bg-[#f5f1e8] p-4 overflow-hidden">
      {/* Top bar */}
      <div className="max-w-[1440px] mx-auto mb-4">
        <div className="bg-[#fef9ed] border-4 border-[#2d1b0e] rounded-lg shadow-[6px_6px_0px_0px_#2d1b0e] p-4 flex items-center justify-between">
          {/* Logo */}
          <motion.button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-[#5b9aa8] border-3 border-[#2d1b0e] rounded-lg shadow-[3px_3px_0px_0px_#2d1b0e]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-5 h-5 text-[#fef9ed]" />
            <span className="text-[#fef9ed] uppercase tracking-wide">Menu</span>
          </motion.button>

          {/* Dice */}
          <DiceButton onRoll={handleRollDice} disabled={false} />

          {/* Bank & Turn */}
          <div className="flex items-center gap-4">
            <div className="bg-[#f4d35e] border-3 border-[#2d1b0e] rounded-lg px-4 py-2 shadow-[3px_3px_0px_0px_#2d1b0e]">
              <p className="text-[0.8rem] text-[#6b5642] uppercase">
                Current Turn
              </p>
              <p className="text-[#2d1b0e]">
                {players[currentPlayerIndex].name}
              </p>
            </div>

            {/* Turn order chips */}
            <div className="flex gap-2">
              {players.map((player, idx) => (
                <motion.div
                  key={player.id}
                  className={`${
                    idx === currentPlayerIndex
                      ? "ring-4 ring-[#f4d35e] rounded-full"
                      : ""
                  } ${player.isBankrupt ? "opacity-40" : ""}`}
                  whileHover={{ scale: 1.1 }}
                >
                  <PlayerToken
                    playerIndex={player.avatarIndex}
                    color={player.color}
                    size="lg"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main game area */}
      <div className="max-w-[1440px] mx-auto grid grid-cols-[256px_1fr_256px] gap-4">
        {/* Left panel - Players */}
        <PlayerPanel
          players={players}
          currentPlayerId={players[currentPlayerIndex].id}
          onAddPlayer={() => {
            if (gameStarted) {
              addToast("Cannot add players after game has started!", "error");
            } else {
              setModalState({ type: "addPlayer" });
            }
          }}
          onRemovePlayer={(id) => {
            if (gameStarted) {
              addToast(
                "Cannot remove players after game has started!",
                "error"
              );
            } else if (players.length > 1) {
              setPlayers((prev) => prev.filter((p) => p.id !== id));
              addToast("Player removed", "info");
            }
          }}
          onEditPlayer={(id) => {
            const player = players.find((p) => p.id === id);
            if (player) {
              setEditingPlayer({ id: player.id, name: player.name });
              setModalState({ type: "editPlayer" });
            }
          }}
        />

        {/* Center - Game board */}
        <div className="flex items-center justify-center">
          <div className="relative bg-[#e8dcc4] border-8 border-[#2d1b0e] rounded-lg shadow-[8px_8px_0px_0px_#2d1b0e] p-2">
            {/* Board grid */}
            <div className="grid grid-cols-11 gap-0">
              {Array.from({ length: 11 * 11 }).map((_, idx) => {
                const row = Math.floor(idx / 11);
                const col = idx % 11;

                // Find tile at this position
                const tileIndex = boardTiles.findIndex((_, i) => {
                  const pos = getTilePosition(i);
                  return pos.row === row && pos.col === col;
                });

                if (tileIndex !== -1) {
                  const tile = boardTiles[tileIndex];
                  const property = properties.find((p) => p.id === tile.id);

                  // Get players at this position
                  const playersHere = players.filter(
                    (p) => p.position === tileIndex
                  );

                  return (
                    <div key={idx} className="relative">
                      <BoardTile
                        type={tile.type as any}
                        name={tile.name}
                        color={tile.color}
                        price={tile.price}
                        owner={property?.owner}
                        position={tileIndex}
                        orientation={getTileOrientation(tileIndex)}
                        isCorner={isCorner(tileIndex)}
                        onClick={() => {
                          if (property) setSelectedProperty(property);
                        }}
                      />

                      {/* Player tokens */}
                      {playersHere.length > 0 && (
                        <div className="absolute inset-0 flex items-center justify-center gap-0.5 pointer-events-none z-10">
                          {playersHere.map((player, pIdx) => (
                            <div
                              key={player.id}
                              style={{
                                transform: `translate(${
                                  pIdx * 6 - (playersHere.length - 1) * 3
                                }px, 0)`,
                              }}
                            >
                              <PlayerToken
                                playerIndex={player.avatarIndex}
                                color={player.color}
                                size="sm"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                // Center area
                if (row > 0 && row < 10 && col > 0 && col < 10) {
                  if (row === 5 && col === 5) {
                    return (
                      <div
                        key={idx}
                        className="col-span-1 row-span-1 bg-[#fef9ed] border-4 border-[#2d1b0e] rounded-lg flex items-center justify-center"
                      >
                        <motion.div
                          className="text-center"
                          animate={{ rotate: [0, 3, -3, 0] }}
                          transition={{ duration: 3, repeat: Infinity }}
                        >
                          <p className="text-[0.6rem] text-[#2d1b0e] uppercase tracking-widest">
                            Monopoly
                          </p>
                          <p className="text-[0.5rem] text-[#6b5642]">
                            Vintage
                          </p>
                        </motion.div>
                      </div>
                    );
                  }
                  return <div key={idx} className="bg-[#e8dcc4]" />;
                }

                return <div key={idx} className="bg-[#e8dcc4]" />;
              })}
            </div>
          </div>
        </div>

        {/* Right panel - Property details */}
        <PropertyDetailsPanel
          property={selectedProperty}
          onBuyProperty={handleBuyProperty}
          canBuy={
            selectedProperty !== null &&
            !selectedProperty.owner &&
            players[currentPlayerIndex].cash >= selectedProperty.price
          }
        />
      </div>

      {/* Toasts */}
      <Toast
        toasts={toasts}
        onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />

      {/* Modals */}
      <AddPlayerModal
        isOpen={modalState.type === "addPlayer"}
        onClose={() => setModalState({ type: null })}
        onAddPlayer={handleAddPlayer}
        existingColors={players.map((p) => p.color)}
      />

      <EditPlayerModal
        isOpen={modalState.type === "editPlayer"}
        onClose={() => {
          setModalState({ type: null });
          setEditingPlayer(null);
        }}
        onEditPlayer={handleEditPlayer}
        playerId={editingPlayer?.id || null}
        currentName={editingPlayer?.name || ""}
      />

      <BankruptcyModal
        isOpen={modalState.type === "bankruptcy"}
        onClose={() => {
          setModalState({ type: null });
          setBankruptcyState(null);
        }}
        playerName={
          bankruptcyState
            ? players.find((p) => p.id === bankruptcyState.playerId)?.name || ""
            : ""
        }
        currentCash={
          bankruptcyState
            ? players.find((p) => p.id === bankruptcyState.playerId)?.cash || 0
            : 0
        }
        amountOwed={bankruptcyState?.amountOwed || 0}
        properties={
          bankruptcyState
            ? properties.filter((prop) =>
                players
                  .find((p) => p.id === bankruptcyState.playerId)
                  ?.properties.includes(prop.id)
              )
            : []
        }
        onSellProperty={handleSellProperty}
        onDeclarebankruptcy={handleDeclareBankruptcy}
      />

      <GameModal
        isOpen={modalState.type === "buy"}
        onClose={() => setModalState({ type: null })}
        title="Purchase Property"
      >
        {modalState.data && (
          <div className="space-y-4">
            <p className="text-center text-[#2d1b0e]">
              Would you like to buy <strong>{modalState.data.name}</strong>?
            </p>
            <div className="bg-[#f4d35e] border-3 border-[#2d1b0e] rounded-lg p-4 text-center">
              <p className="text-[#2d1b0e]">Price: ${modalState.data.price}</p>
            </div>
            <div className="flex gap-4 justify-center">
              <VintageButton variant="primary" onClick={handleBuyProperty}>
                Buy
              </VintageButton>
              <VintageButton
                variant="secondary"
                onClick={() => setModalState({ type: null })}
              >
                Pass
              </VintageButton>
            </div>
          </div>
        )}
      </GameModal>

      <GameModal
        isOpen={modalState.type === "chance"}
        onClose={() => setModalState({ type: null })}
        title="Chance!"
      >
        {modalState.data && (
          <div className="space-y-4">
            <div className="bg-[#c44536] border-3 border-[#2d1b0e] rounded-lg p-6 text-center">
              <Star className="w-12 h-12 mx-auto mb-3 text-[#fef9ed]" />
              <p className="text-[#fef9ed]">{modalState.data.message}</p>
            </div>
            <VintageButton
              variant="primary"
              className="w-full"
              onClick={() => setModalState({ type: null })}
            >
              Continue
            </VintageButton>
          </div>
        )}
      </GameModal>

      <GameModal
        isOpen={modalState.type === "chest"}
        onClose={() => setModalState({ type: null })}
        title="Community Chest"
      >
        {modalState.data && (
          <div className="space-y-4">
            <div className="bg-[#f4d35e] border-3 border-[#2d1b0e] rounded-lg p-6 text-center">
              <Gift className="w-12 h-12 mx-auto mb-3 text-[#2d1b0e]" />
              <p className="text-[#2d1b0e]">{modalState.data.message}</p>
            </div>
            <VintageButton
              variant="primary"
              className="w-full"
              onClick={() => setModalState({ type: null })}
            >
              Continue
            </VintageButton>
          </div>
        )}
      </GameModal>

      {/* Grain texture */}
      <div
        className="fixed inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 1000 1000' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
