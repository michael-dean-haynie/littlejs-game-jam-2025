import { EngineObject, vec2 } from "../../littlejsengine/littlejsengine.pure";
import type { Sector } from "../sector";
import type { IWorld } from "../world.types";

export abstract class CliffRenderer extends EngineObject {
  protected readonly _sector: Sector;
  protected readonly _world: IWorld;
  protected readonly _cliffHeight: number;

  constructor(sector: Sector, world: IWorld, cliffHeight: number) {
    super(
      sector.worldPos,
      vec2(world.sectorSize),
      undefined,
      undefined,
      undefined,
      cliffHeight,
    );
    this._sector = sector;
    this._world = world;
    this._cliffHeight = cliffHeight;
  }
}
