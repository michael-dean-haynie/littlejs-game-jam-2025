import type { TileInfo } from "../littlejsengine/littlejsengine.types";

/** An individual frame in an animation sequence */
export type SpriteAnimationFrame = Readonly<{
  tileInfo: TileInfo;

  /** The duration of this animation frame in seconds */
  duration: number;
}>;
