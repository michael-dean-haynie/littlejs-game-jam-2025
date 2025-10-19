import { inject } from "inversify";
import { Autoloadable } from "../core/autoload/autoloadable";
import { SpriteAnimation } from "./sprite-animation";
import {
  SPRITE_ANIMATION_FACTORY_TOKEN,
  type ISpriteAnimationFactory,
} from "./sprite-animation-factory.types";
import type { SpriteAnimationFrame } from "./sprite-animation-frame";
import { LJS_TOKEN } from "../littlejsengine/littlejsengine.token";
import type { ILJS } from "../littlejsengine/littlejsengine.impure";
import type { ISpriteAnimation } from "./sprite-animation.types";
import { textures, type TextureId } from "../textures/textures.types";
import { noCap } from "../core/util/no-cap";
import type { TileInfo } from "littlejsengine";

@Autoloadable({
  serviceIdentifier: SPRITE_ANIMATION_FACTORY_TOKEN,
})
export class SpriteAnimationFactory implements ISpriteAnimationFactory {
  private readonly _ljs: ILJS;

  /** The default animation frame duration in seconds */
  private readonly _defaultFrameDuration = 0.1;

  /** The default padding around each frame in pixels */
  private readonly _defaultFramePadding = 0;

  constructor(@inject(LJS_TOKEN) ljs: ILJS) {
    this._ljs = ljs;
  }

  createSpriteAnimation(textureId: TextureId): ISpriteAnimation {
    const textureIdx = textures.findIndex((txt) => txt.id === textureId);
    noCap(textureIdx !== -1);
    const texture = textures[textureIdx];

    const frames: SpriteAnimationFrame[] = [];
    for (let i = 0; i < texture.frames; i++) {
      frames.push({
        tileInfo: this._ljs.tile(
          i,
          texture.size,
          textureIdx,
          this._defaultFramePadding,
        ),
        duration: this._defaultFrameDuration,
      });
    }

    return new SpriteAnimation(frames, this._ljs);
  }

  createTileInfo(textureId: TextureId): TileInfo {
    const textureIdx = textures.findIndex((txt) => txt.id === textureId);
    noCap(textureIdx !== -1);
    const texture = textures[textureIdx];

    return this._ljs.tile(0, texture.size, textureIdx, 0);
  }
}
