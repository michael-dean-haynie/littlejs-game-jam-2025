import { Subject, takeUntil, tap } from "rxjs";
import type { IBox2dObjectAdapter } from "../littlejsengine/box2d/box2d-object-adapter/box2d-object-adapter.types";
import type { ISpriteAnimation } from "../sprite-animation/sprite-animation.types";
import type { IInputManager as IInputManager } from "../input/input-manager.types";

export class Warrior {
  private readonly _box2dObjectAdapter: IBox2dObjectAdapter;
  private readonly _spriteAnimation: ISpriteAnimation;
  private readonly _inputManager: IInputManager;
  private readonly _destroyRef$ = new Subject<void>();

  constructor(
    box2dObjectAdapter: IBox2dObjectAdapter,
    spriteAnimation: ISpriteAnimation,
    inputManager: IInputManager,
  ) {
    this._box2dObjectAdapter = box2dObjectAdapter;
    this._spriteAnimation = spriteAnimation;
    this._inputManager = inputManager;

    // michael: wrap these pipes up neater or something
    this._box2dObjectAdapter.render$
      .pipe(
        takeUntil(this._destroyRef$),
        tap(() => this.render()),
      )
      .subscribe();

    this._box2dObjectAdapter.update$
      .pipe(
        takeUntil(this._destroyRef$),
        tap(() => this.update()),
      )
      .subscribe();

    this._spriteAnimation.restart();
    this._spriteAnimation.frameChanged$
      .pipe(
        takeUntil(this._spriteAnimation.stopped$),
        tap((frameChangedData) => {
          this._box2dObjectAdapter.tileInfo = frameChangedData.frame.tileInfo;
        }),
      )
      .subscribe();
  }

  update(): void {
    this._processInputs();
  }

  render(): void {
    this._spriteAnimation.progress();
  }

  destroy(): void {
    this._destroyRef$.next();
  }

  private _processInputs(): void {
    for (const input of this._inputManager.buffer) {
      console.log(input);
    }
  }
}
