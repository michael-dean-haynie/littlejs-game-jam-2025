import type { IBox2dObjectAdapter } from "../../littlejsengine/box2d/box2d-object-adapter/box2d-object-adapter.types";
import type { ISpriteAnimationFactory } from "../../sprite-animation/sprite-animation-factory.types";
import type { IUnitState, UnitState } from "../states/states.types";
import { UnitStateIdling } from "../states/unit-state-idling";
import { UnitStateMoving } from "../states/unit-state-moving";
import { UnitBase } from "../unit-base";
import type { UnitType } from "../unit.types";

export class Warrior extends UnitBase {
  readonly type: UnitType = "warrior";

  protected _stateMap: Map<UnitState, IUnitState>;

  protected _moveSpeed: number = 5;

  constructor(
    box2dObjectAapter: IBox2dObjectAdapter,
    spriteAnimationFactory: ISpriteAnimationFactory,
  ) {
    super(box2dObjectAapter, spriteAnimationFactory, [
      "units.warrior.idling",
      "units.warrior.moving",
    ]);

    this._stateMap = new Map<UnitState, IUnitState>([
      ["idling", new UnitStateIdling(this, "units.warrior.idling")],
      ["moving", new UnitStateMoving(this, "units.warrior.moving")],
    ]);
    this._initState("idling");
  }
}
