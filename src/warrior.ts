import type { IBox2dObjectAdapter } from "./box-2d-object";
import { SpriteAnimation } from "./sprite-animation/sprite-animation";

export class Warrior {
  private readonly _box2dObjectAdapter: IBox2dObjectAdapter;
  private readonly _spriteAnimation: SpriteAnimation;
  constructor(
    box2dObjectAdapter: IBox2dObjectAdapter,
    spriteAnimation: SpriteAnimation,
  ) {
    this._box2dObjectAdapter = box2dObjectAdapter;
    this._box2dObjectAdapter.onRender = this.render.bind(this);

    this._spriteAnimation = spriteAnimation;
  }

  render() {
    if (this._spriteAnimation.update()) {
      this._box2dObjectAdapter.tileInfo =
        this._spriteAnimation.currentFrame.tileInfo;
    }
    // console.log("render THIS", this);
  }
}
