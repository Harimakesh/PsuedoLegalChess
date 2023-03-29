class PrecomputedMoves {
  NumSquaresToedge = [];
  DirectionOffsets = [8, -8, -1, 1, 7, -7, 9, -9];
  allKnightjumps = [15, 17, -17, -15, 10, -6, 6, -10];
  constructor() {
    for (let file = 0; file < 8; file++) {
      for (let rank = 0; rank < 8; rank++) {
        let numNorth = 7 - rank;
        let numSouth = rank;
        let numWest = file;
        let numEast = 7 - file;

        let squareIndex = rank * 8 + file;

        this.NumSquaresToedge[squareIndex] = [
          numNorth,
          numSouth,
          numWest,
          numEast,
          Math.min(numNorth, numWest),
          Math.min(numSouth, numEast),
          Math.min(numNorth, numEast),
          Math.min(numSouth, numWest),
        ];
      }
    }
  }
}

export const PrecomputedMoveData = new PrecomputedMoves();
