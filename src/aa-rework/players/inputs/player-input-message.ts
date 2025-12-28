import { type CreateUnitMessage } from "./create-unit-message";
import { type DestroyUnitMessage } from "./destroy-unit-message";

export const PlayerInputMessageTypes = ["createUnit", "destroyUnit"] as const;
/** Some sort of intention/action taken by a Player to interact with the game. */
export type PlayerInputMessageType = (typeof PlayerInputMessageTypes)[number];

export type PlayerInputMessage = CreateUnitMessage | DestroyUnitMessage;
