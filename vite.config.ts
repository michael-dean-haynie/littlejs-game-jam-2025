import { defineConfig } from "vite";
import zipPack from "vite-plugin-zip-pack";

export default defineConfig({
  // make index.html use relative base path for asset urls
  // so they resolve properly when embedded inside itch.io's webpage
  base: "./",
  // automatically zip the /dist folder after build for easy upload to itch.io
  plugins: [zipPack()],
});
