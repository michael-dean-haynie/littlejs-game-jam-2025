import type { TileInfo } from "littlejsengine";

export type AnimationFrame = Readonly<{
  tileInfo: TileInfo;
  /** duration in engine frames */
  duration: number;
}>;
