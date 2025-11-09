import { box2d, RED, type Vector2 } from "littlejsengine";
import type { IWorld } from "../../world/world.types";
import { WorldObject } from "./world-object";
import { mkTile } from "../../textures/tile-sheets/mk-tile";
import type { RampDirection } from "../../world/cell";

/** A "rail" for cliff edges/ramps to implement terrain pathing/collision */
export class Rail extends WorldObject {
  private _rampDir?: RampDirection;
  private _doRender = false;

  constructor(
    world: IWorld,
    rampDir: RampDirection | undefined,
    pos: Vector2,
    size: Vector2,
  ) {
    super(
      world,
      pos,
      size,
      mkTile("terrain.water"),
      0,
      RED,
      box2d.bodyTypeStatic,
    );
    this._rampDir = rampDir;
    this.drawSize = size;
    this.addBox(size, undefined, this.angle, undefined, 0);
  }

  override render() {
    if (!this._doRender) return;
    if (this._world.perspective === "topdown") {
      this.angle = 0;
    } else {
      switch (this._rampDir) {
        case undefined:
          this.angle = 0;
          break;
        case "w":
          this.angle = 0.7;
          break;
        case "e":
          this.angle = -0.7;
          break;
      }
    }
    super.render();
  }
}
