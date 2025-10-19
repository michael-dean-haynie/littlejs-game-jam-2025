import type { Observable } from "rxjs";
import type { Box2dObject } from "../../littlejsengine.types";

/** A minimal interface for the box2d engine object that can be mocked out for tests */
export type IBox2dObjectAdapter = Pick<
  Box2dObject,
  | "tileInfo"
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
  | "destroy"
> & {
  update$: Observable<void>;
  render$: Observable<void>;
};
