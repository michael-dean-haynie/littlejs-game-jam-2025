import type { Vector2 } from "littlejsengine";
import type { Warrior } from "../warrior";

export const WARRIOR_FACTORY_TOKEN = Symbol("WARRIOR_FACTORY_TOKEN");

export interface IWarriorFactory {
  createWarrior(position: Vector2): Warrior;
}
