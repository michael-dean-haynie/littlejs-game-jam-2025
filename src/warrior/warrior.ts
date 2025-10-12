import { Subject, Subscription, takeUntil, tap } from "rxjs";
import type { IBox2dObjectAdapter } from "../littlejsengine/box2d/box2d-object-adapter/box2d-object-adapter.types";
import type { ISpriteAnimation } from "../sprite-animation/sprite-animation.types";
import type { IInputManager as IInputManager } from "../input/input-manager/input-manager.types";
import { vec2 } from "../littlejsengine/littlejsengine.pure";
import type { Vector2 } from "../littlejsengine/littlejsengine.types";
import type { IWarriorMovementState } from "./state/movement/warrior-movement-state.types";
import { WarriorMovementStateIdle } from "./state/movement/warrior-movement-state-idle";

/**
 * NOTE: lots of public members so states can manipulate the Warrior (context)
 * michael: doc state as design pattern with link
 */
export class Warrior {
  private readonly _box2dObjectAdapter: IBox2dObjectAdapter;
  private readonly _inputManager: IInputManager;
  readonly idleAnimation: ISpriteAnimation;
  readonly runAnimation: ISpriteAnimation;

  private readonly _destroyRef$ = new Subject<void>();

  // states and context
  movementState: IWarriorMovementState;

  private _moveDirection: Vector2 = vec2(0);
  public get moveDirection(): Vector2 {
    return this._moveDirection;
  }
  public set moveDirection(value: Vector2) {
    this._moveDirection = value;

    // update mirror for sprite animation
    if (value.x === 0) return;
    this._box2dObjectAdapter.mirror = value.x < 0;
  }

  private _animation: ISpriteAnimation;
  private _animationFramChangedSub?: Subscription;

  constructor(
    box2dObjectAdapter: IBox2dObjectAdapter,
    inputManager: IInputManager,
    idleAnimation: ISpriteAnimation,
    runAnimation: ISpriteAnimation,
  ) {
    this._box2dObjectAdapter = box2dObjectAdapter;
    this._inputManager = inputManager;
    this.idleAnimation = idleAnimation;
    this.runAnimation = runAnimation;

    this._animation = this.idleAnimation;
    this.movementState = new WarriorMovementStateIdle(this);

    // michael: remove
    // window.warrior = this;

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
  }

  update(): void {
    this._processGameInputCommands();
    this._applyMovementForces();
  }

  render(): void {
    this._animation.progress();
  }

  switchAnimation(newAnimation: ISpriteAnimation): void {
    this._animationFramChangedSub?.unsubscribe();

    this._animation = newAnimation;
    this._animation.restart();
    this._animationFramChangedSub = this._animation.frameChanged$
      .pipe(
        takeUntil(this.idleAnimation.stopped$),
        tap((frameChangedData) => {
          this._box2dObjectAdapter.tileInfo = frameChangedData.frame.tileInfo;
        }),
      )
      .subscribe();
  }

  destroy(): void {
    this._destroyRef$.next();
  }

  /*
   * ===================================================================================
   * Input Processing
   * ===================================================================================
   */

  private _processGameInputCommands(): void {
    for (const command of this._inputManager.buffer) {
      this.movementState.processGameInputCommand(command);
    }
  }

  /*
   * ===================================================================================
   * Movement
   * ===================================================================================
   */

  private _applyMovementForces(): void {
    const speedMlt = 10;
    this._box2dObjectAdapter.setLinearVelocity(
      this.moveDirection.scale(speedMlt),
    );
  }
}
