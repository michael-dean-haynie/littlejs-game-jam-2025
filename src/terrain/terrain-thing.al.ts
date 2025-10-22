import { inject } from "inversify";
import { Autoloadable } from "../core/autoload/autoloadable";
import { TERRAIN_THING_TOKEN, type ITerrainThing } from "./terrain-thing.types";
import { LJS_TOKEN } from "../littlejsengine/littlejsengine.token";
import type { ILJS } from "../littlejsengine/littlejsengine.impure";

@Autoloadable({
  serviceIdentifier: TERRAIN_THING_TOKEN,
})
export class TerrainThing implements ITerrainThing {
  private readonly _ljs: ILJS;

  constructor(@inject(LJS_TOKEN) ljs: ILJS) {
    this._ljs = ljs;
  }

  doTheThing(): void {
    // this._ljs.draw
    // michael: remove
    console.log(this._ljs);
  }
}
