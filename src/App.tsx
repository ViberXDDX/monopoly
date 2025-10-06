import { useState } from "react";
import { MainMenu } from "./components/MainMenu";
import { GameScreen } from "./components/GameScreen";
import { GameBoard } from "./components/GameBoard";
import { PropertyCard } from "./components/PropertyCard";
import { CharacterAvatar } from "./components/CharacterAvatar";
import { GameModal } from "./components/GameModal";
import { VintageButton } from "./components/VintageButton";
import { motion } from "motion/react";

export default function App() {
  const [currentView, setCurrentView] = useState<"menu" | "game" | "showcase">(
    "menu"
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (currentView === "menu") {
    return (
      <div className="relative">
        <MainMenu onStartGame={() => setCurrentView("game")} />

        {/* Toggle button to see showcase */}
        <motion.button
          onClick={() => setCurrentView("showcase")}
          className="fixed bottom-8 right-8 bg-[#5b9aa8] text-[#fef9ed] px-6 py-3 border-4 border-[#2d1b0e] rounded-lg shadow-[4px_4px_0px_0px_#2d1b0e]"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          View UI Showcase
        </motion.button>
      </div>
    );
  }

  if (currentView === "game") {
    return <GameScreen onBack={() => setCurrentView("menu")} />;
  }

  return (
    <div className="min-h-screen bg-[#f5f1e8] p-8 overflow-auto">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-8">
          <motion.h1
            className="text-[#2d1b0e] uppercase tracking-wider"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Cuphead-Style UI Showcase
          </motion.h1>

          <VintageButton
            onClick={() => setCurrentView("menu")}
            variant="primary"
          >
            Back to Menu
          </VintageButton>
        </div>

        {/* Decorative divider */}
        <div className="flex items-center gap-4 mb-12">
          <div className="flex-1 h-1 bg-[#2d1b0e]" />
          <div className="w-4 h-4 bg-[#2d1b0e] rotate-45" />
          <div className="w-4 h-4 bg-[#2d1b0e] rotate-45" />
          <div className="w-4 h-4 bg-[#2d1b0e] rotate-45" />
          <div className="flex-1 h-1 bg-[#2d1b0e]" />
        </div>

        {/* Buttons Section */}
        <section className="mb-12">
          <motion.div
            className="inline-block bg-[#fef9ed] border-4 border-[#2d1b0e] rounded-lg px-6 py-2 shadow-[4px_4px_0px_0px_#2d1b0e] mb-6"
            whileHover={{ x: 5 }}
          >
            <h2 className="text-[#2d1b0e] uppercase tracking-wide">
              Vintage Buttons
            </h2>
          </motion.div>

          <div className="flex flex-wrap gap-4">
            <VintageButton variant="primary">Primary Action</VintageButton>
            <VintageButton variant="secondary">Secondary Action</VintageButton>
            <VintageButton variant="accent">Accent Action</VintageButton>
            <VintageButton
              variant="primary"
              onClick={() => setIsModalOpen(true)}
            >
              Open Modal
            </VintageButton>
          </div>
        </section>

        {/* Characters Section */}
        <section className="mb-12">
          <motion.div
            className="inline-block bg-[#fef9ed] border-4 border-[#2d1b0e] rounded-lg px-6 py-2 shadow-[4px_4px_0px_0px_#2d1b0e] mb-6"
            whileHover={{ x: 5 }}
          >
            <h2 className="text-[#2d1b0e] uppercase tracking-wide">
              Character Avatars
            </h2>
          </motion.div>

          <div className="flex flex-wrap gap-8">
            <CharacterAvatar
              name="Player 1"
              color="#c44536"
              expression="happy"
            />
            <CharacterAvatar
              name="Player 2"
              color="#5b9aa8"
              expression="surprised"
            />
            <CharacterAvatar
              name="Player 3"
              color="#f4d35e"
              expression="wink"
            />
            <CharacterAvatar
              name="Player 4"
              color="#e8956f"
              expression="determined"
            />
          </div>
        </section>

        {/* Property Cards Section */}
        <section className="mb-12">
          <motion.div
            className="inline-block bg-[#fef9ed] border-4 border-[#2d1b0e] rounded-lg px-6 py-2 shadow-[4px_4px_0px_0px_#2d1b0e] mb-6"
            whileHover={{ x: 5 }}
          >
            <h2 className="text-[#2d1b0e] uppercase tracking-wide">
              Property Cards
            </h2>
          </motion.div>

          <div className="flex flex-wrap gap-6">
            <PropertyCard
              name="Park Avenue"
              color="#5b9aa8"
              price="$350"
              rent="$35"
            />
            <PropertyCard
              name="Broadway"
              color="#c44536"
              price="$400"
              rent="$50"
            />
            <PropertyCard
              name="Main Street"
              color="#f4d35e"
              price="$200"
              rent="$20"
            />
            <PropertyCard
              name="Plaza Hotel"
              color="#e8956f"
              price="$500"
              rent="$75"
            />
          </div>
        </section>

        {/* Game Board Section */}
        <section className="mb-12">
          <motion.div
            className="inline-block bg-[#fef9ed] border-4 border-[#2d1b0e] rounded-lg px-6 py-2 shadow-[4px_4px_0px_0px_#2d1b0e] mb-6"
            whileHover={{ x: 5 }}
          >
            <h2 className="text-[#2d1b0e] uppercase tracking-wide">
              Game Board
            </h2>
          </motion.div>

          <div className="flex justify-center">
            <GameBoard />
          </div>
        </section>
      </div>

      {/* Modal */}
      <GameModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Game Event!"
      >
        <div className="space-y-4">
          <p className="text-center text-[#2d1b0e]">
            Congratulations! You've landed on Park Avenue!
          </p>

          <div className="bg-[#f4d35e] border-3 border-[#2d1b0e] rounded-lg p-4">
            <p className="text-center text-[#2d1b0e]">
              Would you like to purchase this property for <strong>$350</strong>
              ?
            </p>
          </div>

          <div className="flex gap-4 justify-center pt-4">
            <VintageButton
              variant="primary"
              onClick={() => setIsModalOpen(false)}
            >
              Buy Property
            </VintageButton>
            <VintageButton
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Pass
            </VintageButton>
          </div>
        </div>
      </GameModal>

      {/* Overall grain texture */}
      <div
        className="fixed inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 1000 1000' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
