import { UnitTypes, type UnitType } from "./unit.types";

export type UnitInfo = {
  /** Box2d object physical size */
  size: number;
  /** Sprite size (scaled from size) */
  drawSizeScale: number;
  /** The vertical offset to place a unit's sprite's "feet" in the physical b2d circle (scaled from size) */
  spriteOffset: number;
  moveSpeed: number;
};

export const defaultUnitStats: UnitInfo = {
  size: 0.5,
  drawSizeScale: 4,
  spriteOffset: 0,
  moveSpeed: 3,
} as const;

export const unitTypeInfoMap = Object.fromEntries(
  UnitTypes.values().map((unitType) => [unitType, { ...defaultUnitStats }]),
) as { [K in UnitType]: UnitInfo };
