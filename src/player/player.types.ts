import type { UnitObject } from "../units/unit-object";

export const PLAYER_TOKEN = "PLAYER_TOKEN" as const;

export interface IPlayer {
  spawnUnit(): void;
  unit: UnitObject | null;
}
