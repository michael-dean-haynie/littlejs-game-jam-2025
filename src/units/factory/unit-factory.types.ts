import type { Vector2 } from "../../littlejsengine/littlejsengine.types";
import type { IUnit, UnitType } from "../unit.types";

export const UNIT_FACTORY_TOKEN = "UNIT_FACTORY_TOKEN" as const;

export interface IUnitFactory {
  createUnit(unit: UnitType, position: Vector2): IUnit;
}
