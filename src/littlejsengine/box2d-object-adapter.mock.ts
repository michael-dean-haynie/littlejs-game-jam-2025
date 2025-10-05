import type { TileInfo } from "littlejsengine";
import { of, type Observable } from "rxjs";
import type { IBox2dObjectAdapter } from "./box2d/box2d-object-adapter/box2d-object-adapter.types";
import { mock } from "vitest-mock-extended";

export class Box2dObjectAdapterMock implements IBox2dObjectAdapter {
  tileInfo: TileInfo = mock<TileInfo>();
  update$: Observable<void> = of();
  render$: Observable<void> = of();
}
