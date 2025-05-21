import React, { useEffect, useState } from "react";
import {
  TigerGoatPiece,
  PieceType,
  getValidMoves,
  movePiece,
  placeGoat,
  checkWinCondition,
  LastMoveHighlight,
  nodeCoords,
} from "@/game-logic";

import tigerIcon from "@/assets/tiger.svg";
import goatIcon from "@/assets/goat.svg";

const initialTigers: TigerGoatPiece[] = [
  { id: 1, type: "tiger", position: 2, ...nodeCoords.find(n => n.position === 2)! },
  { id: 2, type: "tiger", position: 3, ...nodeCoords.find(n => n.position === 3)! },
  { id: 3, type: "tiger", position: 5, ...nodeCoords.find(n => n.position === 5)! },
];

const GameBoard = () => {
  const [pieces, setPieces] = useState<TigerGoatPiece[]>(initialTigers);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<PieceType>("goat");
  const [goatsPlaced, setGoatsPlaced] = useState(0);
  const [nextGoatId, setNextGoatId] = useState(4);
  const [validTargets, setValidTargets] = useState<number[]>([]);
  const [lastMove, setLastMove] = useState<LastMoveHighlight | null>(null);
  const [winner, setWinner] = useState<PieceType | null>(null);
  const [aiRole, setAiRole] = useState<PieceType | null>(null);

  const handleNodeClick = (id: number) => {
    if (winner || currentPlayer === aiRole) return;

    const piece = pieces.find(p => p.position === id);

    if (currentPlayer === "goat" && goatsPlaced < 15) {
      if (piece) return;
      const newPieces = placeGoat(id, pieces, nextGoatId);
      setPieces(newPieces);
      setGoatsPlaced(goatsPlaced + 1);
      setNextGoatId(nextGoatId + 1);
      setCurrentPlayer("tiger");
      setValidTargets([]);
      return;
    }

    if (!selectedId) {
      if (!piece || piece.type !== currentPlayer) return;
      const moves = getValidMoves(piece, pieces, 15 - goatsPlaced);
      setSelectedId(piece.id);
      setValidTargets(moves);
      return;
    }

    const selectedPiece = pieces.find(p => p.id === selectedId)!;
    if (!validTargets.includes(id)) {
      setSelectedId(null);
      setValidTargets([]);
      return;
    }

    const newPieces = movePiece(selectedPiece, id, pieces, setLastMove);
    setPieces(newPieces);
    setSelectedId(null);
    setValidTargets([]);

    const result = checkWinCondition(newPieces, goatsPlaced);
    if (result) {
      setWinner(result);
    } else {
      setCurrentPlayer(currentPlayer === "goat" ? "tiger" : "goat");
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto mt-6 relative">
      <svg viewBox="0 0 400 400" className="w-full h-auto border border-gray-300 rounded-md bg-white">
        {nodeCoords.map(node => (
          <circle
            key={node.position}
            cx={node.x}
            cy={node.y}
            r={validTargets.includes(node.position) ? 14 : 10}
            fill={validTargets.includes(node.position) ? "#38bdf8" : "lightgray"}
            stroke="black"
            strokeWidth={lastMove?.to === node.position ? 3 : 1}
            onClick={() => handleNodeClick(node.position)}
            className="cursor-pointer hover:fill-blue-300 transition"
          />
        ))}
        {pieces.map(piece => (
          <image
            key={piece.id}
            href={piece.type === "tiger" ? tigerIcon : goatIcon}
            x={piece.x - 12}
            y={piece.y - 12}
            height="24"
            width="24"
          />
        ))}
      </svg>

      <div className="text-center mt-4 font-medium">
        {winner
          ? `${winner === "goat" ? "Goats" : "Tigers"} win!`
          : goatsPlaced < 15
          ? `Place goat (${goatsPlaced + 1}/15)`
          : `Turn: ${currentPlayer}`}
      </div>

      <div className="flex justify-center gap-4 mt-4">
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
        >
          Restart
        </button>

        <select
          value={aiRole ?? ""}
          onChange={(e) =>
            setAiRole(e.target.value === "goat" || e.target.value === "tiger" ? e.target.value : null)
          }
          className="border rounded px-2 py-1"
        >
          <option value="">AI: Off</option>
          <option value="goat">AI as Goats</option>
          <option value="tiger">AI as Tigers</option>
        </select>
      </div>
    </div>
  );
};

export default GameBoard;
