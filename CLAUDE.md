# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Development

- `npm run dev` - Run local development server with hot reload (no type checking)
- `npm run build` - Type-check with tsc, then generate optimized production bundle and zip for itch.io upload
- `npm run preview` - Serve built production bundle locally

### Testing

- `npm test` - Run tests with coverage, watch for changes
- `npm run test:ci` - Run tests with coverage once (for CI)

### Code Quality

- `npm run format:check` - Check for formatting issues
- `npm run format:write` - Auto-format all files
- `npm run lint` - Check for lint issues
- `npm run lint:fix` - Auto-fix lint issues
- `npm run check` - Run all checks (format, lint, test, build) - use before committing

## Architecture

### Game Engine Stack

This is a LittleJS game engine project with Box2D physics. The game entry point is `src/main.ts`, which initializes the IoC container and starts the game.

### Inversify IoC Container with Autoloading

The project uses Inversify for dependency injection with a custom autoloading system:

- **Autoloading convention**: Files ending in `.al.ts` are automatically loaded and bound to the IoC container
- **`@Autoloadable()` decorator**: Declaratively configures dependencies. Example:
  ```typescript
  @Autoloadable({
    serviceIdentifier: GAME_TOKEN,
    executionContext: "app", // optional, defaults to "app"
  })
  export class Game implements IGame { ... }
  ```
- **Execution contexts**:
  - `"app"` - Production/development dependencies (autoloaded from `*.al.ts` files)
  - `"test"` - Test double dependencies (autoloaded from `*.dummy.ts`, `*.stub.ts`, `*.mock.ts`, etc.)
- **Container initialization**: See `src/init-ioc-container.ts` for how the container is built from autoloaded registrations

### Test Doubles

Test doubles follow this file naming convention and are autoloaded during test execution:

- `*.dummy.ts`, `*.stub.ts`, `*.mock.ts`, `*.double.ts`, `*.spy.ts`, `*.fake.ts`

### TypeScript Configuration

- Uses experimental decorators (`experimentalDecorators: true`) for Inversify
- `emitDecoratorMetadata: true` enables runtime metadata for dependency injection
- Strict mode enabled with additional linting rules

### Vite Configuration

- **vite-plugin-static-copy**: Copies Box2D plugin assets from node_modules to dist
- **vite-plugin-zip-pack**: Automatically creates a zip of the dist folder for itch.io upload
- **Vitest with jsdom**: Provides browser APIs for testing (configured in `vite.config.ts`)
- **Test setup files**: AudioContext stub (`src/test/audio-context.stub.ts`) and test doubles autoloader

### Code Conventions

- Use `type` for data shapes, `interface` for behavioral contracts
- All IoC-managed dependencies should use the `@Autoloadable()` decorator
- Service identifiers are typically defined in `*.contracts.ts` files as symbols

## Important Notes

### Temporary Local Dependency

The `package.json` uses a local file reference for `littlejsengine` (`file:../LittleJS`) as a temporary workaround for an unreleased fix. See: https://github.com/KilledByAPixel/LittleJS/issues/153

### External References

- [LittleJS Documentation](https://github.com/KilledByAPixel/LittleJS)
- [Box2D Documentation](https://box2d.org/documentation/index.html)
- [Inversify Getting Started](https://inversify.io/docs/introduction/getting-started/)
