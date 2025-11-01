import { textures, type Texture } from "./textures.types";

export const textureIndexMap = Object.fromEntries(
  textures.map((texture, index) => [texture, index]),
) as { [K in Texture]: number };
