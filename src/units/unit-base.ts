import { Subject, Subscription, takeUntil, tap } from "rxjs";
import { noCap } from "../core/util/no-cap";
import type { IBox2dObjectAdapter } from "../littlejsengine/box2d/box2d-object-adapter/box2d-object-adapter.types";
import type { IUnit } from "./unit.types";
import { type Vector2 } from "../littlejsengine/littlejsengine.types";
import { vec2 } from "../littlejsengine/littlejsengine.pure";
import type { ISpriteAnimation } from "../sprite-animation/sprite-animation.types";
import type { IUnitState, UnitState } from "./states/states.types";
import type { Message } from "../messages/messages.types";

/**
 * NOTE: lots of public members so states can manipulate the Warrior (context)
 * michael: doc state as design pattern with link
 */
export abstract class UnitBase implements IUnit {
  private _box2dObjectAdapterRenderSub$: Subscription;
  private _box2dObjectAdapterUpdateSub$: Subscription;
  readonly box2dObjectAdapter: IBox2dObjectAdapter;

  constructor(box2dObjectAapter: IBox2dObjectAdapter) {
    this.box2dObjectAdapter = box2dObjectAapter;
    this._box2dObjectAdapterRenderSub$ = this.box2dObjectAdapter.render$
      .pipe(
        takeUntil(this._destroyRef$),
        tap(() => {
          this._animation?.progress();
        }),
      )
      .subscribe();
    this._box2dObjectAdapterUpdateSub$ = this.box2dObjectAdapter.update$
      .pipe(
        takeUntil(this._destroyRef$),
        tap(() => {
          this._processMessages();
        }),
      )
      .subscribe();
  }

  // destroy
  protected readonly _destroyRef$ = new Subject<void>();
  destroy(): void {
    this._box2dObjectAdapterRenderSub$.unsubscribe();
    this._box2dObjectAdapterUpdateSub$.unsubscribe();
    this.box2dObjectAdapter.destroy();
    this._destroyRef$.next();
  }

  // animation
  protected _animation?: ISpriteAnimation;
  protected _animationFrameChangedSub?: Subscription;
  swapAnimation(newAnimation: ISpriteAnimation): void {
    this._animationFrameChangedSub?.unsubscribe();

    this._animation = newAnimation;
    this._animation.restart();
    this._animationFrameChangedSub = this._animation.frameChanged$
      .pipe(
        takeUntil(this._destroyRef$),
        tap((frameChangedData) => {
          this.box2dObjectAdapter.tileInfo = frameChangedData.frame.tileInfo;
        }),
      )
      .subscribe();
  }

  // state machine
  protected abstract _stateMap: Map<UnitState, IUnitState>;
  private _stateStack: UnitState[] = [];
  private get _state(): UnitState {
    const peeked = this._stateStack.at(-1);
    noCap(peeked !== undefined);
    return peeked;
  }
  private _getStateObj(state: UnitState = this._state): IUnitState {
    const stateObj = this._stateMap.get(state);
    noCap(stateObj !== undefined);
    return stateObj;
  }

  protected _initState(state: UnitState): void {
    this._stateStack.push(state);
    this._getStateObj().onEnter();
  }
  pushState(state: UnitState): void {
    this._getStateObj().onExit();
    this._stateStack.push(state);
    this._getStateObj().onEnter();
  }
  popState(): void {
    noCap(this._stateStack.length > 1);
    this._getStateObj().onExit();
    this._stateStack.pop();
    this._getStateObj().onEnter();
  }

  // other state values
  protected _moveDirection: Vector2 = vec2(0);
  public get moveDirection(): Vector2 {
    return this._moveDirection;
  }
  public set moveDirection(value: Vector2) {
    this._moveDirection = value;
  }

  protected _faceDirection: Vector2 = vec2(1, 0);
  public get faceDirection(): Vector2 {
    return this._faceDirection;
  }
  public set faceDirection(direction: Vector2) {
    this._faceDirection = direction.normalize(1);

    // update mirror for sprite animation
    if (direction.x === 0) return;
    this.box2dObjectAdapter.mirror = direction.x < 0;
  }
  protected _moveSpeed: number = 0;
  public get moveSpeed(): number {
    return this._moveSpeed;
  }

  // messages
  protected readonly _messageBuffer: Message[] = [];
  enqueueMessage(message: Message): void {
    this._messageBuffer.push(message);
  }

  private _processMessages(): void {
    const skippedMessages: Message[] = [];

    while (this._messageBuffer.length > 0) {
      const message = this._messageBuffer.shift()!;
      const postProcessAction = this._getStateObj().processMessage(message);
      switch (postProcessAction) {
        case "skip":
          skippedMessages.push(message);
          break;
        case "requeue":
          this._messageBuffer.unshift(message);
          break;
        case "none":
          break;
      }
    }

    this._messageBuffer.push(...skippedMessages);
  }
}
