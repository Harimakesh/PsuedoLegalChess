import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { Piece } from "./Piece";
import { PrecomputedMoveData } from "./PrecomputedMoves";

function Square(props) {
  return (
    <div
      className="Square"
      name={props.squareColor}
      onClick={() => props.onClick()}
    >
      {/* Can be represented as a Piece Component */}
      <img
        src={props.svgPiece}
        hidden={props.isHidden}
        name={props.imgName}
        alt=""
      ></img>
    </div>
  );
}

class Board extends React.Component {
  PlayerTurn = 1;
  constructor(props) {
    super(props);

    let square = [];

    let index = 0;
    for (let file = 0; file < 8; file++) {
      for (let rank = 0; rank < 8; rank++) {
        let islight = (rank + file) % 2 === 0;
        let i = index;
        if (!islight) {
          square.push(
            <Square
              key={i}
              squareColor="white"
              svgPiece=""
              isHidden="1"
              Piece={0}
              onClick={() => this.handleclick(i)}
            />
          );
        } else {
          square.push(
            <Square
              key={i}
              squareColor="black"
              svgPiece=""
              isHidden="1"
              Piece={0}
              onClick={() => this.handleclick(i)}
            />
          );
        }
        index++;
      }
    }
    this.state = {
      Squares: square,
      // History:[square,],
    };
  }

  componentDidMount() {
    //Initial fen string
    const fenString = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";
    const fen = fenString.split("");
    // const fen=['N']
    let squares = this.state.Squares.slice();
    let file = 0,
      rank = 7;
    fen.forEach((element) => {
      // console.log("file: "+file+" \trank:"+rank+"\t index:"+(file+rank*8)+"\t eleemnt: "+element);
      if (element === "/") {
        file = 0;
        rank--;
      } else {
        if (!isNaN(element)) {
          file += parseInt(element);
        } else {
          let i = rank * 8 + file;
          squares[i] = (
            <Square
              key={i}
              squareColor={squares[i].props.squareColor}
              svgPiece={Piece.imports[element][0]}
              Piece={Piece.imports[element][1]}
              onClick={() => this.handleclick(i)}
            />
          );
          file++;
        }
      }
    });
    // this.setState({Squares:squares,History:history.push(squares)});
    this.setState({ Squares: squares });
  }

  lastSelectedIndex = -1;

  PreviousRenderedBoard = [];
  Moves = [];

  GenerateMoves(index) {
    let square = this.state.Squares.slice();
    this.Moves = [];
    let piece = square[index].props.Piece;
    if (Piece.isSliding(piece)) {
      this.GenerateSlidingMoves(index, piece);
    } else if (Piece.isKnight(piece)) {
      this.GenerateKnightMoves(index, piece);
    } else if (Piece.isKing(piece)) {
      this.GenerateKingMoves(index, piece);
    } else if (Piece.isPawn(piece)) {
      this.GeneratePawnMoves(index, piece);
    }
  }

