import { Subject } from "rxjs";
import { noCap } from "../core/util/no-cap";
import type { SpriteAnimationFrame } from "./sprite-animation-frame";
import type {
  FrameChangedData,
  ISpriteAnimation,
} from "./sprite-animation.types";
import type { ILJS } from "../littlejsengine/littlejsengine.impure";

/** A sprite animation that progresses and tracks its own state */
export class SpriteAnimation implements ISpriteAnimation {
  private readonly _frames: ReadonlyArray<SpriteAnimationFrame>;
  private readonly _ljs: ILJS;

  /** The index of the current animation frame */
  private _currentFrameIndex: number | null = null;

  /** Then engine time (in seconds) at which this animation started */
  private _startTime: number | null = null;

  /** The duration of each frame summed together in seconds */
  private readonly _fullDuration: number;

  /** The offest start of each animation frame */
  private readonly _offsets: number[];

  private _frameChanged$ = new Subject<FrameChangedData>();
  public frameChanged$ = this._frameChanged$.asObservable();

  private _stopped$ = new Subject<void>();
  public stopped$ = this._stopped$.asObservable();

  constructor(frames: ReadonlyArray<SpriteAnimationFrame>, ljs: ILJS) {
    this._frames = frames;
    this._ljs = ljs;

    this._fullDuration = 0;
    this._offsets = [];
    for (const frame of this._frames) {
      this._offsets.push(this._fullDuration);
      this._fullDuration += frame.duration;
    }
  }

  /** Starts or restarts the animation from the begining */
  restart(): void {
    this._currentFrameIndex = 0;
    this._startTime = this._ljs.time;
  }

  /** Stops the animation */
  stop(): void {
    this._currentFrameIndex = null;
    this._startTime = null;
    this._stopped$.next();
  }

  /** Updates the current frame based on engine time */
  progress() {
    noCap.notNull(this._currentFrameIndex);
    noCap.notNull(this._startTime);

    const engineTimeNow = this._ljs.time;
    const delta = (engineTimeNow - this._startTime) % this._fullDuration;

    const startingFrameIndex = this._currentFrameIndex;
    for (let idx = 0; idx < this._frames.length; idx++) {
      const frame = this._frames[idx];
      const offset = this._offsets[idx];
      const lower = offset;
      const upper = offset + frame.duration;
      if (lower <= delta && delta < upper) {
        this._currentFrameIndex = idx;
        break;
      }
    }

    if (startingFrameIndex !== this._currentFrameIndex) {
      this._frameChanged$.next({
        frame: this._frames[this._currentFrameIndex],
        frameIndex: this._currentFrameIndex,
      });
    }
  }
}
