import type { SpriteSheet } from "../sprite-sheet.types";
import { lancerSpriteSheets } from "./lancer.types";
import { skullSpriteSheets } from "./skull.types";
import { spiderSpriteSheets } from "./spider.types";
import { warriorSpriteSheets } from "./warrior.types";

export const unitSpriteSheets = [
  ...warriorSpriteSheets,
  ...lancerSpriteSheets,
  ...spiderSpriteSheets,
  ...skullSpriteSheets,
  {
    id: "units.empty",
    texture: "empty.png",
    frames: 1,
    frameSize: 32,
  },
] as const satisfies SpriteSheet[];

export type UnitSpriteSheetId = (typeof unitSpriteSheets)[number]["id"];
