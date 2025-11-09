import type { Vector2 } from "littlejsengine";
import { unitTypeStatsMap } from "./unit-type-stats-map";
import { UnitObject } from "./unit-object";
import { SpriteAnimation } from "../sprite-animation/sprite-animation";
import { Attack } from "../abilities/attack";
import { UnitStateIdling } from "./states/unit-state-idling";
import { UnitStateMoving } from "./states/unit-state-moving";
import { UnitStateCasting } from "./states/unit-state-casting";

unitTypeStatsMap.spider = {
  ...unitTypeStatsMap.spider,
  size: 0.25,
  drawSizeScale: 4,
  moveSpeed: 2,
};

export class Spider extends UnitObject {
  constructor(pos: Vector2) {
    super(pos, "spider");

    // register animations
    this._registerAnimation(
      "idling",
      new SpriteAnimation("units.spider.idling"),
    );
    this._registerAnimation(
      "moving",
      new SpriteAnimation("units.spider.moving"),
    );
    this._registerAnimation(
      "attack",
      new SpriteAnimation("units.spider.attack"),
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
