import { terrainTileTextures } from "./terrain-textures.types";
import { unitAnimationTextures } from "./unit-textures.types";

export type Texture = {
  id: string;
  src: string;
};

export type AnimationTexture = Texture & {
  offset: number;
  frames: number;
  size: number;
};

export type TileTexture = Texture & {};

export const animationTextures = [...unitAnimationTextures] as const;
export type AnimationTextureId = (typeof animationTextures)[number]["id"];

export const tileTextures = [...terrainTileTextures] as const;
export type TileTextureId = (typeof tileTextures)[number]["id"];

export const textures = [...animationTextures, ...tileTextures] as const;
export type TextureId = (typeof textures)[number]["id"];
