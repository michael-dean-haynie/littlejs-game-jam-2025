import { enumerationFactory } from "../../core/enumeration-factory";
import type {
  Message,
  MessagePostProcessAction,
} from "../../messages/messages.types";

export const UnitStates = enumerationFactory(
  "idling",
  "moving",
  "staggering",
  "dying",
  "dead",
  "casting", // ... an ability
);
export type UnitState = ReturnType<typeof UnitStates.values>[number];

export interface IUnitState {
  state: UnitState;
  onEnter(): void;
  onExit(): void;
  onUpdate(): void;
  processMessage(message: Message): MessagePostProcessAction;
}
