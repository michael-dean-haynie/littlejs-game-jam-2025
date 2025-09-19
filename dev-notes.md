# dev notes

## technology decisions

### vite

handles tsc/esbuild, dev server with hot reload, production builds, etc.

#### vite-plugin-zip-pack

itch website expects a .zip with an index.html inside, this handles that

## todos

1. the package.json is temporarily using a file reference to a local copy of the littlejsengine repo. This is because there's a fix not yet released on npm. https://github.com/KilledByAPixel/LittleJS/issues/153
