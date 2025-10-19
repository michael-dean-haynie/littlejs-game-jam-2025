import type { IBox2dObjectAdapter } from "../../littlejsengine/box2d/box2d-object-adapter/box2d-object-adapter.types";
import type { ISpriteAnimation } from "../../sprite-animation/sprite-animation.types";
import type { IUnitState, UnitState } from "../states/states.types";
import { UnitStateIdling } from "../states/unit-state-idling";
import { UnitStateMoving } from "../states/unit-state-moving";
import { UnitBase } from "../unit-base";

// michael: TODO: credit https://pixelfrog-assets.itch.io/tiny-swords

export class Lancer extends UnitBase {
  private readonly _idleAnimation: ISpriteAnimation;
  private readonly _moveAnimation: ISpriteAnimation;

  protected _stateMap: Map<UnitState, IUnitState>;

  protected _moveSpeed: number = 5;

  constructor(
    box2dObjectAapter: IBox2dObjectAdapter,
    idleAnimation: ISpriteAnimation,
    moveAnimation: ISpriteAnimation,
  ) {
    super(box2dObjectAapter);
    this._idleAnimation = idleAnimation;
    this._moveAnimation = moveAnimation;

    this._stateMap = new Map<UnitState, IUnitState>([
      ["idling", new UnitStateIdling(this, this._idleAnimation)],
      ["moving", new UnitStateMoving(this, this._moveAnimation)],
    ]);
    this._initState("idling");
  }
}
