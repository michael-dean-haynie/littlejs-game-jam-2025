import type {
  Message,
  MessagePostProcessAction,
} from "../../messages/messages.types";

export const UnitStates = [
  "idling",
  "moving",
  "staggering",
  "dying",
  "dead",
  "casting", // ... an ability
] as const;
export type UnitState = (typeof UnitStates)[number];

export interface IUnitState {
  state: UnitState;
  onEnter(): void;
  onExit(): void;
  onUpdate(): void;
  processMessage(message: Message): MessagePostProcessAction;
}
