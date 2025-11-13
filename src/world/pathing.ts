import { Astar, Grid } from "fast-astar";
import { world } from "./world.al";
import { extToGridSize } from "./renderers/sectors/sector";
import { vec2, type Vector2 } from "littlejsengine";
import { noCap } from "../core/util/no-cap";

export type AstarObs = [number, number][];

/** Returns a series of world coordinates to get from pos a to pos b */
export function getPath(posA: Vector2, posB: Vector2): Vector2[] {
  // michael: improve - assert ranges
  // michael: improve - memoize until refresh?
  const astarPosA = worldToAstar(posA);
  const astarPosB = worldToAstar(posB);
  const astarPath = world.astar.search(
    [astarPosA.x, astarPosA.y],
    [astarPosB.x, astarPosB.y],
  );
  noCap.notUndefined(astarPath, "Path should be found");
  return astarPath.map(([astarX, astarY]) =>
    astarToWorld(vec2(astarX, astarY)),
  );
}

export function astarToWorld(astarPos: Vector2): Vector2 {
  const sExt = world.wc.sectorExtent;
  const astarOriginWorldPos = world.astarOriginSector
    .scale(world.sectorSize) // center of sector world pos
    .add(vec2(-sExt, sExt)) // top left cell world pos
    .add(vec2(-1, 1).scale(1 / 3)); // top left astar grid (obstacle) of cell world pos
  return astarOriginWorldPos.add(vec2(astarPos.x, -astarPos.y).scale(1 / 3));
}

export function worldToAstar(worldPos: Vector2): Vector2 {
  // michael: improve - assert ranges
  const sExt = world.wc.sectorExtent;
  const astarOriginWorldPos = world.astarOriginSector
    .scale(world.sectorSize) // center of sector world pos
    .add(vec2(-sExt, sExt)) // top left cell world pos
    .add(vec2(-1, 1).scale(1 / 3)); // top left astar grid (obstacle) of cell world pos
  return worldPos.subtract(astarOriginWorldPos).abs().scale(3);
}

export function refreshAstarPathing(): void {
  const astarGridSize = extToGridSize(world.wc.sectorPathingExtent) * 3;
  const astarGrid = new Grid({
    col: astarGridSize,
    row: astarGridSize,
  });

  for (const sector of world.sectors.values()) {
    for (const [sx, sy] of sector.obstacles) {
      // sx,sy: sectorX, sectorY
      const sectorOffset = world.astarOriginSector.subtract(sector.pos).abs();
      // ax, ay: astarGridX, astarGridY
      const ax = sectorOffset.x * 3 + sx;
      const ay = sectorOffset.y * 3 + sy;
      astarGrid.set([ax, ay], "value", 1);
    }
  }

  world.astar = new Astar(astarGrid);
}

/** transform in-place */
export function cellObsToSectorObs(
  cellObs: AstarObs,
  cellSectorOffset: Vector2,
  sectorExtent: number,
): void {
  const xOffset = (cellSectorOffset.x + sectorExtent) * 3;
  const yOffset = (-cellSectorOffset.y + sectorExtent) * 3;

  for (const obs of cellObs) {
    obs[0] = obs[0] + xOffset;
    obs[1] = obs[1] + yOffset;
  }
}
