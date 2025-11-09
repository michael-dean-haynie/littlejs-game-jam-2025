import { Subject, Subscription, takeUntil, tap } from "rxjs";
import { WorldObject } from "../world/world-object";
import type { Cell } from "../world/cell";
import { box2d, drawTile, vec2, Vector2, WHITE } from "littlejsengine";
import { mkTile } from "../textures/tile-sheets/mk-tile";
import type { IUnit, UnitType } from "./unit.types";
import { unitTypeStatsMap, type UnitStats } from "./unit-type-stats-map";
import type { Ability, IAbility } from "../abilities/abilities.types";
import type { IUnitState, UnitState } from "./states/states.types";
import type { ISpriteAnimation } from "../sprite-animation/sprite-animation.types";
import { noCap } from "../core/util/no-cap";
import type { Message } from "../messages/messages.types";
import { world } from "../world/world.al";

export class UnitObject extends WorldObject implements IUnit {
  readonly type: UnitType;

  /** The vertical offset to place a unit's sprite's "feet" in the physical b2d circle */
  public spriteOffset = 0;

  private _transparentCells: Cell[] = [];

  constructor(pos: Vector2, unitType: UnitType) {
    super(pos, box2d.bodyTypeDynamic);

    this.type = unitType;
    this.tileInfo = mkTile("empty");
    this.color = WHITE;

    // init body
    const {
      size: sizeScalar,
      drawSizeScale,
      spriteOffset: drawHeight3d,
    } = unitTypeStatsMap[unitType];
    const size = vec2(sizeScalar);

    // fit circle diameter to similar size of box around body
    this.addCircle(size.scale(0.75).length());
    // make the sprite tile fit to the physics body shape
    this.drawSize = size.scale(drawSizeScale);
    // make the sprite stand in its physical bd2 circle
    this.spriteOffset = size.y / 2 + drawHeight3d * size.y;

    this.setFixedRotation(true);
  }

  protected readonly _destroyRef$ = new Subject<void>();
  override destroy(): void {
    this._destroyRef$.next();
    this._clearTransparentCells();
    super.destroy();
  }

  override update(): void {
    super.update();
    this.renderOrder += 0.1;
    const pos = this.getCenterOfMass();

    // transparent cells
    this._clearTransparentCells();
    const cell = world.getCell(pos);
    const standCells = [cell.getAdj("w"), cell, cell.getAdj("e")];
    for (const sCell of standCells) {
      if (sCell === cell || box2d.raycastAll(pos, sCell.pos).length === 0) {
        const oCell = sCell.getAdj("s");
        const isHigher = oCell.cliffHeight > sCell.cliffHeight;
        const isSame = oCell.cliffHeight === sCell.cliffHeight;
        if (isHigher || (isSame && oCell.isRamp() && !sCell.isRamp())) {
          oCell.transparent = true;
          this._transparentCells.push(oCell);
        }
      }
    }

    // messages/state
    this._processMessages();
    this._getStateObj().onUpdate();
  }

  override render(): void {
    // progress animation
    this._animation?.progress(this._faceDirection);

    // note: coppied from default impl - just updated the pos argument
    drawTile(
      this.getPerspectivePos(),
      this.drawSize || this.size,
      this.tileInfo,
      this.color,
      this.angle,
      this.mirror,
      this.additiveColor,
    );
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

  private _clearTransparentCells(): void {
    for (const cell of this._transparentCells) {
      cell.transparent = false;
    }
    this._transparentCells = [];
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
          this.tileInfo = frameChangedData.tileInfo;
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
    this.mirror = direction.x < 0;
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
}
