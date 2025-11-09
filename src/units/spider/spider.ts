import type { Vector2 } from "littlejsengine";
import { Attack } from "../../abilities/attack";
import type { ISpriteAnimationFactory } from "../../sprite-animation/sprite-animation-factory.types";
import type { IWorld } from "../../world/world.types";
import { UnitStateCasting } from "../states/unit-state-casting";
import { UnitStateIdling } from "../states/unit-state-idling";
import { UnitStateMoving } from "../states/unit-state-moving";
import { unitTypeStatsMap } from "../unit-type-stats-map";
import { UnitObject } from "../unit-object";

unitTypeStatsMap.spider = {
  ...unitTypeStatsMap.spider,
  size: 0.25,
  drawSizeScale: 4,
  moveSpeed: 2,
};

export class Spider extends UnitObject {
  constructor(
    pos: Vector2,
    world: IWorld,
    spriteAnimationFactory: ISpriteAnimationFactory,
  ) {
    super(pos, world, "spider");

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
    this.abilityMap.set("attack", new Attack(this, 0, 0.8));

    // register states
    this._stateMap.set("idling", new UnitStateIdling(this));
    this._stateMap.set("moving", new UnitStateMoving(this));
    this._stateMap.set("casting", new UnitStateCasting(this));

    // initial state
    this._initState("idling");
  }
}
