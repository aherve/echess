import blessed from "blessed";
import { SquareState } from "./utils";

export class Gui {
  private btime = -1;
  private hasBoard = false;
  private hasGame = false;
  private screen: blessed.Widgets.Screen;
  private wtime = -1;
  private board: Array<Array<SquareState>> = [];

  constructor() {
    this.screen = blessed.screen({
      smartCSR: true,
      autoPadding: true,
      terminal: "xterm-basic",
    });
    this.render();
  }

  public setBoardStatus(hasBoard: boolean) {
    this.hasBoard = hasBoard;
    this.render();
  }

  public updateClock({ btime, wtime }: { btime: number; wtime: number }) {
    this.wtime = wtime;
    this.btime = btime;
    this.render();
  }

  public updateBoard(board: Array<Array<SquareState>>) {
    this.board = board;
    this.render();
  }

  private render() {
    if (!this.hasBoard) {
      return this.renderNoBoard();
    }
    if (!this.hasGame) {
      return this.renderNoGame();
    }
    console.log({ wtime: this.wtime, btime: this.btime });
  }

  private renderNoGame() {
    const box = blessed.box({
      top: "center",
      left: "center",
      width: "80%",
      height: "80%",
      border: {
        type: "line",
      },
      style: {
        fg: "white",
        border: {
          fg: "#f0f0f0",
        },
      },
    });

    if (isUnpoweredBoard(this.board)) {
      box.content = "Please connect the board to a power source.";
    } else if (!isStartingPosition(this.board)) {
      box.content = "Please place the pieces in the starting position.";

      blessed.box({
        align: "center",
        parent: box,
        top: "center",
        left: "center",
        width: "50%",
        height: "50%",
        content: buildAsciiBoard(this.board),
      });
    } else {
      box.content = "Board is ready for a new game";
    }

    this.screen.append(box);
    this.screen.render();
  }

  private renderNoBoard() {
    const box = blessed.box({
      top: "center",
      left: "center",
      width: "80%",
      height: "80%",
      content: "Connecting to the board...",
      tags: true,
      border: {
        type: "line",
      },
      style: {
        fg: "white",
        border: {
          fg: "#f0f0f0",
        },
      },
    });
    this.screen.append(box);
    this.screen.render();
  }
}

function buildAsciiBoard(board: Array<Array<SquareState>>): string {
  let res = "";
  for (let i = 7; i >= 0; i--) {
    res += "|" + board[i].join("|") + "|\n";
  }
  return res;
}

function isUnpoweredBoard(board: Array<Array<SquareState>>): boolean {
  return board.every((row) => row.every((cell) => cell === "B"));
}

function isStartingPosition(board: Array<Array<SquareState>>): boolean {
  // 2 rows of white pieces
  for (const i of [0, 1]) {
    if (board[i].some((cell) => cell !== "W")) {
      return false;
    }
  }
  for (const i of [2, 5]) {
    if (board[i].some((cell) => cell !== "_")) {
      return false;
    }
  }
  for (const i of [6, 7]) {
    if (board[i].some((cell) => cell !== "B")) {
      return false;
    }
  }
  return true;
}
