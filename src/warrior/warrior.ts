import { Subject, takeUntil, tap } from "rxjs";
import type { IBox2dObjectAdapter } from "../littlejsengine/box2d/box2d-object-adapter/box2d-object-adapter.types";
import type { ISpriteAnimation } from "../sprite-animation/sprite-animation.types";
import type { IInputManager as IInputManager } from "../input/input-manager/input-manager.types";
import { Move } from "../input/game-inputs/move";
import { vec2 } from "../littlejsengine/littlejsengine.pure";
import type { Vector2 } from "../littlejsengine/littlejsengine.types";

export class Warrior {
  private readonly _box2dObjectAdapter: IBox2dObjectAdapter;
  private readonly _spriteAnimation: ISpriteAnimation;
  private readonly _inputManager: IInputManager;
  private readonly _destroyRef$ = new Subject<void>();

  // state
  private _moveDirection: Vector2 = vec2(0);

  constructor(
    box2dObjectAdapter: IBox2dObjectAdapter,
    spriteAnimation: ISpriteAnimation,
    inputManager: IInputManager,
  ) {
    this._box2dObjectAdapter = box2dObjectAdapter;
    this._spriteAnimation = spriteAnimation;
    this._inputManager = inputManager;

    // michael: remove
    window.warrior = this;

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
    this._applyMovementForces();
  }

  render(): void {
    this._spriteAnimation.progress();
  }

  destroy(): void {
    this._destroyRef$.next();
  }

  /**
   * ===================================================================================
   * Input Processing
   * ===================================================================================
   */

  private _processInputs(): void {
    for (const input of this._inputManager.buffer) {
      if (input instanceof Move) {
        // michael pu@ fix tests, use acceleration, change state, have it auto target desired acceleration over time
        // this._box2dObjectAdapter.applyForce(input.direction.scale(1000));

        this._moveDirection = input.direction;
        // this._box2dObjectAdapter.
      }
    }
  }

  /**
   * ===================================================================================
   * Movement
   * ===================================================================================
   */

  private _applyMovementForces(): void {
    const speedMlt = 10;
    this._box2dObjectAdapter.setLinearVelocity(
      this._moveDirection.scale(speedMlt),
    );
  }
}
