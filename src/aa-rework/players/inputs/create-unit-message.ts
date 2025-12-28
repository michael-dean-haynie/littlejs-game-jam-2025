import type { Message } from "../../messages/mesage";
import type { UnitType } from "../../units/unit-type";
import type { PlayerInputMessageType } from "./player-input-message";

export class CreateUnitMessage implements Message<PlayerInputMessageType> {
  readonly type = "createUnit" as const;

  constructor(public readonly unitType: UnitType) {}
}
