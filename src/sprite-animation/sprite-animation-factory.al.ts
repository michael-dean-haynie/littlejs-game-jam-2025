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
import type {
  ISpriteAnimation,
  DirToTextureMap,
  DirToFramesMap,
} from "./sprite-animation.types";
import { type AnimationTextureId } from "../textures/textures.types";
import type { TileInfo } from "../littlejsengine/littlejsengine.types";
import { getAnimationTexture } from "../textures/get-texture";

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

  createSpriteAnimation(
    textureData: AnimationTextureId | DirToTextureMap,
  ): ISpriteAnimation {
    let textureMap: DirToTextureMap;
    if (typeof textureData === "string") {
      textureMap = this._createTextureMapFromTexture(textureData);
    } else {
      textureMap = textureData;
    }

    const framesMap: DirToFramesMap = {
      n: this._convertTextureToFrames(textureMap.n),
      ne: this._convertTextureToFrames(textureMap.ne),
      e: this._convertTextureToFrames(textureMap.e),
      se: this._convertTextureToFrames(textureMap.se),
      s: this._convertTextureToFrames(textureMap.s),
    };

    return new SpriteAnimation(framesMap, this._ljs);
  }

  createTileInfo(textureId: AnimationTextureId): TileInfo {
    const [texture, textureIdx] = getAnimationTexture(textureId);

    return this._ljs.tile(0, texture.size, textureIdx, 0);
  }

  private _createTextureMapFromTexture(
    textureId: AnimationTextureId,
  ): DirToTextureMap {
    return {
      n: textureId,
      e: textureId,
      s: textureId,
      ne: textureId,
      se: textureId,
    };
  }

  private _convertTextureToFrames(
    textureId: AnimationTextureId,
  ): SpriteAnimationFrame[] {
    const [texture, textureIdx] = getAnimationTexture(textureId);

    const frames: SpriteAnimationFrame[] = [];
    for (let i = 0; i < texture.frames; i++) {
      frames.push({
        tileInfo: this._ljs.tile(
          i + texture.offset,
          texture.size,
          textureIdx,
          this._defaultFramePadding,
        ),
        duration: this._defaultFrameDuration,
      });
    }
    return frames;
  }
}
