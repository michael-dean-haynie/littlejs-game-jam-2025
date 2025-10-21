import type { Observable } from "rxjs";
import { enumerationFactory } from "../core/enumeration-factory";
import { Guard } from "./guard";
import { Attack } from "./attack";
import type { ILJS } from "../littlejsengine/littlejsengine.impure";
import type { IUnit } from "../units/unit.types";

export interface IAbility {
  readonly type: Ability;
  progress(): void;
  readonly phase$: Observable<AbilityPhase>;
}

export const AbilityPhases = enumerationFactory(
  "init",
  "preswing",
  "swing",
  "backswing",
  "complete",
);
export type AbilityPhase = ReturnType<typeof AbilityPhases.values>[number];

export const Abilities = enumerationFactory("guard", "attack");
export type Ability = ReturnType<typeof Abilities.values>[number];

export const AbilityCtorMap: {
  [K in Ability]: new (unit: IUnit, lsj: ILJS) => IAbility;
} = {
  guard: Guard,
  attack: Attack,
};
