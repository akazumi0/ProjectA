# Falling Stars - Modular Architecture

## Overview
This project has been refactored from a monolithic 5436-line HTML file into a clean, modular ES6 architecture optimized for iOS deployment with Capacitor.

## Project Structure

```
ProjectA/
├── src/
│   ├── index.html              # Minimal HTML entry point
│   ├── css/                    # Modular CSS
│   │   ├── base.css           # Reset, variables, animations
│   │   ├── layout.css         # Layout & positioning
│   │   ├── ui.css             # UI components
│   │   └── modals.css         # Modal styles
│   ├── js/
│   │   ├── main.js            # Application entry point
│   │   ├── core/              # Core game systems
│   │   │   ├── gameState.js   # State management
│   │   │   └── constants.js   # Game constants
│   │   ├── data/              # Game data definitions
│   │   │   ├── buildings.js   # Building configs
│   │   │   ├── technologies.js # Tech tree
│   │   │   ├── achievements.js # Achievement data
│   │   │   ├── quests.js      # Quest definitions
│   │   │   ├── artifacts.js   # Artifact system
│   │   │   ├── events.js      # Events & story
│   │   │   ├── shop.js        # Shop & IAP
│   │   │   └── dialogues.js   # ASTRA dialogues
│   │   ├── systems/           # Game systems
│   │   │   ├── audio.js       # Web Audio API
│   │   │   ├── storage.js     # Save/load
│   │   │   ├── gameLogic.js   # Core mechanics
│   │   │   └── ui.js          # UI updates
│   │   └── utils/             # Utilities
│   │       ├── formatters.js  # Number formatting
│   │       └── calculations.js # Game formulas
│   └── assets/
│       └── icon.svg           # App icon
├── index.html                  # Original monolithic file (backup)
└── manifest.json              # PWA manifest
```

## Architecture Principles

### 1. ES6 Modules
- All JavaScript code uses ES6 module system (`import/export`)
- Clean dependency graph with no circular dependencies
- Tree-shakeable for optimized builds

### 2. Separation of Concerns
- **Data**: Pure data structures with no logic
- **Core**: Game state and configuration
- **Systems**: Encapsulated subsystems (audio, storage, etc.)
- **Utils**: Reusable utility functions
- **UI**: DOM manipulation isolated from game logic

### 3. iOS/Capacitor Ready
- Web Audio API for sound (iOS compatible)
- LocalStorage for persistence
- Responsive canvas rendering
- Touch event handling
- No dependencies on external libraries

### 4. Testability
- Pure functions for calculations
- Isolated systems for unit testing
- Clear module boundaries
- Dependency injection ready

## Module Documentation

### Core Modules

#### `core/gameState.js`
Central game state management. Provides:
- `createDefaultGameState()` - Initialize fresh game
- `loadGameState(saved)` - Load from save
- `getGameState()` - Get current state
- `updateGameState(path, value)` - Update state values

#### `core/constants.js`
Game-wide constants and configuration:
- `TIMING` - Game loop intervals
- `CANVAS` - Rendering settings
- `RESOURCES` - Resource types
- `CAPACITOR` - iOS/Capacitor config

### Data Modules

All data modules export configuration objects:
- `buildingData` - 15 buildings with exponential progression
- `techData` - 20 technologies with tech tree
- `achievementData` - Achievement definitions
- `questData` - Daily quest system
- `artifactData` - Collectible artifacts
- `storyEventData` - Interactive story events
- `premiumShopData` - IAP product definitions

### System Modules

#### `systems/audio.js`
Web Audio API sound generation:
- `initAudio()` - Initialize audio context
- `playSound(type)` - Play sound effects
- `resumeAudio()` - Resume after iOS interaction

#### `systems/storage.js`
LocalStorage save/load:
- `saveGame()` - Save current state
- `loadGame()` - Load saved state
- `processOfflineEarnings(saveData)` - Calculate offline rewards
- `exportSave()` / `importSave()` - Import/export saves

#### `systems/gameLogic.js`
Core game mechanics:
- `buyBuilding(key)` - Purchase building
- `buyTechnology(key)` - Research tech
- `captureFragment(fragment)` - Handle clicks
- `updateGame(deltaTime)` - Game loop tick
- `performPrestige()` - Prestige system

