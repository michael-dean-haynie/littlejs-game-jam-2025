import type { Vector2 } from "../littlejsengine/littlejsengine.types";

export type UnitMessage =
  | UnitMoveMessage
  | UnitFacePositionMessage
  | UnitFaceDirectionMessage;

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
