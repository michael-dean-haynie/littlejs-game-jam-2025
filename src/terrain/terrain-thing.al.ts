import { inject } from "inversify";
import { Autoloadable } from "../core/autoload/autoloadable";
import {
  rampDirections,
  TERRAIN_THING_TOKEN,
  type ITerrainThing,
  type RampDirection,
  type TerrainConfig,
} from "./terrain-thing.types";
import { LJS_TOKEN } from "../littlejsengine/littlejsengine.token";
import type { ILJS } from "../littlejsengine/littlejsengine.impure";
import { RED, rgb, vec2 } from "../littlejsengine/littlejsengine.pure";
import {
  type CanvasLayer,
  type Color,
  type Vector2,
} from "../littlejsengine/littlejsengine.types";
import { LitOverlay } from "../lit/components/lit-overlay.al";
import { tap } from "rxjs";
import { generateNoiseMap } from "../noise/generate-noise-map";
import {
  sectorExtent,
  sectorSize,
  coordToKey,
  sectorToWorld,
  worldToSector,
} from "../world/sector.types";
import { noCap } from "../core/util/no-cap";
import type { OrdinalDirection } from "../core/types/directions.types";
import {
  mkRampTile,
  mkTerrainTile,
} from "../textures/tile-sheets/terrain/mk-terrain-tile";
import { textureIndexMap } from "../textures/texture-index-map";
import { cliffIdxHeightMap } from "./cliff-idx-height-map";
import {
  BOX2D_OBJECT_ADAPTER_FACTORY_TOKEN,
  type IBox2dObjectAdapterFactory,
} from "../littlejsengine/box2d/box2d-object-adapter/box2d-object-adapter-factory.types";
import { mkTile } from "../textures/tile-sheets/mk-tile";
import type { IBox2dObjectAdapter } from "../littlejsengine/box2d/box2d-object-adapter/box2d-object-adapter.types";

// michael: doc: alea and simplex noise packages
@Autoloadable({
  serviceIdentifier: TERRAIN_THING_TOKEN,
})
export class TerrainThing implements ITerrainThing {
  private readonly _ljs: ILJS;
  private readonly _box2dObjectAdapterFactory: IBox2dObjectAdapterFactory;

  private _litOverlay!: LitOverlay;

  private _terrainConfig!: TerrainConfig;

  private readonly _sectorNoiseMaps = new Map<string, number[][]>();
  private readonly _cliffsMap = new Map<string, OrdinalDirection[]>();
  private readonly _rampsMap = new Map<string, RampDirection>();
  private readonly _sectorCollisionsMap = new Map<
    string,
    IBox2dObjectAdapter[]
  >();
  private readonly _sectorCanvasLayers = new Map<string, CanvasLayer>();

  constructor(
    @inject(LJS_TOKEN) ljs: ILJS,
    @inject(BOX2D_OBJECT_ADAPTER_FACTORY_TOKEN)
    box2dObjectAdapterFactory: IBox2dObjectAdapterFactory,
  ) {
    this._ljs = ljs;
    this._box2dObjectAdapterFactory = box2dObjectAdapterFactory;

    this._terrainConfig = {
      paintTerrain: true,
      useTiles: true,
      cameraZoom: 147,
      extent: 3,
      seed: 3851,
      scale: 184,
      octaves: 4,
      persistance: 0.56,
      lacunarity: 3.2,
      offsetX: -2,
      offsetY: 1,
      cliffHeightBounds: [0.17, 0.33, 0.5, 0.67, 0.83],
      clamp: 0.37,
    };
  }

  init(): void {
    this._initLitOverlay();
  }

  /** Convert continuous values (0 - 1) into discrete buckets */
  private _quantize(value: number): number {
    const bounds = this._terrainConfig.cliffHeightBounds;
    const upperBoundIdx = bounds.findIndex((bound) => value <= bound);
    return upperBoundIdx === -1 ? bounds.length : upperBoundIdx;
  }