#### `systems/ui.js`
UI updates and DOM manipulation:
- `updateAllUI()` - Refresh all UI elements
- `showNotification(message)` - Show notifications
- `toggleModal(id, show)` - Modal system
- `createFloatingText(text, x, y)` - Floating damage numbers

### Utility Modules

#### `utils/formatters.js`
Number and text formatting:
- `formatNumber(num)` - Format with K/M/B/T suffixes
- `formatCost(cost)` - Format resource costs
- `formatRate(rate)` - Format production rates
- `formatTime(ms)` - Format durations

#### `utils/calculations.js`
Game mechanics calculations:
- `getCost(data, level)` - Calculate upgrade cost
- `canAfford(cost)` - Check affordability
- `calculateProduction()` - Total production
- `calculateClickPower()` - Effective click power
- `calculateOfflineEarnings(time)` - Offline rewards

## Capacitor Integration Guide

### 1. Install Capacitor
```bash
npm install @capacitor/core @capacitor/cli
npx cap init "Falling Stars" "com.fallingstars.app"
```

### 2. Add iOS Platform
```bash
npm install @capacitor/ios
npx cap add ios
```

### 3. Add Plugins (Optional)
```bash
# In-App Purchases
npm install @capacitor-community/in-app-purchases

# Haptic Feedback
npm install @capacitor/haptics

# Status Bar
npm install @capacitor/status-bar
```

### 4. Build and Sync
```bash
# Copy web assets to native project
npx cap copy ios

# Open in Xcode
npx cap open ios
```

### 5. Configure iOS

Update `ios/App/App/Info.plist`:
```xml
<key>UIStatusBarStyle</key>
<string>UIStatusBarStyleLightContent</string>
<key>UIViewControllerBasedStatusBarAppearance</key>
<false/>
```

## Development Workflow

### Local Development
```bash
# Serve with any static server
npx serve src

# Or use Python
python -m http.server -d src 8000
```

### Testing Modules
Each module can be tested independently:
```javascript
import { formatNumber } from './utils/formatters.js';
console.assert(formatNumber(1000) === '1.0K');
```

### Building for Production
```bash
# Minify and bundle (optional)
# Use Rollup, Webpack, or esbuild

# Or deploy src/ directly (recommended for Capacitor)
npx cap copy ios
npx cap open ios
```

## Performance Optimizations

1. **Canvas Rendering**: 60 FPS with requestAnimationFrame
2. **Game Loop**: 10 ticks/second for logic, separate from rendering
3. **Auto-save**: Every 30 seconds (configurable)
4. **Lazy Loading**: Modals populated on-demand
5. **Event Delegation**: Minimal event listeners

## Browser Compatibility

- **Modern Browsers**: Chrome 61+, Safari 10.1+, Firefox 60+
- **iOS**: Safari 10.1+ (iOS 10.3+)
- **Android**: Chrome 61+ (Android 5.0+)

Requires ES6 module support. No transpilation needed for modern devices.

## Migration Notes

### From Original index.html

All functionality preserved:
- ✅ 15 Buildings with exponential scaling
- ✅ 20 Technologies with tech tree
- ✅ Achievement system
- ✅ Daily rewards & lootboxes
- ✅ Prestige system
- ✅ ASTRA AI dialogue
- ✅ Combo system
- ✅ Flash missions
- ✅ Story events
- ✅ Artifact collection
- ✅ Multi-planet system
- ✅ Offline earnings

### Breaking Changes
None - saves are fully compatible.

### New Features
- Modular architecture for easier testing
- Better code organization
- Capacitor-ready structure
- JSDoc comments for documentation
- Constants for easy balancing

## Future Enhancements

1. **TypeScript**: Add type safety
2. **Unit Tests**: Jest/Vitest test suite
3. **State Management**: Consider Zustand/Redux
4. **Build Pipeline**: Vite or esbuild
5. **Analytics**: Firebase Analytics
6. **Leaderboards**: Backend integration
7. **Multiplayer**: WebSocket support

## Contributing

When adding new features:
1. Add data to appropriate `data/*.js` module
2. Add logic to appropriate `systems/*.js` module
3. Add utilities to `utils/*.js` if reusable
4. Update `main.js` to integrate
5. Document with JSDoc comments

## License

[Your License Here]

---

**Generated**: 2025-11-09
**Version**: 1.0.0
**Architecture**: ES6 Modules + Capacitor
