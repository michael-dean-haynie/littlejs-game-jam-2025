import type { UnitMessage } from "../units/unit-messages.types";

export type Message = UnitMessage;

export type MessageId = Message["id"];

export const MessagePostProcessActions = [
  "none",
  "defer", // will process again next game tick
  "requeue", // will process again this game tick (probably by different state)
];
export type MessagePostProcessAction =
  (typeof MessagePostProcessActions)[number];
