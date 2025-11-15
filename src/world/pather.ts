import { world } from "./world";
import { extToGridSize, Sector } from "./renderers/sectors/sector";
import { isOverlapping, vec2, type Vector2 } from "littlejsengine";
import { AStarFinder } from "astar-typescript";
import type { V2 } from "../core/types/simple-vector-2.types";
import { f2dmk } from "./world.types";

export class Pather {
  /** The scale to convert astar cells ("obstacles") to world cells */
  astarToWorldScale = 3;

  /** The size of the square astar grid/matrix when covering the world config's pathing extent (multiple sectors)*/
  astarGridSize = 0;

  /** The sector which has the astar grid origin at its top left */
  astarOriginSector: Vector2 = vec2(0);

  /** The astar lib loaded with obstacles, ready to be queried for paths */
  astar = new AStarFinder({ grid: { width: 0, height: 0 } });

  /** init/refresh astar grid, usually when passing from sector to sector */
  refresh(): void {
    this.astarGridSize =
      extToGridSize(world.wc.sectorPathingExtent) *
      world.sectorSize *
      this.astarToWorldScale;

    this.astarOriginSector = world.centerSectorVector.add(
      vec2(-1, 1).scale(world.wc.sectorPathingExtent),
    );

    // 2d matrix
    const matrix = Array.from({ length: this.astarGridSize }, () =>
      new Array(this.astarGridSize).fill(0),
    );

    const upper = world.wc.sectorPathingExtent;
    const lower = -upper;
    for (let y = upper; y >= lower; y--) {
      for (let x = lower; x <= upper; x++) {
        const sectorVector = world.centerSectorVector.add(vec2(x, y));
        const sector = Sector.getOrCreateSector(sectorVector);
        for (const [sx, sy] of sector.obstacles) {
          // sx,sy: sectorX, sectorY
          const sectorOffset = this.astarOriginSector
            .subtract(sector.pos)
            .abs();
          // ax, ay: astarGridX, astarGridY
          const ax =
            sectorOffset.x * world.sectorSize * this.astarToWorldScale + sx;
          const ay =
            sectorOffset.y * world.sectorSize * this.astarToWorldScale + sy;
          matrix[ay][ax] = 1;
        }
      }
    }

    this.astar = new AStarFinder({ grid: { matrix } });
  }

  /** Returns a series of world coordinates to get from pos a to pos b */
  getPath(posA: Vector2, posB: Vector2): Vector2[] | undefined {
    // michael: improve: avoid exhaustive searches maybe with timeout (e.g. for islands)
    const astarPosA = this.worldToAstar(posA);
    const astarPosB = this.worldToAstar(posB);

    if (!astarPosA || !astarPosB) return undefined;

    let astarPath: number[][] | undefined;
    try {
      astarPath = this.astar.findPath(astarPosA, astarPosB);
    } catch (e) {
      console.log(e);
    }
    return astarPath?.map(
      ([astarX, astarY]) => this.astarToWorld(vec2(astarX, astarY))!,
    );
  }

  worldToAstar(worldPos: Vector2): Vector2 | undefined {
    // check out of bounds
    const outOfBounds = !isOverlapping(
      world.sectors.get(f2dmk(world.centerSectorVector))!.worldPos,
      vec2(world.sectorSize * extToGridSize(world.wc.sectorPathingExtent)),
      worldPos,
    );
    if (outOfBounds) return undefined;

    // avoid exhaustive search if possible
    // water is not pathable
    const cell = world.getCell(worldPos);
    if (cell.cliffHeight < 1) {
      return undefined;
    }

    const sExt = world.wc.sectorExtent;
    const astarOriginWorldPos = this.astarOriginSector
      .scale(world.sectorSize) // center of sector world pos
      .add(vec2(-sExt, sExt)) // top left cell world pos
      .add(vec2(-1, 1).scale(1 / 3)); // top left astar grid (obstacle) of cell world pos
    const rough = worldPos.subtract(astarOriginWorldPos).abs().scale(3);
    let astarPos: Vector2 | undefined = vec2(
      Math.round(rough.x),
      Math.round(rough.y),
    );

    // if pos is obstacle swap for nearby alternative
    // const sector = world.sectors.get(
    //   f2dmk(worldToSector(worldPos, world.wc.sectorExtent)),
    // );
    if (
      !this.astar.getGrid().isWalkableAt(astarPos) &&
      astarPos.distance(cell.pos) > 0
    ) {
      astarPos = this.worldToAstar(cell.pos);
    }

    return astarPos;
  }

  astarToWorld(astarPos: Vector2): Vector2 | undefined {
    const outOfBounds = !astarPos.arrayCheck(vec2(this.astarGridSize));
    if (outOfBounds) return undefined;

    const sExt = world.wc.sectorExtent;
    const astarOriginWorldPos = this.astarOriginSector
      .scale(world.sectorSize) // center of sector world pos
      .add(vec2(-sExt, sExt)) // top left cell world pos
      .add(vec2(-1, 1).scale(1 / 3)); // top left astar grid (obstacle) of cell world pos
    return astarOriginWorldPos.add(vec2(astarPos.x, -astarPos.y).scale(1 / 3));
  }
}

export const pather = new Pather();

/** transform in-place */
export function cellObsToSectorObs(
  cellObs: V2[],
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
