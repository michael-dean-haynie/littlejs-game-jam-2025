import { mock } from "vitest-mock-extended";
import { Autoloadable } from "../../../core/autoload/autoloadable";
import {
  BOX2D_OBJECT_ADAPTER_FACTORY_TOKEN,
  type IBox2dObjectAdapterFactory,
} from "./box2d-object-adapter-factory.types";
import { Box2dObjectAdapterMock } from "../../box2d-object-adapter.mock";
import type { IBox2dObjectAdapter } from "./box2d-object-adapter.types";

@Autoloadable({
  serviceIdentifier: BOX2D_OBJECT_ADAPTER_FACTORY_TOKEN,
  executionContext: "test",
})
export class Box2dObjectAdapterFactoryMock {
  // michael: figure out how to autload non-classes so I can make this officially implement the interface
  constructor() {
    const factory = mock<IBox2dObjectAdapterFactory>({
      // also improve this so no need for "as"
      createBox2dObjectAdapter: () =>
        new Box2dObjectAdapterMock() as IBox2dObjectAdapter,
    });
    return factory;
  }
}
