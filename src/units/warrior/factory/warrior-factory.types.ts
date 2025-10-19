import type { Vector2 } from "../../../littlejsengine/littlejsengine.types";
import type { Warrior } from "../warrior";

export const WARRIOR_FACTORY_TOKEN = "WARRIOR_FACTORY_TOKEN" as const;

export interface IWarriorFactory {
  createWarrior(position: Vector2): Warrior;
}
