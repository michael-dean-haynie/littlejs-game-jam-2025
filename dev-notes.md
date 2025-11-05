# Dev Notes

## Codebase Conventions

### Architectural Boundaries

- We want to prevent littlejs global implmentations with impure side effects bleeding into the game logic.
- Only the files inside `src/littlejsengine/` can import from the lib directly.
- All other files can import the nessesary littlejs types from the "barrel" export files.
- They help to distinguish pure from impure members in a succinct, type-safe manner.
- There is an eslint rule set up to help enforce the convention.

### Autoloading IoC Dependencies

- Files ending in `.al.ts` are auto loaded and bound to the inversify ioc container (see `autoload-app.ts`)
- Test doubles are similarly auto loaded during text executions (see `autoload-test.ts`)
- The `@Autoloadable()` decorator declaratively configures dependencies

### Types and Naming Things

- Generally try to use `type` for data shapes and `interface` for behovioral contracts
- Previx private members with `_` for clarity of internal implementation details
- Suffix rxjs observables with `$` for clarity of async/steamed data (angular convention)

### Factories

Generally, factories are for instantiating types with normal parameters as well as IoC dependencies.

## Game Development Conventions

### Gameplay / Animation Durations

- Express durations in (gametime) seconds, NOT frames.
  - Seconds instead of milliseconds because that's what littlejsengine uses by default.
  - Time-base units provide better semantic clarity for both the code-base and the player.
  - This keeps game state decoupled from framerates for consistent experience across different machines.

## Technology Decisions

- `littlejsengine`: The LittleJS game engine
- `vite`: Handles tsc/esbuild, dev server with hot reload, production builds, etc.
  - `vite-plugin-checker`: displays typescript errors in browser overlay and console during development
  - `vite-plugin-zip-pack`: Iitch.io website expects a .zip with an index.html inside, this handles that
  - `vite-plugin-static-copy`: LittleJS's box2d plugin is included via script url in the index.html. This copies the assets from node_modules for dev server and production build
  - `vitest`: Test runner that seamlessly integrates with vite
    - `jsdom`: Provides browser apis so the littlejs engine can be present for unit test executions (for convenience)
    - `@vitest/coverage-v8`: Coverage reporting for vitest
    - `vitest-mock-extended`: for mocking interfaces - helpful especially with littlejsengine and box2d
- `inversify`: Provides ioc container which helps keep things losely coupled, testable, and declaratively composable
  - `reflect-metadata`: Dependency of inversify. enables the experimental flavor typescript decorators. Also, enables custom `@Autoloadable()` decorator
- `rxjs`: Provides convenient api for pub-sub / async patterns
- `prettier`: Prevents any formatting bikeshedding
- `eslint`: Helps catch common code quality issues
  - `eslint-config-prettier`: ESLint CAN do formatting stuff, but this extension disables those rules so that it doesn't collide with prettier
  - `@eslint/compat`: Automatically imports .gitignore patterns into eslint's ignore configuration
- `globals`: Global variable definitions for various environments

## External Tools

- https://www.pixilart.com/

## References

- [littlejs](https://github.com/KilledByAPixel/LittleJS)
- [box2d](https://box2d.org/documentation/index.html)
- [inversify](https://inversify.io/docs/introduction/getting-started/)
- [inversify (more details)](https://doc.inversify.cloud/en/)
- [test double terminology](https://medium.com/@matiasglessi/mock-stub-spy-and-other-test-doubles-a1869265ac47)
- https://gamedev.stackexchange.com/questions/166531/how-to-program-smooth-player-2d-movements
- https://gameprogrammingpatterns.com/state.html
- https://sc2mapster.fandom.com/wiki/Data/Actors
- https://refactoring.guru/design-patterns/state

## Misc Notes

- During `npm run build`, vite will produce the following warning, but it's fine to ignore since the script get's statically coppied.
  ```txt
  <script src="./box2d/box2d.wasm.js"> in "/index.html" can't be bundled without type="module" attribute
  ```

## todos

- units
  - make guard not interrupt attack but requeue so it doesn't get stuck toggled on
  - make attack able to interrupt guard and then go right back
  - formalize the world space to screen space conversion so mouse interactions facing unit work
    - maybe just account for unit's cliff height in relation to mouse
    - maybe when I lock camera to player with adjusted cliff height, this will go away?
  - make it so once you attack, the direction doesn't change mid-attack when mouse moves
- ui
  - re-work ioc and data flow for lit overlay
  - emit event to lit overlay with latest noiseMap data to visualize dot plot and clamping and such
- sprite animation optimization
  - maybe sprite animation frame is not needed (will animations ever NOT be at same duration? (100ms or whatever tinyswords does))
- terrain
  - improve top cliff corners, maybe it's the base I set, limit it to the bottom corners so top ones stay transparent
  - improve canvas layer building by only creating the different tileInfos once, not every loop
  - render as units walk, etc
  - use viewport culling
  - ramps
    - generate somehow
    - maybe create ones facing forward/backward
  - water/waves
  - collision
- pathing
- controls
  - make it so left/right clicks don't get stuck up/down by other click sequences
- doodads, trees, rocks, bushes
- architecture
  - figure out how to get vitest to notice compilation issues without running `tsc` before it in the npm scripts
  - come to terms with abandoning testing?
  - get rid of the enumeration factory nonsense

- combat
- enemy player?
- enemy units
- enemy unit ai
- path finding
- path finding debugging
- top down rendering toggle

## memory usage

- dev mode
  - no game engine start: 14 MB
  - 1 layer 1225 cells, 49 sectors: 40 MB
  - no world init, update, or unit spawning: 39 MB
    - no textures either: 38 MB
      - no box2d init either: 17 MB
