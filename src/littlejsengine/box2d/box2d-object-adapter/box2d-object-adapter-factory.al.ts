import { inject } from "inversify";
import { Autoloadable } from "../../../core/autoload/autoloadable";
import type { Box2dObject } from "../../littlejsengine.types";
import { Box2dObjectAdapter } from "./box2d-object-adapter";
import {
  BOX2D_OBJECT_ADAPTER_FACTORY_TOKEN,
  type IBox2dObjectAdapterFactory,
} from "./box2d-object-adapter-factory.types";
import type { IBox2dObjectAdapter } from "./box2d-object-adapter.types";
import type { ILJS } from "../../littlejsengine.impure";
import { LJS_TOKEN } from "../../littlejsengine.token";
import { WORLD_TOKEN, type IWorld } from "../../../world/world.types";

@Autoloadable({
  serviceIdentifier: BOX2D_OBJECT_ADAPTER_FACTORY_TOKEN,
})
export class Box2dObjectAdapterFactory implements IBox2dObjectAdapterFactory {
  private readonly _ljs: ILJS;
  private readonly _world: IWorld;

  constructor(
    @inject(LJS_TOKEN) ljs: ILJS,
    @inject(WORLD_TOKEN) world: IWorld,
  ) {
    this._ljs = ljs;
    this._world = world;
  }

  createBox2dObjectAdapter(
    ...args: ConstructorParameters<typeof Box2dObject>
  ): IBox2dObjectAdapter {
    return new Box2dObjectAdapter(this._ljs, this._world, ...args);
  }
}
