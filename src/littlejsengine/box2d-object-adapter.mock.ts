import { of } from "rxjs";
import type { IBox2dObjectAdapter } from "./box2d/box2d-object-adapter/box2d-object-adapter.types";
import { mock } from "vitest-mock-extended";

export class Box2dObjectAdapterMock {
  constructor() {
    return mock<IBox2dObjectAdapter>({
      update$: of(),
      render$: of(),
    });
  }
}
