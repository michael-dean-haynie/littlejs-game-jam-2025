import { Box2dObject } from "littlejsengine";

/** minimal interface that can be mocked out for tests */
export type IBox2dObjectAdapter = Pick<Box2dObject, "tileInfo"> & {
  onUpdate: () => void;
  onRender: () => void;
};

/** default adapter used in the real app. callbacks to be assigned to onUpdate etc. */
export class Box2dObjectAdapter
  extends Box2dObject
  implements IBox2dObjectAdapter
{
  constructor(...args: ConstructorParameters<typeof Box2dObject>) {
    super(...args);
  }

  onUpdate = () => {};
  override update(): void {
    super.update();
    this.onUpdate();
  }

  onRender = () => {};
  override render(): void {
    super.render();
    this.onRender();
  }
}
