import type { Observable } from "rxjs";
import type { Box2dObject } from "../../littlejsengine.types";

/** A minimal interface for the box2d engine object that can be mocked out for tests */
export type IBox2dObjectAdapter = Pick<
  Box2dObject,
  | "tileInfo"
  | "applyAcceleration"
  | "applyForce"
  | "getLinearVelocity"
  | "setLinearDamping"
  | "setLinearVelocity"
> & {
  update$: Observable<void>;
  render$: Observable<void>;
};
