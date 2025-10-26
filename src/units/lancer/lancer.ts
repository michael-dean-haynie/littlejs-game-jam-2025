import { Attack } from "../../abilities/attack";
import { Guard } from "../../abilities/guard";
import type { IBox2dObjectAdapter } from "../../littlejsengine/box2d/box2d-object-adapter/box2d-object-adapter.types";
import type { ILJS } from "../../littlejsengine/littlejsengine.impure";
import type { ISpriteAnimationFactory } from "../../sprite-animation/sprite-animation-factory.types";
import type { ITerrainThing } from "../../terrain/terrain-thing.types";
import { UnitStateCasting } from "../states/unit-state-casting";
import { UnitStateIdling } from "../states/unit-state-idling";
import { UnitStateMoving } from "../states/unit-state-moving";
import { UnitBase } from "../unit-base";
import type { UnitType } from "../unit.types";

export class Lancer extends UnitBase {
  readonly type: UnitType = "lancer";
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
      spriteAnimationFactory.createSpriteAnimation("units.lancer.idling"),
    );
    this._registerAnimation(
      "moving",
      spriteAnimationFactory.createSpriteAnimation("units.lancer.moving"),
    );
    this._registerAnimation(
      "guard",
      spriteAnimationFactory.createSpriteAnimation({
        n: "units.lancer.guardUp",
        ne: "units.lancer.guardUpRight",
        e: "units.lancer.guardRight",
        se: "units.lancer.guardDownRight",
        s: "units.lancer.guardDown",
      }),
    );
    this._registerAnimation(
      "attack",
      spriteAnimationFactory.createSpriteAnimation({
        n: "units.lancer.attackUp",
        ne: "units.lancer.attackUpRight",
        e: "units.lancer.attackRight",
        se: "units.lancer.attackDownRight",
        s: "units.lancer.attackDown",
      }),
    );

    // register abilities
    this.abilityMap.set("attack", new Attack(this, ljs, 0, 0.3));
    this.abilityMap.set("guard", new Guard(this, ljs));

    // register states
    this._stateMap.set("idling", new UnitStateIdling(this));
    this._stateMap.set("moving", new UnitStateMoving(this));
    this._stateMap.set("casting", new UnitStateCasting(this));

    // initial state
    this._initState("idling");
  }
}
