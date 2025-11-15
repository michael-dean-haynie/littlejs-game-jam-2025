# LittleJS Game Jam 2025 - Codebase Architecture Analysis

## Executive Summary

This is a **2.5D real-time strategy (RTS) game** built with the LittleJS engine, featuring procedurally generated terrain with cliff-based elevation, unit control with combat abilities, and a sophisticated state machine architecture. The game implements a topdown-oblique perspective rendering system with dynamic terrain generation using Simplex noise.

## Tech Stack

- **Game Engine**: LittleJS (v1.17.1) - Micro game engine with WebGL rendering
- **Physics**: Box2D (WASM) - 2D physics simulation
- **Build Tool**: Vite - Fast development and production builds
- **Language**: TypeScript (v5.8.3) with strict mode and decorators
- **State Management**: RxJS (v7.8.2) - Reactive programming for events/messages
- **UI Framework**: Lit (v3.3.1) - Web components for overlays
- **Styling**: Tailwind CSS (v4.1.15) + DaisyUI (v5.3.9)
- **Dependency Injection**: Inversify (v7.10.1) - NOT YET IMPLEMENTED (planned)
- **Pathfinding**: fast-astar (v1.0.6) - A\* pathfinding algorithm
- **Random Generation**: alea (v1.0.1) - Seeded PRNG + simplex-noise (v4.0.3)
- **Testing**: Vitest (v3.2.4) with V8 coverage, jsdom for browser API simulation

## Project Structure

```txt
src/
├── abilities/          # Unit abilities (attack, guard)
├── core/              # Shared utilities and types
│   ├── types/         # Common type definitions (directions, vectors)
│   └── util/          # Helper functions
├── game/              # Main game loop and initialization
├── input/             # Input handling system
│   ├── game-inputs/   # Game command objects (Move, Attack, etc.)
│   ├── input-controller/
│   │   └── keyboard/  # Keyboard input with profiles
│   └── input-manager/ # Input aggregation and distribution
├── lit/               # Lit web components
│   └── components/    # UI overlays (world config, etc.)
├── messages/          # Message/event type definitions
├── noise/             # Procedural noise generation
├── player/            # Player controller
├── sprite-animation/  # Sprite animation system
├── textures/          # Texture and sprite sheet definitions
│   ├── sprite-sheets/ # Sprite animation metadata
│   └── tile-sheets/   # Terrain tile definitions
├── units/             # Unit types and behaviors
│   └── states/        # Unit state machine implementations
└── world/             # World system and terrain rendering
    └── renderers/     # Terrain rendering implementations
        └── sectors/   # Sector-based world management
```

## High-Level Architecture

### The `.al.ts` File Naming Convention

Files ending in `.al.ts` are **"autoload"** files designed for the planned IoC (Inversion of Control) container system.

**Current Status**: The IoC system is NOT yet implemented. These files currently use manual singleton patterns (exporting const instances) instead of dependency injection.

Examples:

- `game.al.ts` → exports `export const game = new Game()`
- `world.al.ts` → exports `export const world = new World()`
- `player.al.ts` → exports `export const player = new Player()`

### Core Systems

1. **Game Loop** (Game class) - Manages LittleJS lifecycle (src/game/game.al.ts:11)
2. **World System** - Handles terrain generation and rendering (src/world/world.al.ts:1)
3. **Unit System** - Manages game entities with state machines (src/units/unit-object.ts:1)
4. **Input System** - Processes keyboard/mouse and converts to game commands (src/input/input-manager/input-manager.al.ts:1)
5. **Message System** - Event-driven communication between systems (src/messages/messages.types.ts:1)
6. **Rendering System** - Handles perspective projection and sprite rendering

## Key Design Patterns

### 1. Module Singleton Pattern

Currently used instead of dependency injection:

```typescript
// Each .al.ts file exports a singleton instance
export class Game { ... }
export const game = new Game();
```

### 2. State Pattern

Unit behavior controlled by state objects with stack-based transitions:

- States: `idling`, `moving`, `casting`
- State transitions via message queue
- Stack allows nested states (interrupt and resume)

### 3. Message/Event System

**RxJS Observables** for reactive programming between systems.
**Message Queue** for state machine communication within units.

### 4. Progressive Loading Pattern

Sectors load/unload in phases to support infinite worlds:

```ts
phases = [
  "bare",
  "noise",
  "cliffs",
  "ramps",
  "obstacles",
  "renderers",
  "rails",
];
```

## Game Architecture Flow

```txt
Input Events (Keyboard/Mouse)
  ↓
KeyboardController → converts to → Game Input Commands
  ↓
InputManager (RxJS stream)
  ↓
Player → converts to → Unit Messages
  ↓
UnitObject.enqueueMessage()
  ↓
State Machine Processes Messages
  ↓
Unit Behavior (movement, abilities, etc.)
```

## World System

### Terrain Generation

1. **Simplex Noise** with multiple octaves for organic terrain
2. **Quantization** to create discrete cliff heights (0-5 levels)
3. **Sector-based streaming** for infinite worlds
4. **Progressive loading** through 7 phases

### Rendering Perspectives

- **Top-down** (`topdown`) - Pure 2D orthographic
- **Top-down Oblique** (`topdown-oblique`) - 2.5D isometric-style

Each cliff level is offset vertically for depth perception.

## Unit System

### State Machine

Units use a state stack with message-driven transitions:

```typescript
// State transitions
pushState(state); // Enter new state (push to stack)
popState(); // Exit current state (pop from stack)
enqueueMessage(); // Add message to processing queue
```

### Abilities

Abilities progress through phases:

