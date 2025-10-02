import type { Engine } from "../engine/engine.al";
import type { IEngine } from "../engine/engine.contracts";
import type { SpriteAnimationFrame } from "./sprite-animation-frame";

/** handles the logic of animating sprites */
export class SpriteAnimation {
  /** animation frames */
  private readonly _frames: ReadonlyArray<SpriteAnimationFrame>;
  private readonly _engine: IEngine;

  /** the index of the current animation frame */
  private _currentFrame = 0;

  /** the engine frame at which `_currentFrame` was first rendered */
  private _engineFrame: number | null = null;

  constructor(frames: ReadonlyArray<SpriteAnimationFrame>, engine: Engine) {
    this._frames = frames;
    this._engine = engine;
  }

  get currentFrame(): SpriteAnimationFrame {
    return this._frames[this._currentFrame];
  }

  /** return true if the next animation frame should be rendered */
  update(): boolean {
    const newFrame = this._engine.frame;
    const delta = newFrame - (this._engineFrame ?? 0);

    if (delta > this._frames[this._currentFrame].duration) {
      this._engineFrame = newFrame;
      this._currentFrame = ++this._currentFrame % this._frames.length;
      return true;
    }

    return false;
  }
}
