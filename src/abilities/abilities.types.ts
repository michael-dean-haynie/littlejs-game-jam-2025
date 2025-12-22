import type { Observable } from "rxjs";

export interface IAbility {
  readonly type: Ability;
  start(): void;
  restart(): void;
  progress(): void;
  readonly phase$: Observable<AbilityPhase>;
}

export const AbilityPhases = [
  "init",
  "preswing",
  "swing",
  "backswing",
  "complete",
] as const;
export type AbilityPhase = (typeof AbilityPhases)[number];

export const Abilities = ["guard", "attack"] as const;
export type Ability = (typeof Abilities)[number];
