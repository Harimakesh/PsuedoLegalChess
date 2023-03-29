import pawn from "./svgpiece/pawn2.svg";
import Pawn from "./svgpiece/pawn.svg";
import knight from "./svgpiece/knight.svg";
import Knight from "./svgpiece/knight2.svg";
import bishop from "./svgpiece/bishop.svg";
import Bishop from "./svgpiece/bishop2.svg";
import rook from "./svgpiece/rook.svg";
import Rook from "./svgpiece/rook2.svg";
import queen from "./svgpiece/queen.svg";
import Queen from "./svgpiece/queen2.svg";
import king from "./svgpiece/king.svg";
import King from "./svgpiece/king2.svg";

class Pieces {
  None = 0;
  King = 1;
  Pawn = 2;
  Knight = 3;
  Bishop = 4;
  Rook = 5;
  Queen = 6;

  white = 8;
  black = 16;

  typeMask = 0b00111;
  blackMask = 0b10000;
  whiteMask = 0b01000;
  colorMask = this.whiteMask | this.blackMask;

  imports = {
    p: [pawn, this.black | this.Pawn],
    P: [Pawn, this.white | this.Pawn],
    r: [rook, this.black | this.Rook],
    R: [Rook, this.white | this.Rook],
    n: [knight, this.black | this.Knight],
    N: [Knight, this.white | this.Knight],
    b: [bishop, this.black | this.Bishop],
    B: [Bishop, this.white | this.Bishop],
    k: [king, this.black | this.King],
    K: [King, this.white | this.King],
    q: [queen, this.black | this.Queen],
    Q: [Queen, this.white | this.Queen],
  };

  isWhite(PieceValue) {
    return this.whiteMask & PieceValue;
  }
  isSliding(PieceValue) {
    return (PieceValue & 0b100) !== 0;
  }
  sameColor(one, two) {
    return (one & this.colorMask) === (two & this.colorMask);
  }
  PieceType(one) {
    return one & this.typeMask;
  }
  isType(one, two) {
    if (this.PieceType(one) === two) {
      return true;
    } else {
      return false;
    }
  }
  isKnight(piece) {
    return (piece & this.typeMask) === this.Knight;
  }
  isKing(piece) {
    return (piece & this.typeMask) === this.King;
  }
  isPawn(piece) {
    return (piece & this.typeMask) === this.Pawn;
  }
}

export const Piece = new Pieces();
