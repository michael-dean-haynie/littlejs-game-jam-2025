export const textures = [
  "terrain/Tilemap_color1.png",
  "terrain/Tilemap_color2.png",
  "terrain/Tilemap_color3.png",
  "terrain/Tilemap_color4.png",
  "terrain/Tilemap_color5.png",
  "terrain/Water_Background_color.png",
  "units/warrior/Warrior_Idle.png",
  "units/warrior/Warrior_Run.png",
  "units/warrior/Warrior_Guard.png",
  "units/warrior/Warrior_Attack1.png",
  "units/warrior/Warrior_Attack2.png",
  "units/lancer/Lancer_Idle.png",
  "units/lancer/Lancer_Run.png",
  "units/lancer/Lancer_Up_Defence.png",
  "units/lancer/Lancer_UpRight_Defence.png",
  "units/lancer/Lancer_Right_Defence.png",
  "units/lancer/Lancer_DownRight_Defence.png",
  "units/lancer/Lancer_Down_Defence.png",
  "units/lancer/Lancer_Up_Attack.png",
  "units/lancer/Lancer_UpRight_Attack.png",
  "units/lancer/Lancer_Right_Attack.png",
  "units/lancer/Lancer_DownRight_Attack.png",
  "units/lancer/Lancer_Down_Attack.png",
  "units/spider/Spider_Idle.png",
  "units/spider/Spider_Run.png",
  "units/spider/Spider_Attack.png",
  "empty.png",
] as const satisfies string[];
export type Texture = (typeof textures)[number];

export const terrainTextures = [
  "terrain/Tilemap_color1.png",
  "terrain/Tilemap_color2.png",
  "terrain/Tilemap_color3.png",
  "terrain/Tilemap_color4.png",
  "terrain/Tilemap_color5.png",
] as const satisfies Texture[];
export type TerrainTexture = (typeof terrainTextures)[number];
