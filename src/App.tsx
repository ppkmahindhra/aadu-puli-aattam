import React from "react";
import GameBoard from "./components/GameBoard";

export default function App() {
  return (
    <div className="min-h-screen bg-[#fefae0] text-[#4e342e] flex flex-col items-center">
      <h1 className="text-3xl font-bold mt-6 mb-2">🐅 Aadu Puli Aattam 🐐</h1>
      <p className="text-sm mb-4 text-center px-4 max-w-md">
        A traditional Tamil strategy game. Play as Tigers or Goats and see who wins!
      </p>
      <GameBoard />
      <footer className="mt-6 text-xs text-gray-600">
        Made with ❤️ by PPK Mahindhra
      </footer>
    </div>
  );
}
