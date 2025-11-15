import { box2d, RED, type Vector2 } from "littlejsengine";
import { WorldObject } from "./world-object";
import { mkTile } from "../textures/tile-sheets/mk-tile";
import type { RampDirection } from "./cell";
import { world } from "./world";

/** A "rail" for cliff edges/ramps to implement terrain pathing/collision */
export class Rail extends WorldObject {
  private _rampDir?: RampDirection;
  private _doRender = false;

  constructor(pos: Vector2, rampDir: RampDirection | undefined, size: Vector2) {
    super(pos, box2d.bodyTypeStatic);
    this._rampDir = rampDir;
    this.size = size;
    this.drawSize = size;
    this.tileInfo = mkTile("terrain.water");
    this.color = RED;
    this.addBox(size, undefined, this.angle, undefined, 0);
  }

  override render() {
    if (!this._doRender) return;
    if (world.perspective === "topdown") {
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
