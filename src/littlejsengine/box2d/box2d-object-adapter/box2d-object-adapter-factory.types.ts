import type { Box2dObject } from "../../littlejsengine.types";
import type { IBox2dObjectAdapter } from "./box2d-object-adapter.types";

export const BOX2D_OBJECT_ADAPTER_FACTORY_TOKEN =
  "BOX2D_OBJECT_ADAPTER_FACTORY_TOKEN" as const;

export interface IBox2dObjectAdapterFactory {
  createBox2dObjectAdapter(
    ...args: ConstructorParameters<typeof Box2dObject>
  ): IBox2dObjectAdapter;
}
