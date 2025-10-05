import { of, type Observable } from "rxjs";
import type {
  FrameChangedData,
  ISpriteAnimation,
} from "./sprite-animation.types";

export class SpriteAnimationMock implements ISpriteAnimation {
  restart(): void {}
  progress(): void {}
  frameChanged$: Observable<FrameChangedData> = of();
  stopped$: Observable<void> = of();
}