- `init` - Initialization
- `preswing` - Windup animation
- `swing` - Apply effects (damage, knockback)
- `backswing` - Recovery animation
- `complete` - Return to previous state

### Unit Types

- **Warrior** - Melee fighter (src/units/warrior.ts:1)
- **Lancer** - Spear wielder (src/units/lancer.ts:1)
- **Spider** - Fast enemy (src/units/spider.ts:1)
- **Skull** - Flying enemy (src/units/skull.ts:1)

## Input System

### Keyboard Profiles

Multiple control schemes supported:

- `keyboard-profile-kenisis.ts` - Ergonomic layout (IJKL movement)
- `keyboard-profile-laptop.ts` - Touchpad-friendly
- `keyboard-profile-vim.ts` - Vim-style hjkl movement

### Input Flow

Raw keyboard events → KeyboardController → Game Input Commands → InputManager → Player → Unit Messages

## Important Conventions

### Timing

- All durations in **seconds**, never frames
- Enables framerate independence
- Example: `0.1` = 100ms

### Code Comments

```typescript
// michael: improve: <description>  - Improvement needed
// michael: debug: <description>    - Temporary debug code
// michael: document: <description> - Needs documentation
```

### Naming

```typescript
private _privateField: string;      // Prefix private with _
public observable$: Observable;     // Suffix RxJS with $
```

## Current Game Features

**Implemented**:

- ✅ Procedurally generated terrain with cliffs and ramps
- ✅ Player-controlled units with WASD/IJKL movement
- ✅ Combat system with attack abilities
- ✅ Physics-based knockback
- ✅ Dynamic camera following player
- ✅ Perspective rendering (top-down oblique)
- ✅ Multiple unit types
- ✅ State-based unit behavior
- ✅ Terrain collision/pathing constraints

**Planned/In Progress**:

- ❌ Pathfinding with A\* algorithm
- ❌ Enemy AI
- ❌ Doodads (trees, rocks, bushes)
- ❌ Water rendering with waves
- ❌ Viewport culling optimization
- ❌ Multiple unit selection
- ❌ Formation movement

## Known Issues

**Architecture**:

- IoC container planned but not implemented (using manual singletons)
- LittleJS imports not isolated (violates planned architecture boundary)

**Units**:

- Guard ability interrupts attack (should requeue instead)
- Attack can't interrupt guard
- Mouse interactions don't account for cliff height offset
- Attack direction locked during animation

**Terrain**:

- Top cliff corners rendering issues
- Canvas layer building creates tileInfos every loop (inefficient)
- No viewport culling (renders everything)
- Ramps only support east/west facing

**Controls**:

- Mouse clicks can get stuck in up/down state

## Key Files Reference

### Entry Points

- `/index.html` - HTML entry point
- `/src/main.ts:1` - TypeScript entry point

### Core Systems

- `/src/game/game.al.ts:11` - Main game loop (Game class)
- `/src/world/world.al.ts:1` - World manager
- `/src/player/player.al.ts:1` - Player controller
- `/src/input/input-manager/input-manager.al.ts:1` - Input aggregation

### Unit System

- `/src/units/unit-object.ts:1` - Base unit class
- `/src/units/states/unit-state-idling.ts:1` - Idle state
- `/src/units/states/unit-state-moving.ts:1` - Moving state
- `/src/units/states/unit-state-casting.ts:1` - Ability casting state

### World/Terrain

- `/src/world/cell.ts:1` - Terrain cell logic
- `/src/world/renderers/sectors/sector.ts:1` - Sector management
- `/src/noise/generate-noise-map.ts:1` - Terrain generation

### Input

- `/src/input/input-controller/keyboard/keyboard-controller.al.ts:1` - Keyboard handler
- `/src/input/game-inputs/game-input.types.ts:1` - Input command types

### Abilities

- `/src/abilities/ability-base.ts:1` - Ability base class
- `/src/abilities/attack.ts:1` - Attack ability
- `/src/abilities/guard.ts:1` - Guard ability

### Animation

- `/src/sprite-animation/sprite-animation.ts:1` - Animation controller
- `/src/textures/sprite-sheets/sprite-sheet.types.ts:1` - Sprite metadata

### UI

- `/src/lit/components/lit-world-config-overlay.al.ts:1` - Dev tools overlay

### Utilities

- `/src/core/enumeration-factory.ts:1` - String union helper
- `/src/messages/messages.types.ts:1` - Message type definitions

## Development

### NPM Scripts

```bash
npm run dev       # Start dev server with hot reload
npm run build     # Type-check + production build + zip for itch.io
npm run preview   # Serve production build locally
npm run test      # Run tests with coverage (watch mode)
npm run test:ci   # Run tests once (CI mode)
npm run lint      # Check for lint issues
npm run format:check  # Check formatting
npm run check     # Full sanity check before commit
```

### Dev Tools

- **Vite Plugin Checker** - TypeScript errors in browser overlay
- **Lit Overlay** - Runtime terrain/config editor (backtick ` key to toggle)
- **Debug Variables** - `window.world`, `window.unit` exposed in console

## Summary

This is a **well-architected game project** with clear separation of concerns. The codebase demonstrates:

**Strengths**:

- Clean state machine pattern for unit behavior
- Reactive programming with RxJS for event flow
- Sophisticated terrain generation with progressive loading
- Modular component-based design
- Type-safe message passing
- Perspective rendering support

**Design Philosophy**:

- Framerate-independent timing
- Event-driven communication
- Composition over inheritance
- Type safety throughout
- Developer experience (hot reload, runtime debugging)

The game is positioned as a **game jam project**, balancing rapid development with maintainable architecture.
