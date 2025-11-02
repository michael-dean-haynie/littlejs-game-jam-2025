import type { Observable } from "rxjs";
import type { Box2dObject } from "../../littlejsengine.types";

/** A minimal interface for the box2d engine object that can be mocked out for tests */
export type IBox2dObjectAdapter = Pick<
  Box2dObject,
  | "tileInfo"
  | "color"
  | "drawSize"
  | "mirror"
  | "addBox"
  | "addCircle"
  | "applyAcceleration"
  | "applyForce"
  | "getLinearVelocity"
  | "getCenterOfMass"
  | "setLinearDamping"
  | "setLinearVelocity"
  | "setFixedRotation"
  | "destroy"
> & {
  update$: Observable<void>;
  render$: Observable<void>;
  /** Offset for cliff height and ramp height */
  terrainDrawHeight: number;
  /** The vertical offset to place a unit's sprite's "feet" in the physical b2d circle */
  drawHeight3d: number;
};
