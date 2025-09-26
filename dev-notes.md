# dev notes

## External Tools

- https://www.pixilart.com/

## technology decisions

### vite

- handles tsc/esbuild, dev server with hot reload, production builds, etc.

#### vite-plugin-zip-pack

- itch website expects a .zip with an index.html inside, this handles that

#### vite-plugin-static-copy

- littlejs's box2d plugin is included via script url in the index.html. this copies the assets from node_modules for dev server and production build

### vitest

- vitest is a test runner that seamlessly integrates with vite

### prettier

- prettier prevents any formatting bikeshedding

### eslint

- eslint helps catch common code quality issues

#### eslint-config-prettier

- eslint CAN do formatting stuff, but this extension disables those rules so that it doesn't collide with prettier

## todos

1. the package.json is temporarily using a file reference to a local copy of the littlejsengine repo. This is because there's a fix not yet released on npm. https://github.com/KilledByAPixel/LittleJS/issues/153
