import { enumerationFactory } from "../core/enumeration-factory";

export const GameInputs = enumerationFactory(
  "moveLeft",
  "moveRight",
  "moveUp",
  "moveDown",
);
export type GameInput = ReturnType<typeof GameInputs.values>[number];
