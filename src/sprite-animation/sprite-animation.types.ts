import type { Observable } from "rxjs";
import type { SpriteAnimationFrame } from "./sprite-animation-frame";

/** Information about the newest frame */
export type FrameChangedData = {
  frame: SpriteAnimationFrame;
  frameIndex: number;
};

export interface ISpriteAnimation {
  restart(): void;
  progress(): void;

  frameChanged$: Observable<FrameChangedData>;
}
