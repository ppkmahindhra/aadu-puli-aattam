export type PieceType = "tiger" | "goat";

export interface TigerGoatPiece {
  id: number;
  type: PieceType;
  position: number;
  x: number;
  y: number;
}

export interface LastMoveHighlight {
  from: number;
  to: number;
  type: "move" | "capture";
  player: PieceType;
  timestamp: number;
}

export const nodeCoords = [
  { position: 1, x: 200, y: 30 },
  { position: 2, x: 130, y: 90 },
  { position: 3, x: 270, y: 90 },
  { position: 4, x: 80, y: 160 },
  { position: 5, x: 200, y: 160 },
  { position: 6, x: 320, y: 160 },
  { position: 7, x: 40, y: 230 },
  { position: 8, x: 130, y: 230 },
  { position: 9, x: 200, y: 230 },
  { position: 10, x: 270, y: 230 },
  { position: 11, x: 360, y: 230 },
  { position: 12, x: 90, y: 300 },
  { position: 13, x: 200, y: 300 },
  { position: 14, x: 310, y: 300 },
  { position: 15, x: 200, y: 370 },
  { position: 16, x: 200, y: 100 },
  { position: 17, x: 120, y: 130 },
  { position: 18, x: 280, y: 130 },
  { position: 19, x: 200, y: 200 },
  { position: 20, x: 80, y: 270 },
  { position: 21, x: 320, y: 270 },
  { position: 22, x: 130, y: 340 },
  { position: 23, x: 270, y: 340 }
];

export const boardGraph: Record<number, number[]> = {
  1: [2, 3],
  2: [1, 4, 5, 3],
  3: [1, 2, 5, 6],
  4: [2, 5, 7, 8],
  5: [2, 3, 4, 6, 8, 9],
  6: [3, 5, 9, 10],
  7: [4, 8],
  8: [4, 5, 7, 9],
  9: [5, 6, 8, 10],
  10: [6, 9],
  11: [10],
  12: [8, 13],
  13: [9, 12, 14, 15],
  14: [10, 13],
  15: [13],
  16: [2, 3, 5],
  17: [4, 5, 8],
  18: [5, 6, 9],
  19: [5, 8, 9, 13],
  20: [8, 12, 22],
  21: [9, 14, 23],
  22: [12, 20],
  23: [14, 21]
};

function getGoatPlacementTargets(allPieces: TigerGoatPiece[]): number[] {
  const occupied = new Set(allPieces.map(p => p.position));
  return Object.keys(boardGraph).map(Number).filter(pos => !occupied.has(pos));
}

function getGoatMovementTargets(position: number, allPieces: TigerGoatPiece[]): number[] {
  const occupied = new Set(allPieces.map(p => p.position));
  return boardGraph[position].filter(n => !occupied.has(n));
}

function getTigerMoves(piece: TigerGoatPiece, allPieces: TigerGoatPiece[]): number[] {
  const occupied = new Set(allPieces.map(p => p.position));
  const neighbors = boardGraph[piece.position];
  const normalMoves = neighbors.filter(n => !occupied.has(n));
  const captureMoves: number[] = [];

  for (const neighbor of neighbors) {
    const overPiece = allPieces.find(p => p.position === neighbor && p.type === "goat");
    if (overPiece) {
      const landingSpots = boardGraph[neighbor].filter(
        n2 =>
          n2 !== piece.position &&
          !occupied.has(n2) &&
          boardGraph[piece.position].includes(neighbor) &&
          boardGraph[neighbor].includes(n2)
      );
      captureMoves.push(...landingSpots);
    }
  }

  return [...normalMoves, ...captureMoves];
}

export function getValidMoves(piece: TigerGoatPiece, allPieces: TigerGoatPiece[], goatsToPlace = 0): number[] {
  if (piece.type === "goat") {
    return goatsToPlace > 0
      ? getGoatPlacementTargets(allPieces)
      : getGoatMovementTargets(piece.position, allPieces);
  }
  return getTigerMoves(piece, allPieces);
}

export function placeGoat(position: number, allPieces: TigerGoatPiece[], nextGoatId: number): TigerGoatPiece[] {
  const target = nodeCoords.find(n => n.position === position);
  if (!target) return allPieces;
  return [
    ...allPieces,
    { id: nextGoatId, type: "goat", position, x: target.x, y: target.y }
  ];
}

export function movePiece(
  piece: TigerGoatPiece,
  newPos: number,
  allPieces: TigerGoatPiece[],
  highlight?: (info: LastMoveHighlight) => void
): TigerGoatPiece[] {
  const target = nodeCoords.find(n => n.position === newPos)!;
  const movedPiece = { ...piece, position: newPos, x: target.x, y: target.y };
  const updated = allPieces.map(p => (p.id === piece.id ? movedPiece : p));

  const jumpedOver = allPieces.find(p =>
    p.type === "goat" &&
    boardGraph[piece.position].includes(p.position) &&
    boardGraph[p.position].includes(newPos) &&
    Math.abs(p.position - newPos) > 1
  );

  if (highlight) {
    highlight({
      from: piece.position,
      to: newPos,
      type: jumpedOver ? "capture" : "move",
      player: piece.type,
      timestamp: Date.now()
    });
  }

  return jumpedOver ? updated.filter(p => p.id !== jumpedOver.id) : updated;
}

export function checkWinCondition(pieces: TigerGoatPiece[], goatsPlaced: number): "tiger" | "goat" | null {
  const goatsRemaining = pieces.filter(p => p.type === "goat").length;
  const tigers = pieces.filter(p => p.type === "tiger");
  const tigersBlocked = tigers.every(tiger =>
    getValidMoves(tiger, pieces, goatsPlaced < 15).length === 0
  );

  if (goatsRemaining < 4) return "tiger";
  if (tigersBlocked) return "goat";
  return null;
}
