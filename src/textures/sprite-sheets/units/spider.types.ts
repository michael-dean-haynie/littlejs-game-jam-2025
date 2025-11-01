import type { SpriteSheet } from "../sprite-sheet.types";

export const spiderSpriteSheets = [
  {
    id: "units.spider.idling",
    texture: "units/spider/Spider_Idle.png",
    frames: 8,
    frameSize: 192,
  },
  {
    id: "units.spider.moving",
    texture: "units/spider/Spider_Run.png",
    frames: 5,
    frameSize: 192,
  },
  {
    id: "units.spider.attack",
    texture: "units/spider/Spider_Attack.png",
    frames: 8,
    frameSize: 192,
  },
] as const satisfies SpriteSheet[];
