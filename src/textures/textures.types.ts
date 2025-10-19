export const textures = [
  {
    id: "empty",
    src: "empty.png",
    frames: 1,
    size: 32,
  },
  {
    id: "units.warrior.idling",
    src: "units/warrior/Warrior_Idle.png",
    frames: 8,
    size: 192,
  },
  {
    id: "units.warrior.moving",
    src: "units/warrior/Warrior_Run.png",
    frames: 6,
    size: 192,
  },
  {
    id: "units.lancer.idling",
    src: "units/lancer/Lancer_Idle.png",
    frames: 12,
    size: 320,
  },
  {
    id: "units.lancer.moving",
    src: "units/lancer/Lancer_Run.png",
    frames: 6,
    size: 320,
  },
  {
    id: "units.spider.idling",
    src: "units/spider/Spider_Idle.png",
    frames: 8,
    size: 192,
  },
  {
    id: "units.spider.moving",
    src: "units/spider/Spider_Run.png",
    frames: 5,
    size: 192,
  },
] as const;

export type TextureId = (typeof textures)[number]["id"];