  private readonly _terrainTextureIdxs: number[] = [];
  get terrainTextureIdxs(): number[] {
    if (this._terrainTextureIdxs.length === 0) {
      this._terrainTextureIdxs.push(
        textureIndexMap["terrain/Tilemap_color1.png"],
        textureIndexMap["terrain/Tilemap_color2.png"],
        textureIndexMap["terrain/Tilemap_color3.png"],
        textureIndexMap["terrain/Tilemap_color4.png"],
        textureIndexMap["terrain/Tilemap_color5.png"],
      );
    }
    return this._terrainTextureIdxs;
  }

  private readonly _terrainColors: Color[] = [
    rgb(0.255, 0.412, 0.882), // 0: Royal Blue (water/ocean)
    rgb(0.933, 0.839, 0.686), // 1: Peach Puff (sandy beach)
    rgb(0.133, 0.545, 0.133), // 2: Forest Green (trees/forest)
    rgb(0.545, 0.537, 0.537), // 3: Gray (rocky mountains)
    rgb(1.0, 0.98, 0.98), // 4: Snow White (snow caps)
  ];

  // michael: todo: organize units, relations between noise map, world space, screen space terrain grid, tile size, unit size etc.
  render(): void {
    this._ljs.setCameraScale(this._terrainConfig.cameraZoom);

    // canvas layers render on their own
  }

  private _rebuildCanvasLayers(): void {
    for (const layer of this._sectorCanvasLayers.values()) {
      layer.destroy();
    }

    const upper = this._terrainConfig.extent;
    const lower = -upper;

    // note: need to draw from top to bottom (back to front) so projection offsets don't get jacked
    for (let y = upper; y >= lower; y--) {
      for (let x = lower; x <= upper; x++) {
        const sector = vec2(x, y);
        this._buildSectorCanvasLayer(sector);
      }
    }
  }

  private _buildSectorCanvasLayer(sector: Vector2): void {
    const sectorCenter = sectorToWorld(sector);
    const canvasLayer = new this._ljs.CanvasLayer(
      sectorCenter,
      vec2(sectorSize),
      0,
      0,
      vec2(sectorSize).scale(64),
    );
    canvasLayer.tileInfo = new this._ljs.TileInfo(
      vec2(0),
      vec2(64),
      textureIndexMap["empty.png"],
      0,
    );

    // note: extending lower range for y to render tiles from lower sector that have cliff height into this sector
    const upper = sectorExtent;
    const lower = -upper;
    const bounds = this._terrainConfig.cliffHeightBounds.length;

    // note: need to draw from top to bottom (back to front) so projection offsets don't get jacked
    for (let y = upper; y >= lower - bounds; y--) {
      for (let x = lower; x <= upper; x++) {
        const worldPos = sectorCenter.add(vec2(x, y));
        const canvasPos = worldPos.add(vec2(sectorSize / 2));
        const cliffIdx = this.getCliffIdx(worldPos);
        const cliffHeight = cliffIdxHeightMap[cliffIdx];

        // get the simple color rect mode out of the way
        if (!this._terrainConfig.useTiles) {
          canvasLayer.drawRect(
            vec2(canvasPos.x, canvasPos.y + cliffHeight),
            vec2(1),
            this._terrainColors[cliffIdx],
          );
          continue;
        }

        // render with tiles

        // render ramps
        const { x: csx, y: csy } = canvasPos;
        const rampDir: RampDirection | undefined = this._rampsMap.get(
          coordToKey(worldPos),
        );

        if (rampDir !== undefined) {
          // bottom half
          canvasLayer.drawTile(
            vec2(csx, csy + cliffHeight),
            vec2(1),
            mkTerrainTile([], cliffIdx, false, false, this._ljs),
          );
          canvasLayer.drawTile(
            vec2(csx, csy + cliffHeight),
            vec2(1),
            mkRampTile(rampDir, cliffIdx, this._ljs),
          );

          // top half
          canvasLayer.drawTile(
            vec2(csx, csy + 1 + cliffHeight),
            vec2(1),
            mkRampTile(rampDir, cliffIdx, this._ljs, true),
          );
          continue; // no need to check for cliff stuff (hopefully?)
        }

        // render cliffs
        const rampToWest =
          this._rampsMap.get(coordToKey(worldPos.add(vec2(-1, 0)))) === "e";
        const rampToEast =
          this._rampsMap.get(coordToKey(worldPos.add(vec2(1, 0)))) === "w";

        const cliffs = this._cliffsMap.get(coordToKey(worldPos)) ?? [];
        const nc = cliffs.includes("n");
        const sc = cliffs.includes("s");

        if (cliffs.length) {
          const lowerLevelTile = mkTerrainTile(
            [],
            cliffIdx - 1,
            false,
            false,
            this._ljs,
          );

          // start with tile of height below to show around cliff face
          canvasLayer.drawTile(
            vec2(csx, csy + cliffHeight),
            vec2(1),
            lowerLevelTile,
          );

          // lower cliff level to north
          if (nc) {
            canvasLayer.drawTile(
              vec2(csx, csy + cliffHeight),
              vec2(1),
              lowerLevelTile,
            );
          }

          if (sc) {
            // lower cliff level around clif face
            canvasLayer.drawTile(
              vec2(csx, csy + cliffHeight - 1),
              vec2(1),
              lowerLevelTile,
            );

            // cliff face
            const cliffFaceTile = mkTerrainTile(
              cliffs,
              cliffIdx,
              rampToWest,
              rampToEast,
              this._ljs,
              true,
            );
            canvasLayer.drawTile(
              vec2(csx, csy + cliffHeight - 1),
              vec2(1),
              cliffFaceTile,
            );
          }
        }

        canvasLayer.drawTile(
          vec2(csx, csy + cliffHeight),
          vec2(1),
          mkTerrainTile(cliffs, cliffIdx, rampToWest, rampToEast, this._ljs),
        );
      }
    }

    this._sectorCanvasLayers.set(coordToKey(sector), canvasLayer);
  }

