import type { Observable } from "rxjs";
import type { IGameInputCommand } from "../game-inputs/game-input.types";

export const INPUT_MANAGER_TOKEN = "INPUT_MANAGER_TOKEN" as const;

export interface IInputManager {
  commands$: Observable<IGameInputCommand>;

  /** Most inputs are processed during browser events. This is for input that should happen frame by frame. */
  triggerFrameDrivenInputs(): void;
}
