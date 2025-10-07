import type { GameInput } from "./game-input.types";

export const INPUT_MANAGER_TOKEN = "INPUT_MANAGER_TOKEN" as const;

export interface IInputManager {
  buffer: ReadonlyArray<GameInput>;
  clearBuffer(): void;
}
