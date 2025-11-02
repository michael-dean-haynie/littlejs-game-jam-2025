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
import { unitTypeStatsMap } from "../unit-type-stats-map";
import type { UnitType } from "../unit.types";

unitTypeStatsMap.lancer = {
  ...unitTypeStatsMap.lancer,
  size: 0.5,
  drawSizeScale: 6,
  moveSpeed: 3,
};

export class Lancer extends UnitBase {
  readonly type: UnitType = "lancer";

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
        n: spriteSheetMap["units.lancer.guardUp"],
        ne: spriteSheetMap["units.lancer.guardUpRight"],
        e: spriteSheetMap["units.lancer.guardRight"],
        se: spriteSheetMap["units.lancer.guardDownRight"],
        s: spriteSheetMap["units.lancer.guardDown"],
      }),
    );
    this._registerAnimation(
      "attack",
      spriteAnimationFactory.createSpriteAnimation({
        n: spriteSheetMap["units.lancer.attackUp"],
        ne: spriteSheetMap["units.lancer.attackUpRight"],
        e: spriteSheetMap["units.lancer.attackRight"],
        se: spriteSheetMap["units.lancer.attackDownRight"],
        s: spriteSheetMap["units.lancer.attackDown"],
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
