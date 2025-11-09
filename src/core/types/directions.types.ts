import { vec2, type Vector2 } from "littlejsengine";
import { enumerationFactory } from "../enumeration-factory";

export const OrdinalDirections = enumerationFactory("n", "e", "s", "w");
export type OrdinalDirection = ReturnType<
  typeof OrdinalDirections.values
>[number];

export const CardinalDirections = enumerationFactory("ne", "se", "sw", "nw");
export type CardinalDirection = ReturnType<
  typeof CardinalDirections.values
>[number];

export const SecondaryIntercardinalDirections = enumerationFactory(
  "nne",
  "ene",
  "ese",
  "sse",
  "ssw",
  "wsw",
  "wnw",
  "nnw",
);
export type SecondaryIntercardinalDirection = ReturnType<
  typeof SecondaryIntercardinalDirections.values
>[number];

/** Principal Wind Directions (8 points) */
export const PWDs = enumerationFactory(
  ...[...OrdinalDirections.values(), ...CardinalDirections.values()],
);
export type PWD = ReturnType<typeof PWDs.values>[number];

/** Half Wind Directions (16 points) */
export const HWDs = enumerationFactory(
  ...[...PWDs.values(), ...SecondaryIntercardinalDirections.values()],
);
export type HWD = ReturnType<typeof HWDs.values>[number];

/** temp vectors */
const tv: {
  [K in PWD]: Vector2;
} = {
  n: vec2(0, 1),
  e: vec2(1, 0),
  s: vec2(0, -1),
  w: vec2(-1, 0),
  ne: vec2(1, 1),
  se: vec2(1, -1),
  sw: vec2(-1, -1),
  nw: vec2(-1, 1),
} as const;

export const DirectionToVectorMap: {
  [K in HWD]: Vector2;
} = {
  n: tv.n,
  e: tv.e,
  s: tv.s,
  w: tv.w,
  ne: tv.ne,
  se: tv.se,
  sw: tv.sw,
  nw: tv.nw,
  nne: tv.n.add(tv.ne),
  ene: tv.e.add(tv.ne),
  ese: tv.e.add(tv.se),
  sse: tv.s.add(tv.se),
  ssw: tv.s.add(tv.sw),
  wsw: tv.w.add(tv.sw),
  wnw: tv.w.add(tv.nw),
  nnw: tv.n.add(tv.nw),
} as const;
