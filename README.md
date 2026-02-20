<p align="center"><img src="docs/preview.png" alt="retro-arcade preview" width="100%"></p>

# Retro Arcade

Collection of 6 classic arcade games with pixel-art CRT aesthetics, achievements, high scores, and touch controls for mobile.

**Live:** [corvid-agent.github.io/retro-arcade](https://corvid-agent.github.io/retro-arcade/)

## Games

- **Snake** — classic snake with growing tail and speed progression
- **Tetris** — falling blocks with rotation, line clears, and leveling
- **Breakout** — paddle-and-ball brick breaker
- **Space Invaders** — shoot descending alien waves
- **2048** — slide-and-merge number puzzle
- **Memory** — card-matching memory game

## Features

- Immersive fullscreen game mode
- CRT scanline overlay and vignette effects (toggleable)
- Achievement and badge system
- High score persistence (localStorage)
- Touch controls for mobile play
- Sound effects with mute toggle
- Keyboard shortcuts

## Tech Stack

- Angular 21 (standalone components, signals)
- HTML Canvas API for game rendering
- Press Start 2P pixel font
- CSS custom properties with green-phosphor CRT theme

## Development

```bash
npm install
npm start
npm test
npm run build
```

## License

MIT
