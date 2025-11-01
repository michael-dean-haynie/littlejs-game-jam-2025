import type { SpriteSheet } from "../sprite-sheet.types";

export const warriorSpriteSheets = [
  {
    id: "units.warrior.idling",
    texture: "units/warrior/Warrior_Idle.png",
    frames: 8,
    frameSize: 192,
  },
  {
    id: "units.warrior.moving",
    texture: "units/warrior/Warrior_Run.png",
    frames: 6,
    frameSize: 192,
  },
  {
    id: "units.warrior.guard",
    texture: "units/warrior/Warrior_Guard.png",
    frames: 6,
    frameSize: 192,
  },
  {
    id: "units.warrior.attack1",
    texture: "units/warrior/Warrior_Attack1.png",
    frames: 4,
    frameSize: 192,
    omitFrames: [0, 1],
  },
  {
    id: "units.warrior.attack2",
    texture: "units/warrior/Warrior_Attack2.png",
    frames: 4,
    frameSize: 192,
    omitFrames: [0, 1],
  },
] as const satisfies SpriteSheet[];

export type WarriorSpriteSheetId = (typeof warriorSpriteSheets)[number]["id"];
