import { enumerationFactory } from "../core/enumeration-factory";
import type { IBox2dObjectAdapter } from "../littlejsengine/box2d/box2d-object-adapter/box2d-object-adapter.types";
import type { Vector2 } from "../littlejsengine/littlejsengine.types";
import type { TextureId } from "../textures/textures.types";
import type { UnitState } from "./states/states.types";

export interface IUnit {
  readonly type: UnitType;
  destroy(): void;
  enqueueMessage(command: object): void;
  swapAnimation(textureId: TextureId): void;
  pushState(state: UnitState): void;
  popState(): void;
  set moveDirection(direction: Vector2);
  set faceDirection(direction: Vector2);
  readonly box2dObjectAdapter: IBox2dObjectAdapter;
  readonly moveSpeed: number;
}

export const UnitTypes = enumerationFactory(
  "warrior",
  "lancer",
  "archer",
  "monk",
  "snake",
  "shaman",
  "paddleFish",
  "spider",
  "troll",
  "gnoll",
  "lizard",
  "goblin",
  "thief",
  "gnome",
  "minotaur",
  "panda",
  "bear",
  "turtle",
  "harpoonFish",
  "skull",
);
export type UnitType = ReturnType<typeof UnitTypes.values>[number];

export const UnitTypeInitDataMap: {
  [K in UnitType]: {
    size: number;
    drawSizeScale: number;
  };
} = {
  warrior: {
    size: 3,
    drawSizeScale: 2,
  },
  lancer: {
    size: 3,
    drawSizeScale: 3.5,
  },
  archer: {
    size: 3,
    drawSizeScale: 2,
  },
  monk: {
    size: 3,
    drawSizeScale: 2,
  },
  snake: {
    size: 3,
    drawSizeScale: 2,
  },
  shaman: {
    size: 3,
    drawSizeScale: 2,
  },
  paddleFish: {
    size: 3,
    drawSizeScale: 2,
  },
  spider: {
    size: 1,
    drawSizeScale: 2,
  },
  troll: {
    size: 3,
    drawSizeScale: 2,
  },
  gnoll: {
    size: 3,
    drawSizeScale: 2,
  },
  lizard: {
    size: 3,
    drawSizeScale: 2,
  },
  goblin: {
    size: 3,
    drawSizeScale: 2,
  },
  thief: {
    size: 3,
    drawSizeScale: 2,
  },
  gnome: {
    size: 3,
    drawSizeScale: 2,
  },
  minotaur: {
    size: 3,
    drawSizeScale: 2,
  },
  panda: {
    size: 3,
    drawSizeScale: 2,
  },
  bear: {
    size: 3,
    drawSizeScale: 2,
  },
  turtle: {
    size: 3,
    drawSizeScale: 2,
  },
  harpoonFish: {
    size: 3,
    drawSizeScale: 2,
  },
  skull: {
    size: 3,
    drawSizeScale: 2,
  },
} as const;
