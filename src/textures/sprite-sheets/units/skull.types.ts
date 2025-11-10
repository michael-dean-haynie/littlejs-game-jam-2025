import type { SpriteSheet } from "../sprite-sheet.types";

export const skullSpriteSheets = [
  {
    id: "units.skull.idling",
    texture: "units/skull/Skull_Idle.png",
    frames: 8,
    frameSize: 192,
  },
  {
    id: "units.skull.moving",
    texture: "units/skull/Skull_Run.png",
    frames: 6,
    frameSize: 192,
  },
  {
    id: "units.skull.guard",
    texture: "units/skull/Skull_Guard.png",
    frames: 7,
    frameSize: 192,
  },
  {
    id: "units.skull.attack",
    texture: "units/skull/Skull_Attack.png",
    frames: 7,
    frameSize: 192,
  },
] as const satisfies SpriteSheet[];

export type WarriorSpriteSheetId = (typeof skullSpriteSheets)[number]["id"];
