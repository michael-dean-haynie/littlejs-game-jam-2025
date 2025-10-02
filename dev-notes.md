# dev notes

## codebase conventions

### autoloading ioc dependencies

- files ending in `.al.ts` are auto loaded and bound to the inversify ioc container (see `autoload-app.ts`)
- test doubles are similarly auto loaded during text executions (see `autoload-test.ts`)
- the `@Autoloadable()` decorator declaratively configures dependencies

### `type` vs `interface`

- generally try to use `type` for data shapes and `interface` for behovioral contracts

## technology decisions

### vite

- handles tsc/esbuild, dev server with hot reload, production builds, etc.

#### vite-plugin-zip-pack

- itch website expects a .zip with an index.html inside, this handles that

#### vite-plugin-static-copy

- littlejs's box2d plugin is included via script url in the index.html. this copies the assets from node_modules for dev server and production build

#### vitest

- vitest is a test runner that seamlessly integrates with vite

##### jsdom

- provides browser apis so the littlejs engine can be present for unit test executions (for convenience)

### inversify

- provides ioc container which helps keep things losely coupled, testable, and declaratively composable

#### reflect-metadata

- dependency of inversify. enables the experimental flavor typescript decorators
- also, enables custom `@Autoloadable()` decorator

### prettier

- prettier prevents any formatting bikeshedding

### eslint

- eslint helps catch common code quality issues

#### eslint-config-prettier

- eslint CAN do formatting stuff, but this extension disables those rules so that it doesn't collide with prettier

#### @eslint/compat

- automatically imports .gitignore patterns into eslint's ignore configuration

## external tools

- https://www.pixilart.com/

## references

- [littlejs](https://github.com/KilledByAPixel/LittleJS)
- [box2d](https://box2d.org/documentation/index.html)
- [inversify](https://inversify.io/docs/introduction/getting-started/)
- [inversify (more details)](https://doc.inversify.cloud/en/)
- [test double terminology](https://medium.com/@matiasglessi/mock-stub-spy-and-other-test-doubles-a1869265ac47)

## todos

(no todos atm)
