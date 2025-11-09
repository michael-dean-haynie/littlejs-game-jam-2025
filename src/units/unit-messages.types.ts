import type { Vector2 } from "littlejsengine";
import type { Ability } from "../abilities/abilities.types";

export type UnitMessage =
  | UnitMoveMessage
  | UnitFacePositionMessage
  | UnitFaceDirectionMessage
  | UnitCastMessage
  | UnitToggleCastMessage;

export type UnitMessageId = UnitMessage["id"];

export type UnitMoveMessage = {
  id: "unit.move";
  direction: Vector2;
};
export function createUnitMoveMessage(direction: Vector2): UnitMoveMessage {
  return {
    id: "unit.move",
    direction: direction.length() === 0 ? direction : direction.normalize(),
  };
}

export type UnitFacePositionMessage = {
  id: "unit.facePosition";
  /** The world position to face */
  position: Vector2;
};

export type UnitFaceDirectionMessage = {
  id: "unit.faceDirection";
  direction: Vector2;
};

export type UnitCastMessage = {
  id: "unit.cast";
  ability: Ability;
};

export type UnitToggleCastMessage = {
  id: "unit.toggleCast";
  ability: Ability;
};
