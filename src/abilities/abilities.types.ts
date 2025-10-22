import type { Observable } from "rxjs";
import { enumerationFactory } from "../core/enumeration-factory";

export interface IAbility {
  readonly type: Ability;
  progress(): void;
  restart(): void;
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
