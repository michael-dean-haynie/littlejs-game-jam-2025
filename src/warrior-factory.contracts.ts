import type { Warrior } from "./warrior";

export const WARRIOR_FACTORY_TOKEN = Symbol("WARRIOR_FACTORY_TOKEN");

export interface IWarriorFactory {
  createWarrior(): Warrior;
}
