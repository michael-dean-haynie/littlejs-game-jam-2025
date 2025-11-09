import { Subject } from "rxjs";
import { noCap } from "../core/util/no-cap";
import {
  AnimationDirections,
  type AnimationDirection,
  type DirSpriteSheetMap,
  type FrameChangedData,
  type ISpriteAnimation,
} from "./sprite-animation.types";
import type {
  SpriteSheet,
  SpriteSheetId,
} from "../textures/sprite-sheets/sprite-sheet.types";
import { textureIndexMap } from "../textures/texture-index-map";
import { range } from "lit/directives/range.js";
import { tile, time, type Vector2 } from "littlejsengine";
import { spriteSheetMap } from "../textures/sprite-sheets/sprite-sheet-map";

/** A sprite animation that progresses and tracks its own state */
export class SpriteAnimation implements ISpriteAnimation {
  private _spriteSheet: SpriteSheet;
  private _direction: AnimationDirection;
  private readonly _dirSpriteSheetMap: DirSpriteSheetMap;

  /** The animation frame duration in seconds */
  private readonly _frameDuration: number = 0.1;

  /** The index of the current animation frame */
  private _currentFrameIndex: number | null = null;

  /** Then engine time (in seconds) at which this animation started */
  private _startTime: number | null = null;

  /** The duration of every frame summed together in seconds */
  private readonly _fullDuration: number;

  /** Number of unique animations directions  in full circle */
  private readonly _dirCount = 8;

  private readonly _frames: number[] = [];

  private _frameChanged$ = new Subject<FrameChangedData>();
  public frameChanged$ = this._frameChanged$.asObservable();

  private _stopped$ = new Subject<void>();
  public stopped$ = this._stopped$.asObservable();

  constructor(spriteSheetData: SpriteSheetId | DirSpriteSheetMap) {
    if (typeof spriteSheetData === "string") {
      this._dirSpriteSheetMap = {
        n: spriteSheetMap[spriteSheetData],
        ne: spriteSheetMap[spriteSheetData],
        e: spriteSheetMap[spriteSheetData],
        se: spriteSheetMap[spriteSheetData],
        s: spriteSheetMap[spriteSheetData],
      };
    } else {
      this._dirSpriteSheetMap = spriteSheetData;
    }

    // assumption: each texture has the same duration and number of frames
    this._direction = "e";
    this._spriteSheet = this._dirSpriteSheetMap.e;
    if (this._spriteSheet.frameDuration) {
      this._frameDuration = this._spriteSheet.frameDuration;
    }
    this._frames = [...range(this._spriteSheet.frames)].filter(
      (frIdx) => !(this._spriteSheet.omitFrames ?? []).includes(frIdx),
    );
    this._fullDuration = this._frameDuration * this._frames.length;
  }

  /** Starts or restarts the animation from the begining */
  restart(): void {
    this._currentFrameIndex = 0;
    this._startTime = time;
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

    const engineTimeNow = time;
    const delta = (engineTimeNow - this._startTime) % this._fullDuration;
    const startingFrameIndex = this._currentFrameIndex;
    this._currentFrameIndex = Math.floor(delta / this._frameDuration);

    if (
      startingFrameIndex !== this._currentFrameIndex ||
      startingDirection !== this._direction
    ) {
      this._emitFrameChanged();
    }
  }

  private _updateActiveFramesForDirection(faceDirection?: Vector2): void {
    if (faceDirection === undefined) {
      this._spriteSheet = this._dirSpriteSheetMap.e;
      return;
    }

    /** Percentage of 180 degrees (or PI radians) */
    const semiPct = Math.abs(faceDirection.angle()) / Math.PI;

    // map angles for (top, topRight, right, bottomRight, bottom) to (0, 1, 2, 3, 4)
    const idx = Math.round((semiPct * this._dirCount) / 2);

    this._direction = AnimationDirections.values()[idx];
    this._spriteSheet = this._dirSpriteSheetMap[this._direction];
  }

  private _emitFrameChanged(): void {
    noCap.notNull(this._currentFrameIndex);
    this._frameChanged$.next({
      tileInfo: tile(
        this._frames[this._currentFrameIndex],
        this._spriteSheet.frameSize,
        textureIndexMap[this._spriteSheet.texture],
      ),
      frameIndex: this._currentFrameIndex,
    });
  }
}
