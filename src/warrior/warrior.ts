import { Subject, takeUntil, tap } from "rxjs";
import { SpriteAnimation } from "../sprite-animation/sprite-animation";
import type { IBox2dObjectAdapter } from "../littlejsengine/box2d/box2d-object-adapter/box2d-object-adapter.types";

export class Warrior {
  private readonly _box2dObjectAdapter: IBox2dObjectAdapter;
  private readonly _spriteAnimation: SpriteAnimation;
  private readonly _destroyRef$ = new Subject<void>();

  constructor(
    box2dObjectAdapter: IBox2dObjectAdapter,
    spriteAnimation: SpriteAnimation,
  ) {
    this._box2dObjectAdapter = box2dObjectAdapter;
    this._box2dObjectAdapter.render$
      .pipe(
        takeUntil(this._destroyRef$),
        tap(() => this.render()),
      )
      .subscribe();

    this._spriteAnimation = spriteAnimation;
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

  render(): void {
    this._spriteAnimation.progress();
  }

  destroy(): void {
    this._destroyRef$.next();
  }
}
