import { vec2, type Vector2 } from "littlejsengine";

/** Tile offsets by cliff height for All_Tilemaps texture */
export const cliffHeightTileOffsets: { [index: number]: Vector2 } = {
  // 0 - water should not have tilemap?
  0: vec2(0, 0),
  1: vec2(0, 0),
  2: vec2(0, 6),
  3: vec2(0, 12),
  4: vec2(0, 18),
  5: vec2(0, 24),
};
