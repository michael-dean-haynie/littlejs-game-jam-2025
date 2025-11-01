import { Attack } from "../../abilities/attack";
import { Guard } from "../../abilities/guard";
import type { IBox2dObjectAdapter } from "../../littlejsengine/box2d/box2d-object-adapter/box2d-object-adapter.types";
import type { ILJS } from "../../littlejsengine/littlejsengine.impure";
import type { ISpriteAnimationFactory } from "../../sprite-animation/sprite-animation-factory.types";
import type { ITerrainThing } from "../../terrain/terrain-thing.types";
import { spriteSheetMap } from "../../textures/sprite-sheets/sprite-sheet-map";
import { UnitStateCasting } from "../states/unit-state-casting";
import { UnitStateIdling } from "../states/unit-state-idling";
import { UnitStateMoving } from "../states/unit-state-moving";
import { UnitBase } from "../unit-base";
import type { UnitType } from "../unit.types";

export class Warrior extends UnitBase {
  readonly type: UnitType = "warrior";

  protected _moveSpeed: number = 5;

  constructor(
    box2dObjectAapter: IBox2dObjectAdapter,
    spriteAnimationFactory: ISpriteAnimationFactory,
    terrainThing: ITerrainThing,
    ljs: ILJS,
  ) {
    super(box2dObjectAapter, terrainThing);

    // register animations
    this._registerAnimation(
      "idling",
      spriteAnimationFactory.createSpriteAnimation("units.warrior.idling"),
    );
    this._registerAnimation(
      "moving",
      spriteAnimationFactory.createSpriteAnimation("units.warrior.moving"),
    );
    this._registerAnimation(
      "guard",
      spriteAnimationFactory.createSpriteAnimation("units.warrior.guard"),
    );
    this._registerAnimation(
      "attack",
      spriteAnimationFactory.createSpriteAnimation({
        n: spriteSheetMap["units.warrior.attack2"],
        ne: spriteSheetMap["units.warrior.attack2"],
        e: spriteSheetMap["units.warrior.attack1"],
        se: spriteSheetMap["units.warrior.attack1"],
        s: spriteSheetMap["units.warrior.attack1"],
      }),
    );

    // register abilities
    this.abilityMap.set("attack", new Attack(this, ljs, 0, 0.2));
    this.abilityMap.set("guard", new Guard(this, ljs));

    // register states
    this._stateMap.set("idling", new UnitStateIdling(this));
    this._stateMap.set("moving", new UnitStateMoving(this));
    this._stateMap.set("casting", new UnitStateCasting(this));

    // initial state
    this._initState("idling");
  }
}
