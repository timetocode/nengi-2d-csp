# nengi-2d-csp
This is a game template demonstrating full suite of lag compensation techniques

- predicted movement
- predicted shots
- reconciliation from incorrect movement
- rewind-style lag compensation of shots on the server
- server-side smoothed movement via two entities per client (only applies during severe lag)
- interpolation

Predicted entities are drawn in white, and server-authoritative state is drawn in red.

[feature demo on youtube](https://youtu.be/7WJnQh-QcUc)

To run the game:
```sh
npm install
npm start
## visit http://localhost:8080
```
The game should look like this:
![nengi-2d-basic screenshot](./public/images/screenshot.png)

The renderer is PIXI v5, though it is just a few primitive shapes..

The controls are
- arrowkeys or...
- w - up
- a - left
- s - down
- d - right
- mousemove - look around
- mouseclick - shoot

## Bots
There are bots programmed to run around randomly in the game. To connect the bots keep the game running as done with `npm start` and then open an additional command prompt.
```sh
> node bot/index.js
```
