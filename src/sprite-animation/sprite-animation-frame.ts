import type { TileInfo } from "littlejsengine";

export type SpriteAnimationFrame = Readonly<{
  tileInfo: TileInfo;
  /** duration in engine frames */
  duration: number;
}>;