  getCliffIdx(pos: Vector2): number {
    return this._quantize(this._getNoiseAtWorldPosition(pos));
  }

  /** This is the projection offset. In screen space units? */
  getCliffHeight(pos: Vector2): number {
    const cliffIdx = this.getCliffIdx(pos);
    return cliffIdxHeightMap[cliffIdx]; // cliff height scale would go here
  }

  getTravelingHeight(pos: Vector2): number {
    const rampDir: RampDirection | undefined = this._rampsMap.get(
      coordToKey(pos),
    );
    if (rampDir === undefined) return this.getCliffHeight(pos);

    let xProg = pos.x - 0.5;
    xProg = xProg - Math.floor(xProg);
    xProg = rampDir === "e" ? xProg : 1 - xProg;
    return this.getCliffHeight(pos) + xProg;
  }

  private _getNoiseAtWorldPosition(pos: Vector2): number {
    // round world position to center of tile
    const worldPos = vec2(Math.round(pos.x), Math.round(pos.y));

    const sector = worldToSector(worldPos);
    const sectorCenter = sectorToWorld(sector);

    const offsetFromSectorCenter = worldPos.subtract(sectorCenter);
    const offsetFromNoiseMapOrigin = offsetFromSectorCenter.add(
      vec2(sectorExtent),
    );
    const { x, y } = offsetFromNoiseMapOrigin;

    const noiseMap = this._sectorNoiseMaps.get(coordToKey(sector));
    noCap.notUndefined(noiseMap);
    return noiseMap[x][y];
  }

