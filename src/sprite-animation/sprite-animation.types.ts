import type { Observable } from "rxjs";
import type { TileInfo, Vector2 } from "../littlejsengine/littlejsengine.types";
import type { PWD } from "../core/types/directions.types";
import { enumerationFactory } from "../core/enumeration-factory";
import type { SpriteSheet } from "../textures/sprite-sheets/sprite-sheet.types";

/** Information about the newest frame */
export type FrameChangedData = {
  tileInfo: TileInfo;
  frameIndex: number;
};

export interface ISpriteAnimation {
  restart(): void;
  progress(faceDirection?: Vector2): void;

  frameChanged$: Observable<FrameChangedData>;
  stopped$: Observable<void>;
}

const animationDirections = [
  "n",
  "ne",
  "e",
  "se",
  "s",
] as const satisfies PWD[];
export const AnimationDirections = enumerationFactory(...animationDirections);
export type AnimationDirection = ReturnType<
  typeof AnimationDirections.values
>[number];

export type DirSpriteSheetMap = {
  [K in AnimationDirection]: SpriteSheet;
};
