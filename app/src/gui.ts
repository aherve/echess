import contrib from "blessed-contrib";
import blessed from "blessed";
import { SquareState } from "./utils";
import { asciiPlug, asciiUsb } from "./ascii-art";
import { createSeek } from "./lichess";
import { logger } from "./logger";
import type { GameStateEvent } from "./types";

export class Gui {
  private btime = -1;
  private hasBoard = false;
  private hasGame = false;
  private screen: blessed.Widgets.Screen;
  private wtime = -1;
  private board: Array<Array<SquareState>> = [];
  private grid: contrib.grid;
  private color: "black" | "white" | null = null;
  private isMyTurn = false;

  constructor() {
    this.screen = blessed.screen({
      smartCSR: true,
      autoPadding: true,
      terminal: "xterm-basic",
      fullUnicode: true,
    });
    this.screen.key(["escape", "q", "C-c"], () => {
      return process.exit(0);
    });
    this.grid = new contrib.grid({ rows: 12, cols: 12, screen: this.screen });
    this.render();
  }

  public terminateGame() {
    this.hasGame = false;
    this.render();
  }

  public setBoardStatus(hasBoard: boolean) {
    this.hasBoard = hasBoard;
    this.render();
  }

  public setMyColor(color: "black" | "white") {
    this.color = color;
  }

  public updateClock({ btime, wtime, moves }: GameStateEvent) {
    this.hasGame = true;
    this.wtime = wtime;
    this.btime = btime;
    this.isMyTurn =
      (this.color === "white" && moves.length % 2 === 0) ||
      (this.color === "black" && moves.length % 2 === 1);
    logger.info("is my turn", { isMyTurn: this.isMyTurn });
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
    this.renderGame();
  }

  private renderGame() {
    this.grid.set(0, 0, 6, 12, blessed.box, {
      align: "center",
      content:
        prettyTimer(this.color === "white" ? this.btime : this.wtime) +
        (this.isMyTurn ? "  " : " \u{1F7E2}"),
    });
    this.grid.set(6, 0, 6, 12, blessed.box, {
      align: "center",
      content:
        prettyTimer(this.color === "white" ? this.wtime : this.btime) +
        (this.isMyTurn ? " \u{1F7E2}" : "  "),
    });
    this.screen.render();
  }

  private renderNoGame() {
    const box = this.grid.set(0, 0, 12, 12, blessed.box, {
      align: "center",
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
      box.content = "Please connect the board to a power source." + asciiPlug;
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
      box.content = "Ready for a new game";
      const fifteenTen = this.grid.set(4, 1, 5, 5, blessed.box, {
        align: "center",
        content: "Create 15 | 10 game",
        left: "center",
      });
      const tenFive = this.grid.set(4, 6, 5, 5, blessed.box, {
        align: "center",
        content: "Create 10 | 5 game",
        left: "center",
      });

      fifteenTen.on("click", () => {
        createSeek({ time: 15, increment: 10 })
          .then(() => {
            fifteenTen.setContent("Looking for an opponent...");
            this.screen.render();
          })
          .catch((e) => {
            logger.error(e);
          });
      });
      tenFive.on("click", () => {
        createSeek({ time: 10, increment: 5 })
          .then(() => {
            fifteenTen.setContent("Looking for an opponent...");
            this.screen.render();
          })
          .catch((e) => {
            logger.error(e);
          });
      });
    }

    this.screen.render();
  }

  private renderNoBoard() {
    this.grid.set(0, 0, 12, 12, blessed.box, {
      top: "center",
      align: "center",
      left: "center",
      width: "95%",
      height: "95%",
      content: `Connecting to the board...` + asciiUsb,
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

function prettyTimer(msTime: number): string {
  const time = msTime / 1000;

  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = Math.floor(time % 60);

  if (hours > 0) {
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}
