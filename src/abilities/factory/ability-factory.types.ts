import type { IUnit } from "../../units/unit.types";
import type { Ability, IAbility } from "../abilities.types";

export const ABILITY_FACTORY_TOKEN = "ABILITY_FACTORY_TOKEN" as const;

export interface IAbilityFactory {
  createAbility(ability: Ability, unit: IUnit): IAbility;
}
