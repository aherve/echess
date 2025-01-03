import { it, describe } from 'vitest'
import { Gui } from './gui'

describe('gui integration test', () => {
  it('renders the board with the correct pieces', async () => {
    const gui = new Gui()
    gui.setBoardStatus(true)
    gui.updateBoard([
      //
      ['W', 'W', 'W', 'W', 'W', 'W', 'W', 'W'],
      ['W', 'W', 'W', 'W', 'W', 'W', 'W', 'W'],
      ['_', '_', '_', '_', '_', '_', '_', '_'],
      ['_', '_', '_', '_', '_', '_', '_', '_'],
      ['_', '_', '_', '_', '_', '_', '_', '_'],
      ['_', '_', '_', '_', '_', '_', '_', '_'],
      ['B', 'B', 'B', 'B', 'B', 'B', 'B', 'B'],
      ['B', 'B', 'B', 'B', 'B', 'B', 'B', 'B'],
      /*
       *["B", "B", "B", "B", "B", "B", "B", "B"],
       *["B", "B", "B", "B", "B", "B", "B", "B"],
       *["B", "B", "B", "B", "B", "B", "B", "B"],
       *["B", "B", "B", "B", "B", "B", "B", "B"],
       *["B", "B", "B", "B", "B", "B", "B", "B"],
       *["B", "B", "B", "B", "B", "B", "B", "B"],
       *["B", "B", "B", "B", "B", "B", "B", "B"],
       *["B", "B", "B", "B", "B", "B", "B", "B"],
       */
    ])
    gui.setMyColor('black', '123')
    gui.updateFromLichess({
      status: 'started',
      moves: [],
      wtime: 100000,
      btime: 100000,
    })

    await new Promise((r) => setTimeout(r, 20000))
  })
})
