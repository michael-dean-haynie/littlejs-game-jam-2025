/// <reference types="vitest" />

import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
import zipPack from "vite-plugin-zip-pack";
import checker from "vite-plugin-checker";

export default defineConfig({
  // make index.html use relative base path for asset urls
  // so they resolve properly when embedded inside itch.io's webpage
  base: "./",
  plugins: [
    checker({
      typescript: true, // Enable TypeScript checking
    }),
    // include boxd2 assets from node_modules
    viteStaticCopy({
      targets: [
        {
          src: "node_modules/littlejsengine/plugins/box2d.*",
          dest: "box2d",
        },
      ],
    }),
    // automatically zip the /dist folder after build for easy upload to itch.io
    zipPack(),
  ],
  // configure vitest for browser-like env (so littlejsengine can reference 'window')
  test: {
    printConsoleTrace: true,
    reporters: ["verbose"],
    environment: "jsdom",
    setupFiles: [
      // stub out AudioContext (not provided by jsdom)
      "src/test/audio-context.stub.ts",
      // autoload test double files
      "src/core/autoload/autoload-test.ts",
    ],
  },
});
