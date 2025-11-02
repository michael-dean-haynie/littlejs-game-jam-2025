import type { Ability, IAbility } from "../abilities/abilities.types";
import { enumerationFactory } from "../core/enumeration-factory";
import type { IBox2dObjectAdapter } from "../littlejsengine/box2d/box2d-object-adapter/box2d-object-adapter.types";
import type { Vector2 } from "../littlejsengine/littlejsengine.types";
import type { Message } from "../messages/messages.types";
import type { UnitState } from "./states/states.types";
import type { UnitStats } from "./unit-type-stats-map";

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
  readonly stats: UnitStats;
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
