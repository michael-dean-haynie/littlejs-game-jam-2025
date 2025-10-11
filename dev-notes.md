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

## Misc Notes

- During `npm run build`, vite will produce the following warning, but it's fine to ignore since the script get's statically coppied.
  ```txt
  <script src="./box2d/box2d.wasm.js"> in "/index.html" can't be bundled without type="module" attribute
  ```

## todos

- figure out how to get vitest to notice compilation issues without running `tsc` before it in the npm scripts
