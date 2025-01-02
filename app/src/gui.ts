import blessed from "blessed";
import contrib from "blessed-contrib";

export class Gui {
  public hasBoard = false;
  public hasGame = false;

  private wtime = -1;
  private btime = -1;
  private screen: blessed.Widgets.Screen;

  constructor() {
    this.screen = blessed.screen({
      smartCSR: true,
    });
    this.render();
  }

  public updateClock({ btime, wtime }: { btime: number; wtime: number }) {
    this.wtime = wtime;
    this.btime = btime;
    this.render();
  }

  private render() {
    if (!this.hasBoard) {
      return this.renderNoBoard();
    }
    console.log({ wtime: this.wtime, btime: this.btime });
  }

  private renderNoBoard() {
    const box = blessed.box({
      top: "center",
      left: "center",
      width: "50%",
      height: "50%",
      content: "Please connect the board...",
      //tags: true,
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
