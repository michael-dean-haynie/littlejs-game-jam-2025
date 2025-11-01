import { Subject } from "rxjs";
import type { IBox2dObjectAdapter } from "./box2d-object-adapter.types";
import { Box2dObject } from "littlejsengine";
import { vec2 } from "../../littlejsengine.pure";

/** Default adapter used in the real app. Callbacks can be assigned for onUpdate etc. */
export class Box2dObjectAdapter
  extends Box2dObject
  implements IBox2dObjectAdapter
{
  private _update$ = new Subject<void>();
  public update$ = this._update$.asObservable();

  private _render$ = new Subject<void>();
  public render$ = this._render$.asObservable();

  // probably in world/screen space unis?
  public travelingHeight = 0;

  constructor(...args: ConstructorParameters<typeof Box2dObject>) {
    super(...args);
  }

  override update(): void {
    this._update$.next();
    super.update();
  }

  override render(): void {
    this._render$.next();
    // michael: find a better solution than overwriting the position of the engine object for a hot second during rendering
    this.setPosition(this.pos.add(vec2(0, this.travelingHeight)));
    super.render();
    this.setPosition(this.pos.subtract(vec2(0, this.travelingHeight)));
  }
}
