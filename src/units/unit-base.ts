import { Subject, Subscription, takeUntil, tap } from "rxjs";
import { noCap } from "../core/util/no-cap";
import type { IBox2dObjectAdapter } from "../littlejsengine/box2d/box2d-object-adapter/box2d-object-adapter.types";
import type { IUnit, UnitType } from "./unit.types";
import { type Vector2 } from "../littlejsengine/littlejsengine.types";
import { vec2 } from "../littlejsengine/littlejsengine.pure";
import type { ISpriteAnimation } from "../sprite-animation/sprite-animation.types";
import type { IUnitState, UnitState } from "./states/states.types";
import type { Message } from "../messages/messages.types";
import type { Ability, IAbility } from "../abilities/abilities.types";
import type { ITerrainThing } from "../terrain/terrain-thing.types";
import { unitTypeStatsMap, type UnitStats } from "./unit-type-stats-map";

export abstract class UnitBase implements IUnit {
  abstract readonly type: UnitType;

  private _box2dObjectAdapterRenderSub$: Subscription;
  private _box2dObjectAdapterUpdateSub$: Subscription;
  readonly box2dObjectAdapter: IBox2dObjectAdapter;

  private readonly _terrainThing: ITerrainThing;

  constructor(
    box2dObjectAapter: IBox2dObjectAdapter,
    terrainThing: ITerrainThing,
  ) {
    this._terrainThing = terrainThing;

    // wire up to box2dObjectAdapter
    this.box2dObjectAdapter = box2dObjectAapter;
    this._box2dObjectAdapterRenderSub$ = this.box2dObjectAdapter.render$
      .pipe(
        takeUntil(this._destroyRef$),
        tap(() => {
          this._animation?.progress(this._faceDirection);
        }),
      )
      .subscribe();
    this._box2dObjectAdapterUpdateSub$ = this.box2dObjectAdapter.update$
      .pipe(
        takeUntil(this._destroyRef$),
        tap(() => {
          this._update();
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

  // abilities
  readonly abilityMap: Map<Ability, IAbility> = new Map();

  // animation
  private readonly _animationMap: Map<UnitState | Ability, ISpriteAnimation> =
    new Map();
  protected _registerAnimation(
    stateOrAbility: UnitState | Ability,
    animation: ISpriteAnimation,
  ): void {
    this._animationMap.set(stateOrAbility, animation);
  }

  protected _animation?: ISpriteAnimation;
  protected _animationFrameChangedSub?: Subscription;
  swapAnimation(stateOrAbility: UnitState | Ability): void {
    this._animationFrameChangedSub?.unsubscribe();

    const newAnimation = this._animationMap.get(stateOrAbility);
    noCap(newAnimation !== undefined, "Could not find animation to swap to.");

    this._animation = newAnimation;
    this._animationFrameChangedSub = this._animation.frameChanged$
      .pipe(
        takeUntil(this._destroyRef$),
        tap((frameChangedData) => {
          this.box2dObjectAdapter.tileInfo = frameChangedData.tileInfo;
        }),
      )
      .subscribe();
    this._animation.restart();
  }

  // state machine
  protected readonly _stateMap: Map<UnitState, IUnitState> = new Map();
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
    this._faceDirection =
      direction.length() === 0 ? direction : direction.normalize(1);

    // update mirror for sprite animation
    if (direction.x === 0) return;
    this.box2dObjectAdapter.mirror = direction.x < 0;
  }
  get stats(): UnitStats {
    return unitTypeStatsMap[this.type];
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

  private _update(): void {
    this.box2dObjectAdapter.terrainDrawHeight =
      this._terrainThing.getTerrainDrawHeight(
        this.box2dObjectAdapter.getCenterOfMass(),
      );

    this._processMessages();
    this._getStateObj().onUpdate();
  }
}
