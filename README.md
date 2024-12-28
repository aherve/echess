# eChess: play online chess, but over the board

https://github.com/user-attachments/assets/bde2e431-92bb-4959-bb7b-e80072c71205

## How it works

The general principle is to hide magnetic hall effect sensors under the board to detect piece presence. White & black pieces have a hidden magnet in them, in different orientations, respectively

<img src="assets/hall.png" width="350" style="align:right">

Using linear sensors we are then able to detect between 3 distinct states:

- white piece (V < 1/2Vcc - 0.2V)
- black piece (V > 1/2Vcc + 0.2V)
- no piece (1/2Vcc - 0.2V < V < 1/2Vcc + 0.2V)
