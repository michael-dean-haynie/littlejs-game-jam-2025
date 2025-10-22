export const TERRAIN_THING_TOKEN = "TERRAIN_THING_TOKEN" as const;

export type ITerrainThing = {
  doTheThing(): void;
};
