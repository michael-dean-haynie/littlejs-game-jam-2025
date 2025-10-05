import { Autoloadable } from "../../../core/autoload/autoloadable";
import type { Box2dObject } from "../../littlejsengine.types";
import { Box2dObjectAdapter } from "./box2d-object-adapter";
import {
  BOX2D_OBJECT_ADAPTER_FACTORY_TOKEN,
  type IBox2dObjectAdapterFactory,
} from "./box2d-object-adapter-factory.types";
import type { IBox2dObjectAdapter } from "./box2d-object-adapter.types";

@Autoloadable({
  serviceIdentifier: BOX2D_OBJECT_ADAPTER_FACTORY_TOKEN,
})
export class Box2dObjectAdapterFactory implements IBox2dObjectAdapterFactory {
  createBox2dObjectAdapter(
    ...args: ConstructorParameters<typeof Box2dObject>
  ): IBox2dObjectAdapter {
    return new Box2dObjectAdapter(...args);
  }
}
