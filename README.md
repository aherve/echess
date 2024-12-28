# eChess: play online chess, but over the board

https://github.com/user-attachments/assets/bde2e431-92bb-4959-bb7b-e80072c71205

## How it works

The general principle is to hide magnetic hall effect sensors under the board to detect piece presence. White & black pieces have a hidden magnet in them, in different orientations, respectively

<img src="assets/hall.png" width="350" align="right">

Using linear sensors we are then able to detect between 3 distinct states:

- white piece (low voltage)
- black piece (high voltage)
- no piece (~ half the supply voltage)

In addition to the sensors, a 64x64 LED matrix is used to display the opponent's moves on the board. An arduino microcontroller interfaces with a typescript program running on a computer to control the LEDs, read the sensors, and communicate with the lichess API.

## The electronics

For the board to work, is is necessary to:

- read inputs from the program, and light any number of leds of a 8x8 grid
- read the state of 64 hall effect sensors in near real time, and send the state to the program

Since the arduino has a limited number of pins, two 74HC595 shift registers are used to control the LEDs, and an additional 74HC4051 multiplexer is used to control the sensor rows.

![overview](assets/electronics_schematics_overview.png)
