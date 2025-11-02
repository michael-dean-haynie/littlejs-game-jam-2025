import { Attack } from "../../abilities/attack";
import type { IBox2dObjectAdapter } from "../../littlejsengine/box2d/box2d-object-adapter/box2d-object-adapter.types";
import type { ILJS } from "../../littlejsengine/littlejsengine.impure";
import type { ISpriteAnimationFactory } from "../../sprite-animation/sprite-animation-factory.types";
import type { ITerrainThing } from "../../terrain/terrain-thing.types";
import { UnitStateCasting } from "../states/unit-state-casting";
import { UnitStateIdling } from "../states/unit-state-idling";
import { UnitStateMoving } from "../states/unit-state-moving";
import { UnitBase } from "../unit-base";
import { unitTypeStatsMap } from "../unit-type-stats-map";
import type { UnitType } from "../unit.types";

unitTypeStatsMap.spider = {
  ...unitTypeStatsMap.spider,
  size: 0.25,
  drawSizeScale: 4,
  moveSpeed: 2,
};

export class Spider extends UnitBase {
  readonly type: UnitType = "spider";

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
      spriteAnimationFactory.createSpriteAnimation("units.spider.idling"),
    );
    this._registerAnimation(
      "moving",
      spriteAnimationFactory.createSpriteAnimation("units.spider.moving"),
    );
    this._registerAnimation(
      "attack",
      spriteAnimationFactory.createSpriteAnimation("units.spider.attack"),
    );

    // register abilities
    this.abilityMap.set("attack", new Attack(this, ljs, 0, 0.8));

    // register states
    this._stateMap.set("idling", new UnitStateIdling(this));
    this._stateMap.set("moving", new UnitStateMoving(this));
    this._stateMap.set("casting", new UnitStateCasting(this));

    // initial state
    this._initState("idling");
  }
}
