import type { Ability, IAbility } from "../abilities/abilities.types";
import { enumerationFactory } from "../core/enumeration-factory";
import type { IBox2dObjectAdapter } from "../littlejsengine/box2d/box2d-object-adapter/box2d-object-adapter.types";
import type { Vector2 } from "../littlejsengine/littlejsengine.types";
import type { Message } from "../messages/messages.types";
import type { UnitState } from "./states/states.types";

export interface IUnit {
  readonly type: UnitType;
  destroy(): void;
  enqueueMessage(command: Message): void;
  swapAnimation(stateOrAbility: UnitState | Ability): void;
  pushState(state: UnitState): void;
  popState(): void;
  set moveDirection(direction: Vector2);
  set faceDirection(direction: Vector2);
  readonly box2dObjectAdapter: IBox2dObjectAdapter;
  readonly moveSpeed: number;
  readonly abilityMap: Map<Ability, IAbility>;
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

// michael: can I find a way to put all this in the unit class?
/** data that the factory needs for initializing the box2d adapter */
export const UnitTypeInitDataMap: {
  [K in UnitType]: {
    size: number;
    drawSizeScale: number;
  };
} = {
  warrior: {
    size: 1.5,
    drawSizeScale: 2,
  },
  lancer: {
    size: 1.5,
    drawSizeScale: 3.5,
  },
  archer: {
    size: 1.5,
    drawSizeScale: 2,
  },
  monk: {
    size: 1.5,
    drawSizeScale: 2,
  },
  snake: {
    size: 1.5,
    drawSizeScale: 2,
  },
  shaman: {
    size: 1.5,
    drawSizeScale: 2,
  },
  paddleFish: {
    size: 1.5,
    drawSizeScale: 2,
  },
  spider: {
    size: 1.5,
    drawSizeScale: 2,
  },
  troll: {
    size: 1.5,
    drawSizeScale: 2,
  },
  gnoll: {
    size: 1.5,
    drawSizeScale: 2,
  },
  lizard: {
    size: 1.5,
    drawSizeScale: 2,
  },
  goblin: {
    size: 1.5,
    drawSizeScale: 2,
  },
  thief: {
    size: 1.5,
    drawSizeScale: 2,
  },
  gnome: {
    size: 1.5,
    drawSizeScale: 2,
  },
  minotaur: {
    size: 1.5,
    drawSizeScale: 2,
  },
  panda: {
    size: 1.5,
    drawSizeScale: 2,
  },
  bear: {
    size: 1.5,
    drawSizeScale: 2,
  },
  turtle: {
    size: 1.5,
    drawSizeScale: 2,
  },
  harpoonFish: {
    size: 1.5,
    drawSizeScale: 2,
  },
  skull: {
    size: 1.5,
    drawSizeScale: 2,
  },
} as const;
