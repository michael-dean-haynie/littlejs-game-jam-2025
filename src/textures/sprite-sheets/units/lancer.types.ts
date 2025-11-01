import type { SpriteSheet } from "../sprite-sheet.types";

export const lancerSpriteSheets = [
  {
    id: "units.lancer.idling",
    texture: "units/lancer/Lancer_Idle.png",
    frames: 12,
    frameSize: 320,
  },
  {
    id: "units.lancer.moving",
    texture: "units/lancer/Lancer_Run.png",
    frames: 6,
    frameSize: 320,
  },
  {
    id: "units.lancer.guardUp",
    texture: "units/lancer/Lancer_Up_Defence.png",
    frames: 6,
    frameSize: 320,
  },
  {
    id: "units.lancer.guardUpRight",
    texture: "units/lancer/Lancer_UpRight_Defence.png",
    frames: 6,
    frameSize: 320,
  },
  {
    id: "units.lancer.guardRight",
    texture: "units/lancer/Lancer_Right_Defence.png",
    frames: 6,
    frameSize: 320,
  },
  {
    id: "units.lancer.guardDownRight",
    texture: "units/lancer/Lancer_DownRight_Defence.png",
    frames: 6,
    frameSize: 320,
  },
  {
    id: "units.lancer.guardDown",
    texture: "units/lancer/Lancer_Down_Defence.png",
    frames: 6,
    frameSize: 320,
  },
  {
    id: "units.lancer.attackUp",
    texture: "units/lancer/Lancer_Up_Attack.png",
    frames: 3,
    frameSize: 320,
  },
  {
    id: "units.lancer.attackUpRight",
    texture: "units/lancer/Lancer_UpRight_Attack.png",
    frames: 3,
    frameSize: 320,
  },
  {
    id: "units.lancer.attackRight",
    texture: "units/lancer/Lancer_Right_Attack.png",
    frames: 3,
    frameSize: 320,
  },
  {
    id: "units.lancer.attackDownRight",
    texture: "units/lancer/Lancer_DownRight_Attack.png",
    frames: 3,
    frameSize: 320,
  },
  {
    id: "units.lancer.attackDown",
    texture: "units/lancer/Lancer_Down_Attack.png",
    frames: 3,
    frameSize: 320,
  },
] as const satisfies SpriteSheet[];
