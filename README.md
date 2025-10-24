# Blitzball 3000 - Manager Simulator

A comprehensive sports management simulator built with React, inspired by Final Fantasy X's Blitzball.

## Features

- Full league simulation with 8 teams
- Player management and contracts
- Draft system and free agency
- Playoffs and championship
- Awards and statistics tracking
- Player progression/regression
- Match simulation with play-by-play

## Project Structure

```
blitzball-3k/
├── src/
│   ├── components/          # React components
│   │   ├── common/         # Reusable UI components
│   │   ├── layout/         # Layout components (Sidebar, TopBar)
│   │   └── pages/          # Page components
│   ├── constants/          # Game constants and configuration
│   ├── engine/             # Game logic and simulation
│   ├── state/              # State management (reducer)
│   ├── utils/              # Utility functions
│   ├── App.jsx             # Main App component
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
├── index.html              # HTML template
├── package.json            # Dependencies and scripts
├── vite.config.js          # Vite configuration
└── tailwind.config.js      # Tailwind CSS configuration
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

4. Preview production build:
```bash
npm run preview
```

## Technologies

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Local Storage** - Game save persistence

## Game Mechanics

### Season Flow
1. Regular Season - Play through scheduled matches
2. Playoffs - Top 6 teams compete for championship
3. Awards - MVP, DPOY, All-League teams
4. Off-Season:
   - Player retirements
   - Re-signing expiring contracts
   - Free agency
   - Draft (24 rookies per class)
   - Player progression/regression

### Player Attributes
- **EN** - Endurance
- **AT** - Attack
- **PA** - Pass
- **SH** - Shoot
- **BL** - Block
- **CA** - Catch
- **SP** - Speed

### Positions
- **FWD** - Forward (Shooting focus)
- **MID** - Midfielder (Passing focus)
- **DEF** - Defender (Blocking/tackling focus)
- **GK** - Goalkeeper (Catching focus)

### Salary Cap
- Teams have a $15,000 salary cap
- Manage contracts carefully to build a competitive roster
- Balance veteran talent with rookie development

## License

MIT

## Credits

Inspired by Final Fantasy X's Blitzball minigame.
