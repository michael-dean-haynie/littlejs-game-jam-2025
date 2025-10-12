import { Subject, Subscription, takeUntil, tap } from "rxjs";
import type { IBox2dObjectAdapter } from "../littlejsengine/box2d/box2d-object-adapter/box2d-object-adapter.types";
import type { ISpriteAnimation } from "../sprite-animation/sprite-animation.types";
import { vec2 } from "../littlejsengine/littlejsengine.pure";
import type { Vector2 } from "../littlejsengine/littlejsengine.types";
import type { IWarriorMovementState } from "./state/movement/warrior-movement-state.types";
import { WarriorMovementStateStill } from "./state/movement/warrior-movement-state-still";
import type { IWarriorCommand } from "./commands/warrior-commands.types";
import { WarriorCommandFaceDirection } from "./commands/warrior-command-face-direction";
import { WarriorCommandFacePosition } from "./commands/warrior-command-face-position";

/**
 * NOTE: lots of public members so states can manipulate the Warrior (context)
 * michael: doc state as design pattern with link
 */
export class Warrior {
  private readonly _box2dObjectAdapter: IBox2dObjectAdapter;
  readonly idleAnimation: ISpriteAnimation;
  readonly runAnimation: ISpriteAnimation;
  readonly attack1Animation: ISpriteAnimation;
  readonly attack2Animation: ISpriteAnimation;

  private readonly _destroyRef$ = new Subject<void>();

  // commands
  private _commandBuffer: IWarriorCommand[] = [];

  // states and context
  movementState: IWarriorMovementState;

  private _moveDirection: Vector2 = vec2(0);
  public get moveDirection(): Vector2 {
    return this._moveDirection;
  }
  public set moveDirection(value: Vector2) {
    this._moveDirection = value;
  }

  private _faceDirection: Vector2 = vec2(1, 0);
  public get faceDirection(): Vector2 {
    return this._faceDirection;
  }
  public set faceDirection(direction: Vector2) {
    this._faceDirection = direction.normalize(1);

    // update mirror for sprite animation
    if (direction.x === 0) return;
    this._box2dObjectAdapter.mirror = direction.x < 0;
  }

  // private _faceDirection: Vector2 = vec2(1, 0);

  private _animation: ISpriteAnimation;
  private _animationFrameChangedSub?: Subscription;

  constructor(
    box2dObjectAdapter: IBox2dObjectAdapter,
    idleAnimation: ISpriteAnimation,
    runAnimation: ISpriteAnimation,
    attack1Animation: ISpriteAnimation,
    attack2Animation: ISpriteAnimation,
  ) {
    this._box2dObjectAdapter = box2dObjectAdapter;
    this.idleAnimation = idleAnimation;
    this.runAnimation = runAnimation;
    this.attack1Animation = attack1Animation;
    this.attack2Animation = attack2Animation;

    this._animation = this.idleAnimation;
    this.movementState = new WarriorMovementStateStill(this);

    // michael: remove
    // (window as any).warrior = this;

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
    this._processCommands();
    this._applyMovementForces();
  }

  render(): void {
    this._animation.progress();
  }

  switchAnimation(newAnimation: ISpriteAnimation): void {
    this._animationFrameChangedSub?.unsubscribe();

    this._animation = newAnimation;
    this._animation.restart();
    this._animationFrameChangedSub = this._animation.frameChanged$
      .pipe(
        takeUntil(this.idleAnimation.stopped$),
        tap((frameChangedData) => {
          this._box2dObjectAdapter.tileInfo = frameChangedData.frame.tileInfo;
        }),
      )
      .subscribe();
  }

  enqueueCommand(command: IWarriorCommand): void {
    this._commandBuffer.push(command);
  }

  destroy(): void {
    this._destroyRef$.next();
  }

  /*
   * ===================================================================================
   * Input Processing
   * ===================================================================================
   */

  private _processCommands(): void {
    while (this._commandBuffer.length > 0) {
      const command = this._commandBuffer.shift()!;

      // run through each ofthe states first
      this.movementState.processCommand(command);

      // now handle things that aren't state-dependent
      if (command instanceof WarriorCommandFaceDirection) {
        this.faceDirection = command.direction;
      }
      if (command instanceof WarriorCommandFacePosition) {
        this.faceDirection = command.position.subtract(
          this._box2dObjectAdapter.getCenterOfMass(),
        );
      }
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

  // michael: TODO: credit https://pixelfrog-assets.itch.io/tiny-swords
}
