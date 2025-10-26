import type { IUnit } from "../units/unit.types";

export const PLAYER_TOKEN = "PLAYER_TOKEN" as const;

export interface IPlayer {
  spawnUnit(): void;
  unit: IUnit | null;
}
