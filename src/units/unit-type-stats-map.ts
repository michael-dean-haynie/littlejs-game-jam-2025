import { UnitTypes, type UnitType } from "./unit.types";

export type UnitStats = {
  /** Box2d object physical size */
  size: number;
  /** Sprite size (scaled from size) */
  drawSizeScale: number;
  /** The vertical offset to place a unit's sprite's "feet" in the physical b2d circle (scaled from size) */
  drawHeight3d: number;
  moveSpeed: number;
};

export const defaultUnitStats: UnitStats = {
  size: 1,
  drawSizeScale: 1,
  drawHeight3d: 0,
  moveSpeed: 3,
} as const;

export const unitTypeStatsMap = Object.fromEntries(
  UnitTypes.values().map((unitType) => [unitType, { ...defaultUnitStats }]),
) as { [K in UnitType]: UnitStats };