  // michael: make this not so hackey
  private _initLitOverlay(): void {
    this._litOverlay = document
      .querySelector("body")
      ?.insertAdjacentElement(
        "beforeend",
        new LitOverlay(this._terrainConfig),
      ) as LitOverlay;

    // this._litOverlay.hidden = true; // start hidden

    this._litOverlay.terrainConfig$
      .pipe(
        tap((tc) => {
          for (const layer of this._sectorCanvasLayers.values()) {
            layer.destroy();
          }
          for (const collision of [
            ...this._sectorCollisionsMap.values(),
          ].flat()) {
            collision.destroy();
          }

          this._terrainConfig = tc;
          this._generateNoiseMaps();
          if (!this._terrainConfig.paintTerrain) return;

          this._generateAllCliffs();
          this._remarkRamps();
          this._rebuildCollisionsMap();
          this._rebuildCanvasLayers();
        }),
      )
      .subscribe();

    window.addEventListener("keydown", (ev: KeyboardEvent) => {
      if (ev.key !== "`") return;
      this._litOverlay.hidden = !this._litOverlay.hidden;
    });
  }

  private _generateNoiseMaps(): void {
    this._sectorNoiseMaps.clear();
    // + 2 for outer edge. won't be rendered but needed for edges of rendered sectors
    // rendering needs cliffs with +1 extent, cliffs need their own +1 extent of noise
    const upper = this._terrainConfig.extent + 2;
    const lower = -upper;

    // note: going top to bottom, left to right in case render order matters or something
    for (let y = upper; y >= lower; y--) {
      for (let x = lower; x <= upper; x++) {
        const sector = vec2(x, y);
        const noiseMap = this._generateNoiseMapForSector(sector);
        this._sectorNoiseMaps.set(coordToKey(sector), noiseMap);
      }
    }
  }

  private _generateNoiseMapForSector(sector: Vector2): number[][] {
    return generateNoiseMap(
      this._terrainConfig.seed,
      sectorSize,
      sectorSize,
      this._terrainConfig.scale,
      this._terrainConfig.octaves,
      this._terrainConfig.persistance,
      this._terrainConfig.lacunarity,
      sectorToWorld(
        sector.add(
          vec2(this._terrainConfig.offsetX, this._terrainConfig.offsetY),
        ),
      ),
      this._terrainConfig.clamp,
    );
  }

  private _generateAllCliffs() {
    this._cliffsMap.clear();

    // + 1 for outer edge. won't be rendered but needed for edges of rendered sectors
    const upper = this._terrainConfig.extent + 1;
    const lower = -upper;

    for (let y = upper; y >= lower; y--) {
      for (let x = lower; x <= upper; x++) {
        const sector = vec2(x, y);
        this._generateSectorCliffs(sector);
      }
    }
  }

  private _generateSectorCliffs(sector: Vector2) {
    const sectorCenter = sectorToWorld(sector);

    const upper = sectorExtent;
    const lower = -upper;

    for (let y = upper; y >= lower; y--) {
      for (let x = lower; x <= upper; x++) {
        const worldPos = sectorCenter.add(vec2(x, y));
        const { x: wsx, y: wsy } = worldPos;
        const cliffIdx = this.getCliffIdx(worldPos);

        // north cliff height ... etc
        const nch = this.getCliffIdx(vec2(wsx, wsy + 1));
        const sch = this.getCliffIdx(vec2(wsx, wsy - 1));
        const wch = this.getCliffIdx(vec2(wsx - 1, wsy));
        const ech = this.getCliffIdx(vec2(wsx + 1, wsy));

        // north edge is cliff ... etc
        const dirs: OrdinalDirection[] = [];
        if (cliffIdx > nch) dirs.push("n");
        if (cliffIdx > sch) dirs.push("s");
        if (cliffIdx > wch) dirs.push("w");
        if (cliffIdx > ech) dirs.push("e");

        if (dirs.length > 0) {
          this._cliffsMap.set(coordToKey(worldPos), dirs);
        }
      }
    }
  }

  private _remarkRamps(): void {
    this._rampsMap.clear();

    const upper = this._terrainConfig.extent;
    const lower = -upper;

    // note: need to draw from top to bottom (back to front) so projection offsets don't get jacked
    for (let y = upper; y >= lower; y--) {
      for (let x = lower; x <= upper; x++) {
        const sector = vec2(x, y);
        this._remarkSectorRamps(sector);
      }
    }
  }

