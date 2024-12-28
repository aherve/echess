import { SerialPort } from "serialport";
import { Game } from "./types";
import { GameHandler } from "./game-handler";
import { findAndWatch, streamGame } from "./lichess";
import { SquareState } from "./utils";
import { logger } from "./logger";

export async function main() {
  const port = await openSerial();
  const game = new GameHandler(port);

  emitSerialEvents(port, game).catch((err) => {
    logger.error("Error while handling serial events", err);
    process.exit(1);
  });
  while (true) {
    let lichessGame: Game | null = null;
    while (!lichessGame) {
      logger.info("looking for a game...");
      lichessGame = await findAndWatch();
      if (!lichessGame) {
        logger.info("No game found. Retrying in a few seconds...");
        await new Promise((resolve) => setTimeout(resolve, 5000));
      } else {
        logger.info("found game", lichessGame.fullId);
        await game.reset(
          lichessGame.fullId,
          lichessGame.color === "white" ? "w" : "b"
        );
      }
    }
    await emitLichessEvents(lichessGame.fullId, game);
    logger.info("game ended");
    game.terminateGame();
  }
}

async function openSerial(): Promise<SerialPort> {
  const paths = (await SerialPort.list()).filter(
    (port) =>
      port.path.startsWith("/dev/tty.usbserial") ||
      port.path.startsWith("/dev/cu.usbserial")
  );
  if (paths.length === 0) {
    throw new Error("No serial port found");
  }
  return new Promise((resolve, reject) => {
    logger.info("opening serial port");
    const port: SerialPort = new SerialPort(
      {
        //path: "/dev/cu.usbserial-110",
        path: paths[0].path,
        baudRate: 115200,
      },
      (err) => {
        if (err) {
          return reject(err);
        }
        logger.info("serial port opened");
        return resolve(port);
      }
    );
  });
}

function emitSerialEvents(port: SerialPort, game: GameHandler) {
  return new Promise((_, reject) => {
    const dataBuffer: number[] = [];
    port.on("error", reject);
    port.on("close", () => {
      reject("lost connection to serial port");
    });
    port.on("data", (data) => {
      dataBuffer.push(...data);
      const latestMessage = getLatestMessage(dataBuffer);
      if (latestMessage) {
        game.updateArduinoBoard(buildBoard(latestMessage));
      }
    });
  });
}

function buildBoard(binaryState: Array<number>): Array<Array<SquareState>> {
  const board = new Array(8).fill("_").map(() => new Array(8).fill("_"));
  for (let i = 0; i < 16; i += 2) {
    const whiteByte = binaryState[i];
    const blackByte = binaryState[i + 1];

    for (let j = 0; j < 8; j++) {
      const whiteBit = whiteByte & (1 << j);
      const blackBit = blackByte & (1 << j);

      if (whiteBit) {
        board[i / 2][j] = "W";
      } else if (blackBit) {
        board[i / 2][j] = "B";
      } else {
        board[i / 2][j] = "_";
      }
    }
  }
  displayBoard(board);
  return board;
}

function displayBoard(board: Array<Array<string>>) {
  for (let i = 7; i >= 0; i--) {
    logger.info(board[i].join("|"));
  }
  logger.info(" ");
}

export function getLatestMessage(dataBuffer: number[]): number[] | null {
  if (dataBuffer.length < 19) {
    return null;
  }
  for (let i = dataBuffer.length - 1; i > 3; i--) {
    if (
      dataBuffer[i] === 255 &&
      dataBuffer[i - 1] === 255 &&
      dataBuffer[i - 2] === 255
    ) {
      if (i < 16) {
        logger.error("discarding incomplete message");
        dataBuffer.splice(0, i + 1);
        return null;
      }
      const latestMessage = dataBuffer.slice(i - 18, i - 2);
      dataBuffer.splice(0, i + 1);
      return latestMessage;
    }
  }
  return null;
}

async function emitLichessEvents(gameId: string, game: GameHandler) {
  for await (const lichessEvent of streamGame(gameId)) {
    logger.info("got lichess event", lichessEvent);
    switch (lichessEvent.type) {
      case "gameFull": {
        const moves = lichessEvent.state.moves;
        await game.updateLichessMoves(moves);
        break;
      }
      case "gameState": {
        const moves = lichessEvent.moves;
        await game.updateLichessMoves(moves);
        break;
      }
      case "opponentGone": {
        if (lichessEvent.claimWinInSeconds <= 0) {
          await game.claimVictory();
        } else {
          logger.info("opponent gone, waiting for claim win");
        }
        break;
      }
      default:
        logger.info("Ignoring lichess event", lichessEvent);
    }
  }
  logger.info("stream Game terminated");
}