  GenerateKnightMoves(index, piece) {
    let square = this.state.Squares.slice();
    let moves = [];
    let capture = [];
    let y = Math.floor(index / 8);
    let x = index - y * 8;
    PrecomputedMoveData.allKnightjumps.forEach((element) => {
      let knightJumpSquare = index + element;
      if (knightJumpSquare >= 0 && knightJumpSquare < 64) {
        let Y = Math.floor(knightJumpSquare / 8);
        let X = knightJumpSquare - Y * 8;
        let max = Math.max(Math.abs(x - X), Math.abs(y - Y));
        if (max === 2) {
          let pieceOnTarget = square[knightJumpSquare].props.Piece;
          if (pieceOnTarget !== 0) {
            if (!Piece.sameColor(piece, pieceOnTarget)) {
              capture.push(knightJumpSquare);
              return;
            } else {
              return;
            }
          }
          moves.push(knightJumpSquare);
        }
      }
    });

    this.Moves.push(moves);
    this.Moves.push(capture);
  }
  GenerateSlidingMoves(index, piece) {
    let square = this.state.Squares.slice();
    let moves = [];
    let capture = [];

    let startIndex = Piece.isType(piece, Piece.Bishop) ? 4 : 0;
    let endIndex = Piece.isType(piece, Piece.Rook) ? 4 : 8;

    for (
      let directionIndex = startIndex;
      directionIndex < endIndex;
      directionIndex++
    ) {
      for (
        let n = 0;
        n < PrecomputedMoveData.NumSquaresToedge[index][directionIndex];
        n++
      ) {
        let targetIndex =
          index +
          PrecomputedMoveData.DirectionOffsets[directionIndex] * (n + 1);

        let pieceOnTargetSquare = square[targetIndex].props.Piece;

        if (pieceOnTargetSquare) {
          if (Piece.sameColor(piece, pieceOnTargetSquare)) {
            break;
          }
          if (!Piece.sameColor(piece, pieceOnTargetSquare)) {
            capture.push(targetIndex);
            break;
          }
        }
        moves.push(targetIndex);
      }
    }
    this.Moves.push(moves);
    this.Moves.push(capture);
  }
  GenerateKingMoves(index, piece) {
    let square = this.state.Squares.slice();
    let moves = [];
    let capture = [];
    for (let x = 0; x < 8; x++) {
      if (PrecomputedMoveData.NumSquaresToedge[index][x] > 0) {
        let targetIndex = PrecomputedMoveData.DirectionOffsets[x] + index;

        let pieceOnTarget = square[targetIndex].props.Piece;

        if (pieceOnTarget !== 0) {
          if (Piece.sameColor(piece, pieceOnTarget)) {
            continue;
          }
          if (!Piece.sameColor(piece, pieceOnTarget)) {
            capture.push(targetIndex);
            continue;
          }
        }
        moves.push(targetIndex);
      }
    }
    this.Moves.push(moves);
    this.Moves.push(capture);
  }
  GeneratePawnMoves(index, piece) {
    let square = this.state.Squares.slice();
    let moves = [];
    let capture = [];
    let pawnOffset = Piece.isWhite(piece) ? 8 : -8;
    let startRank = this.PlayerTurn === 1 ? 1 : 6;
    // let finalRank=this.PlayerTurn===1?6:1;

    let pawnAttackDirections = Piece.isWhite(piece) ? [4, 6] : [7, 5];
    let rank = Math.floor(index / 8);
    let squareOneForward = index + pawnOffset;

    if (square[squareOneForward].props.Piece === Piece.None) {
      moves.push(squareOneForward);

      if (rank === startRank) {
        let squareTwoForward = squareOneForward + pawnOffset;
        if (square[squareTwoForward].props.Piece === Piece.None) {
          moves.push(squareTwoForward);
        }
      }
    }
    for (let i = 0; i < 2; i++) {
      if (
        PrecomputedMoveData.NumSquaresToedge[index][pawnAttackDirections[i]] > 0
      ) {
        let pawnCaptureDir =
          PrecomputedMoveData.DirectionOffsets[pawnAttackDirections[i]];
        let targetSquare = index + pawnCaptureDir;
        let pieceOnTarget = square[targetSquare].props.Piece;

        if (pieceOnTarget !== 0) {
          if (!Piece.sameColor(piece, pieceOnTarget)) {
            capture.push(targetSquare);
          }
        }
      }
    }
    this.Moves.push(moves);
    this.Moves.push(capture);
  }
  //handleclick(before moves were computed)
  handleclick(i) {
    let square = this.state.Squares.slice();
    //To make the square to be 'selected'
    if (
      this.lastSelectedIndex === -1 &&
      square[i].props.Piece &&
      square[i].props.Piece >> 3 === this.PlayerTurn
    ) {
      //change all the squares imgName to their respective status (can be captured=>red , can be place=> gold)
      //Note:Only for the squares that can be accesed from this index 'i' and piece 'square[i].Props.Piece'

      this.GenerateMoves(i);

      this.PreviousRenderedBoard = square.slice();
      square[i] = (
        <Square
          key={i}
          squareColor="selected"
          svgPiece={square[i].props.svgPiece}
          Piece={square[i].props.Piece}
          onClick={() => this.handleclick(i)}
        />
      );

      this.Moves[0].forEach((index) => {
        square[index] = (
          <Square
            key={index}
            squareColor={
              square[index].props.squareColor === "white"
                ? "onwhite"
                : "onblack"
            }
            svgPiece={square[index].props.svgPiece}
            Piece={square[index].props.Piece}
            onClick={() => this.handleclick(index)}
            isHidden={1}
          />
        );
      });
      this.Moves[1].forEach((index) => {
        square[index] = (
          <Square
            key={index}
            squareColor={
              square[index].props.squareColor === "white"
                ? "onwhite"
                : "onblack"
            }
            svgPiece={square[index].props.svgPiece}
            Piece={square[index].props.Piece}
            onClick={() => this.handleclick(index)}
          />
        );
      });
      this.lastSelectedIndex = i;
      this.setState({ Squares: square });
    }
    //To make a move if its valid
    else if (this.lastSelectedIndex !== -1) {
      //only change the svgimg of the selected index for the previously rendered Board
      if (this.lastSelectedIndex === i) {
        this.setState({ Squares: this.PreviousRenderedBoard });
        this.lastSelectedIndex = -1;
        return;
      }
      if (this.Moves[0].includes(i) || this.Moves[1].includes(i)) {
        square = this.PreviousRenderedBoard.slice();

        const lastSelectedSquare = square[this.lastSelectedIndex];
        let j = this.lastSelectedIndex;
        square[this.lastSelectedIndex] = (
          <Square
            key={this.lastSelectedIndex}
            squareColor={lastSelectedSquare.props.squareColor}
            svgPiece=""
            isHidden={1}
            Piece={0}
            onClick={() => this.handleclick(j)}
          />
        );
        let targetPiece = lastSelectedSquare.props.svgPiece;
        let targetPieceValue = lastSelectedSquare.props.Piece;
        //Promotion move
        if (
          (Math.floor(i / 8) === 0 || Math.floor(i / 8) === 7) &&
          Piece.isPawn(lastSelectedSquare.props.Piece)
        ) {
          targetPiece = Piece.imports[this.PlayerTurn === 1 ? "Q" : "q"][0];
          targetPieceValue =
            Piece.imports[this.PlayerTurn === 1 ? "Q" : "q"][1];
        }

        square[i] = (
          <Square
            key={i}
            squareColor={square[i].props.squareColor}
            svgPiece={targetPiece}
            Piece={targetPieceValue}
            onClick={() => this.handleclick(i)}
          />
        );

        this.setState({ Squares: square });

        this.PlayerTurn =
          this.lastSelectedIndex !== i
            ? this.PlayerTurn === 1
              ? 2
              : 1
            : this.PlayerTurn;
        this.lastSelectedIndex = -1;
        return;
      }
      let piece = square[this.lastSelectedIndex].props.Piece;
      if (piece !== 0) {
        if (Piece.sameColor(piece, square[i].props.Piece)) {
          this.lastSelectedIndex = -1;
          this.setState({ Squares: this.PreviousRenderedBoard.slice() });
        }
      }
    }
  }

  render() {
    return <div className="Board">{this.state.Squares}</div>;
  }
}

// ====================================
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Board />);
