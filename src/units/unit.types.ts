import { enumerationFactory } from "../core/enumeration-factory";

export const UnitTypes = enumerationFactory(
  "warrior",
  "lancer",
  "archer",
  "monk",
  "snake",
  "shaman",
  "paddleFish",
  "spider",
  "troll",
  "gnoll",
  "lizard",
  "goblin",
  "thief",
  "gnome",
  "minotaur",
  "panda",
  "bear",
  "turtle",
  "harpoonFish",
  "skull",
);
export type UnitType = ReturnType<typeof UnitTypes.values>[number];