  private _remarkSectorRamps(sector: Vector2): void {
    const sectorCenter = sectorToWorld(sector);

    const upper = sectorExtent;
    const lower = -upper;

    for (let y = upper; y >= lower; y--) {
      for (let x = lower; x <= upper; x++) {
        const worldPos = sectorCenter.add(vec2(x, y));
        const cliffIdx = this.getCliffIdx(worldPos);

        if (cliffIdx < 2) continue; // water and ground grass cannot ramp down

        const cliffs = this._cliffsMap.get(coordToKey(worldPos)) ?? [];
        const rampDirCliffs = cliffs.filter((cliff) =>
          (rampDirections as OrdinalDirection[]).includes(cliff),
        ) as RampDirection[];

        for (const rampDirCliff of rampDirCliffs) {
          if (Math.random() < 0.66) continue;

          let rampPos: Vector2;
          let rampDir: RampDirection;
          switch (rampDirCliff) {
            case "w":
              rampDir = "e";
              rampPos = worldPos.add(vec2(-1, 0));
              break;
            case "e":
              rampDir = "w";
              rampPos = worldPos.add(vec2(1, 0));
              break;
          }

          if (this._rampsMap.get(coordToKey(rampPos)) !== undefined) continue;
          this._rampsMap.set(coordToKey(rampPos), rampDir);
        }
      }
    }
  }

  private _rebuildCollisionsMap(): void {
    for (const b2ObjAdpt of [...this._sectorCollisionsMap.values()].flat()) {
      b2ObjAdpt.destroy();
    }

    const upper = this._terrainConfig.extent;
    const lower = -upper;

    // note: need to draw from top to bottom (back to front) so projection offsets don't get jacked
    for (let y = upper; y >= lower; y--) {
      for (let x = lower; x <= upper; x++) {
        const sector = vec2(x, y);
        this._buildSectorCollisions(sector);
      }
    }
  }

  private _buildSectorCollisions(sector: Vector2): void {
    const sectorCenter = sectorToWorld(sector);
    const collisions: IBox2dObjectAdapter[] = [];
    this._sectorCollisionsMap.set(coordToKey(sector), collisions);

    const upper = sectorExtent;
    const lower = -upper;

    for (let y = upper; y >= lower; y--) {
      for (let x = lower; x <= upper; x++) {
        const worldPos = sectorCenter.add(vec2(x, y));

        const cliffs = this._cliffsMap.get(coordToKey(worldPos)) ?? [];
        if (cliffs.length === 0) continue;
        const rampToWest =
          this._rampsMap.get(coordToKey(worldPos.add(vec2(-1, 0)))) === "e";
        const rampToEast =
          this._rampsMap.get(coordToKey(worldPos.add(vec2(1, 0)))) === "w";

        const offsetScalar: number = 0.4;
        const thickScalar: number = 0.2;

        for (const cliff of cliffs) {
          if (rampToWest && cliff === "w") continue;
          if (rampToEast && cliff === "e") continue;

          let pos = worldPos;
          switch (cliff) {
            case "n":
              pos = pos.add(vec2(0, offsetScalar));
              break;
            case "s":
              pos = pos.add(vec2(0, -offsetScalar));
              break;
            case "w":
              pos = pos.add(vec2(-offsetScalar, 0));
              break;
            case "e":
              pos = pos.add(vec2(offsetScalar, 0));
              break;
          }

          let size: Vector2;
          switch (cliff) {
            case "n":
            case "s":
              size = vec2(1, thickScalar);
              break;
            case "e":
            case "w":
              size = vec2(thickScalar, 1);
              break;
          }

          const b2ObjAdpt =
            this._box2dObjectAdapterFactory.createBox2dObjectAdapter(
              pos,
              size,
              // mkTile("terrain.water", this._ljs),
              mkTile("empty", this._ljs),
              0,
              RED,
              this._ljs.box2d.bodyTypeStatic,
            );
          b2ObjAdpt.addBox(size);
          b2ObjAdpt.drawSize = size;
          collisions.push(b2ObjAdpt);
        }
      }
    }
  }
}
