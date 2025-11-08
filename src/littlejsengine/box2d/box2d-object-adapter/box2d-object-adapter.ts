import { Subject } from "rxjs";
import type { IBox2dObjectAdapter } from "./box2d-object-adapter.types";
import { Box2dObject, Vector2 } from "littlejsengine";
import { vec2 } from "../../littlejsengine.pure";
import type { ILJS } from "../../littlejsengine.impure";
import type { IWorld } from "../../../world/world.types";
import { cliffHeightObliqueOffsets } from "../../../world/renderers/cliff-height-oblique-offsets";

/** Default adapter used in the real app. Callbacks can be assigned for onUpdate etc. */
export class Box2dObjectAdapter
  extends Box2dObject
  implements IBox2dObjectAdapter
{
  private readonly _ljs: ILJS;
  private readonly _world: IWorld;

  private _update$ = new Subject<void>();
  public update$ = this._update$.asObservable();

  private _render$ = new Subject<void>();
  public render$ = this._render$.asObservable();

  /** The vertical offset to place a unit's sprite's "feet" in the physical b2d circle */
  public spriteOffset = 0;

  /** Cliff height + ramp height */
  public cliffHeight = 0;

  private _rampHeight = 0;

  constructor(
    ljs: ILJS,
    world: IWorld,
    ...args: ConstructorParameters<typeof Box2dObject>
  ) {
    super(...args);
    this._ljs = ljs;
    this._world = world;
  }

  override update(): void {
    this._update$.next();
    const pos = this.getCenterOfMass();

    // michael: performance: maybe not for now, might be expensive
    // make semi-transparent with terrain
    // const alpha = this._terrainThing.isObscured(pos) ? 0.5 : 1;
    // this.box2dObjectAdapter.color = new Color(1, 1, 1, alpha);

    this.cliffHeight = this._world.getCell(pos).cliffHeight;
    this._rampHeight = this._world.getRampHeight(pos);
    // michael: formalize this. Cliffs take the integer heights, within those, units are .1, maybe other things will be .2, etc
    this.renderOrder = this.cliffHeight + Math.ceil(this._rampHeight) + 0.1;
    super.update();
  }

  override render(): void {
    this._render$.next();
    // note: coppied from default impl - just updated the pos argument
    this._ljs.drawTile(
      this.getPerspectivePos(),
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

  getPerspectivePos(): Vector2 {
    const pos = this.getCenterOfMass();
    switch (this._world.perspective) {
      case "topdown":
        return pos;
      case "topdown-oblique":
        return pos
          .add(vec2(0, cliffHeightObliqueOffsets[this.cliffHeight]))
          .add(vec2(0, this._rampHeight))
          .add(vec2(0, this.spriteOffset));
    }
  }
}
