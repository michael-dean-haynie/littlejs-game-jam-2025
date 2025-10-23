import type { AnimationTexture } from "./textures.types";

export type UnitAnimationTextureId =
  (typeof unitAnimationTextures)[number]["id"];

export const unitAnimationTextures = [
  /////////////////////////////////////////////////////////////////////////////////////////////
  // empty
  /////////////////////////////////////////////////////////////////////////////////////////////
  {
    id: "units.empty",
    src: "empty.png",
    offset: 0,
    frames: 1,
    size: 32,
  },
  /////////////////////////////////////////////////////////////////////////////////////////////
  // warrior
  /////////////////////////////////////////////////////////////////////////////////////////////
  {
    id: "units.warrior.idling",
    src: "units/warrior/Warrior_Idle.png",
    offset: 0,
    frames: 8,
    size: 192,
  },
  {
    id: "units.warrior.moving",
    src: "units/warrior/Warrior_Run.png",
    offset: 0,
    frames: 6,
    size: 192,
  },
  {
    id: "units.warrior.guard",
    src: "units/warrior/Warrior_Guard.png",
    offset: 0,
    frames: 6,
    size: 192,
  },
  {
    id: "units.warrior.attack1",
    src: "units/warrior/Warrior_Attack1.png",
    offset: 2,
    frames: 2,
    size: 192,
  },
  {
    id: "units.warrior.attack2",
    src: "units/warrior/Warrior_Attack2.png",
    offset: 2,
    frames: 2,
    size: 192,
  },
  /////////////////////////////////////////////////////////////////////////////////////////////
  // lancer
  /////////////////////////////////////////////////////////////////////////////////////////////
  {
    id: "units.lancer.idling",
    src: "units/lancer/Lancer_Idle.png",
    offset: 0,
    frames: 12,
    size: 320,
  },
  {
    id: "units.lancer.moving",
    src: "units/lancer/Lancer_Run.png",
    offset: 0,
    frames: 6,
    size: 320,
  },
  {
    id: "units.lancer.guardUp",
    src: "units/lancer/Lancer_Up_Defence.png",
    offset: 0,
    frames: 6,
    size: 320,
  },
  {
    id: "units.lancer.guardUpRight",
    src: "units/lancer/Lancer_UpRight_Defence.png",
    offset: 0,
    frames: 6,
    size: 320,
  },
  {
    id: "units.lancer.guardRight",
    src: "units/lancer/Lancer_Right_Defence.png",
    offset: 0,
    frames: 6,
    size: 320,
  },
  {
    id: "units.lancer.guardDownRight",
    src: "units/lancer/Lancer_DownRight_Defence.png",
    offset: 0,
    frames: 6,
    size: 320,
  },
  {
    id: "units.lancer.guardDown",
    src: "units/lancer/Lancer_Down_Defence.png",
    offset: 0,
    frames: 6,
    size: 320,
  },
  {
    id: "units.lancer.attackUp",
    src: "units/lancer/Lancer_Up_Attack.png",
    offset: 0,
    frames: 3,
    size: 320,
  },
  {
    id: "units.lancer.attackUpRight",
    src: "units/lancer/Lancer_UpRight_Attack.png",
    offset: 0,
    frames: 3,
    size: 320,
  },
  {
    id: "units.lancer.attackRight",
    src: "units/lancer/Lancer_Right_Attack.png",
    offset: 0,
    frames: 3,
    size: 320,
  },
  {
    id: "units.lancer.attackDownRight",
    src: "units/lancer/Lancer_DownRight_Attack.png",
    offset: 0,
    frames: 3,
    size: 320,
  },
  {
    id: "units.lancer.attackDown",
    src: "units/lancer/Lancer_Down_Attack.png",
    offset: 0,
    frames: 3,
    size: 320,
  },
  /////////////////////////////////////////////////////////////////////////////////////////////
  // spider
  /////////////////////////////////////////////////////////////////////////////////////////////
  {
    id: "units.spider.idling",
    src: "units/spider/Spider_Idle.png",
    offset: 0,
    frames: 8,
    size: 192,
  },
  {
    id: "units.spider.moving",
    src: "units/spider/Spider_Run.png",
    offset: 0,
    frames: 5,
    size: 192,
  },
  {
    id: "units.spider.attack",
    src: "units/spider/Spider_Attack.png",
    offset: 0,
    frames: 8,
    size: 192,
  },
] as const satisfies AnimationTexture[];
