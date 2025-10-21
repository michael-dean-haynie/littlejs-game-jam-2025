import type { Observable } from "rxjs";
import type { SpriteAnimationFrame } from "./sprite-animation-frame";
import type { Vector2 } from "../littlejsengine/littlejsengine.types";
import type { PWD } from "../core/types/directions.types";
import type { TextureId } from "../textures/textures.types";

/** Information about the newest frame */
export type FrameChangedData = {
  frame: SpriteAnimationFrame;
  frameIndex: number;
};

export interface ISpriteAnimation {
  restart(): void;
  progress(faceDirection?: Vector2): void;

  frameChanged$: Observable<FrameChangedData>;
  stopped$: Observable<void>;
}

export type AnimationDirection = Extract<PWD, "n" | "ne" | "e" | "se" | "s">;

export type DirToTextureMap = {
  [K in AnimationDirection]: TextureId;
};

export type DirToFramesMap = {
  [K in AnimationDirection]: SpriteAnimationFrame[];
};
