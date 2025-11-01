import type { Texture } from "../textures.types";
import { unitSpriteSheets } from "./units/unit.types";

/** Data for animating a sprite with sequential frames from a texture */
export type SpriteSheet = {
  /** A unique id for a particular sprite-sheet animation */
  id: string;
  /** The texture (image) with the raw raster data */
  texture: Texture;
  /** The number of animation frames in the texture */
  frames: number;
  /** The length/width of a single frame from the texture in pixels */
  frameSize: number;
  /** The game-time-duration that each frame should last (in seconds) */
  frameDuration?: number;
  /** The indexes of any frames to be omitted */
  omitFrames?: number[];
};

export const spriteSheets = [
  ...unitSpriteSheets,
] as const satisfies SpriteSheet[];

export type SpriteSheetId = (typeof spriteSheets)[number]["id"];
