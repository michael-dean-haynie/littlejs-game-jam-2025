import { Subject } from "rxjs";
import { noCap } from "../core/util/no-cap";
import type { SpriteAnimationFrame } from "./sprite-animation-frame";
import type {
  AnimationDirection,
  DirToFramesMap,
  FrameChangedData,
  ISpriteAnimation,
} from "./sprite-animation.types";
import type { ILJS } from "../littlejsengine/littlejsengine.impure";
import type { Vector2 } from "../littlejsengine/littlejsengine.types";

/** A sprite animation that progresses and tracks its own state */
export class SpriteAnimation implements ISpriteAnimation {
  private _frames: ReadonlyArray<SpriteAnimationFrame>;
  private _direction: AnimationDirection;
  private readonly _dirToFramesMap: DirToFramesMap;
  private readonly _ljs: ILJS;

  /** The index of the current animation frame */
  private _currentFrameIndex: number | null = null;

  /** Then engine time (in seconds) at which this animation started */
  private _startTime: number | null = null;

  /** The duration of every frame summed together in seconds */
  private readonly _fullDuration: number;

  /** The offest start of each animation frame */
  private readonly _offsets: number[];

  private _frameChanged$ = new Subject<FrameChangedData>();
  public frameChanged$ = this._frameChanged$.asObservable();

  private _stopped$ = new Subject<void>();
  public stopped$ = this._stopped$.asObservable();

  constructor(dirToFramesMap: DirToFramesMap, ljs: ILJS) {
    this._dirToFramesMap = dirToFramesMap;
    this._ljs = ljs;

    // assumption: each texture has the same duration and number of frames
    this._direction = "e";
    this._frames = this._dirToFramesMap.e;
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
    this._emitFrameChanged();
  }

  /** Stops the animation */
  stop(): void {
    this._currentFrameIndex = null;
    this._startTime = null;
    this._stopped$.next();
  }

  /** Updates the current frame based on engine time */
  progress(faceDirection?: Vector2) {
    noCap.notNull(this._currentFrameIndex);
    noCap.notNull(this._startTime);

    // update
    const startingDirection = this._direction;
    this._updateActiveFramesForDirection(faceDirection);

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

    if (
      startingFrameIndex !== this._currentFrameIndex ||
      startingDirection !== this._direction
    ) {
      this._emitFrameChanged();
    }
  }

  private _updateActiveFramesForDirection(faceDirection?: Vector2): void {
    if (faceDirection === undefined) {
      this._frames = this._dirToFramesMap.e;
      return;
    }

    const directions: AnimationDirection[] = ["n", "ne", "e", "se", "s"];
    /** Percentage of 180 degrees (or PI radians) */
    const semiPct = Math.abs(faceDirection.angle()) / Math.PI;
    /** Number directions unique animations in full circle */
    const dirCount = 8;
    // map angles for (top, topRight, right, bottomRight, bottom) to (0, 1, 2, 3, 4)
    const idx = Math.round((semiPct * dirCount) / 2);

    this._direction = directions[idx];
    this._frames = this._dirToFramesMap[this._direction];
  }

  private _emitFrameChanged(): void {
    noCap.notNull(this._currentFrameIndex);
    this._frameChanged$.next({
      frame: this._frames[this._currentFrameIndex],
      frameIndex: this._currentFrameIndex,
    });
  }
}
