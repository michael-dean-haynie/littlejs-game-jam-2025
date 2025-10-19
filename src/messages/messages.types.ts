import { enumerationFactory } from "../core/enumeration-factory";
import type { UnitMessage } from "../units/unit-messages.types";

export type Message = UnitMessage;

export type MessageId = Message["id"];

export const MessagePostProcessActions = enumerationFactory(
  "none",
  "skip", // will process again next game tick
  "requeue", // will process again this game tick (probably by different state)
);
export type MessagePostProcessAction = ReturnType<
  typeof MessagePostProcessActions.values
>[number];
