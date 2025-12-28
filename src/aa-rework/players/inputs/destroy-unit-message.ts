import type { GameState } from "../../game/game-state/game-state";
import type { Message } from "../../messages/mesage";
import type { Unit } from "../../units/unit";
import type { Player } from "../player";
import type { PlayerInputMessageType } from "./player-input-message";

// prolly not needed, just examle for now?
export class DestroyUnitMessage implements Message<PlayerInputMessageType> {
  readonly type = "destroyUnit";

  constructor(
    public readonly srcPlayer: Player,
    public readonly tgtUnit: Unit,
  ) {}
}

export function handleDestroyUnit(
  message: DestroyUnitMessage,
  context: GameState,
): void {
  console.log(message);
  console.log(context);
}
