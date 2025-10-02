import { box2d, Box2dObject, tile, vec2, Vector2, WHITE } from "littlejsengine";

export class Warrior extends Box2dObject {
  constructor(position: Vector2) {
    super(
      position,
      vec2(10),
      tile(0, 192, 0, 0),
      0,
      WHITE,
      box2d.bodyTypeDynamic,
    );

    // michael: test if this is needed and remove? maybe matters for collision?
    // this.drawSize = this.size.scale(1.02); // slightly enlarge to cover gaps

    this.addBox(this.size);
  }

  override render() {
    super.render();
  }
}
