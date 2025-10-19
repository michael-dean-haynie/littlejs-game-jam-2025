import type { Vector2 } from "../../../littlejsengine/littlejsengine.types";
import type { Lancer } from "../lancer";

export const LANCER_FACTORY_TOKEN = "LANCER_FACTORY_TOKEN" as const;

export interface ILancerFactory {
  createLancer(position: Vector2): Lancer;
}
