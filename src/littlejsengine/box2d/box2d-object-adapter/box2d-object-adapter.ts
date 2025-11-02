import { Subject } from "rxjs";
import type { IBox2dObjectAdapter } from "./box2d-object-adapter.types";
import { Box2dObject } from "littlejsengine";
import { vec2 } from "../../littlejsengine.pure";
import type { ILJS } from "../../littlejsengine.impure";

/** Default adapter used in the real app. Callbacks can be assigned for onUpdate etc. */
export class Box2dObjectAdapter
  extends Box2dObject
  implements IBox2dObjectAdapter
{
  private readonly _ljs: ILJS;

  private _update$ = new Subject<void>();
  public update$ = this._update$.asObservable();

  private _render$ = new Subject<void>();
  public render$ = this._render$.asObservable();

  /** The vertical offset to place a unit's sprite's "feet" in the physical b2d circle */
  public drawHeight3d = 0;

  /** The vertical offset from cliff height */
  public terrainDrawHeight = 0;

  constructor(ljs: ILJS, ...args: ConstructorParameters<typeof Box2dObject>) {
    super(...args);
    this._ljs = ljs;
  }

  override update(): void {
    this._update$.next();
    super.update();
  }

  override render(): void {
    this._render$.next();
    // note: coppied from default impl - just updated the pos argument
    this._ljs.drawTile(
      this.pos.add(vec2(0, this.terrainDrawHeight + this.drawHeight3d)),
      this.drawSize || this.size,
      this.tileInfo,
      this.color,
      this.angle,
      this.mirror,
      this.additiveColor,
    );
    // michael: find a better solution than overwriting the position of the engine object for a hot second during rendering
    // I think the below was causing box2d to crash
    // this.setPosition(this.pos.add(vec2(0, this.travelingHeight)));
    // super.render();
    // this.setPosition(this.pos.subtract(vec2(0, this.travelingHeight)));
  }
}
