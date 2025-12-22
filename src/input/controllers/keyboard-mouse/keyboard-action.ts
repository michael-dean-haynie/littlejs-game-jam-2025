import type { KbmControlEvent } from "./keyboard-control";

/**
 * An abstract action invoked by keyboard/mouse.
 * Serves as a configurable bridge from physical controls to game commands.
 * NOT a 1:1 mapping to game commands
 */
export const KbmActions = [
  "moveLeft",
  "moveRight",
  "moveUp",
  "moveDown",
  "guard",
  "attack",
] as const;

/**
 * An abstract action invoked by keyboard/mouse.
 * Serves as a configurable bridge from physical controls to game commands.
 * NOT a 1:1 mapping to game commands
 */
export type KbmAction = (typeof KbmActions)[number];

export const KbmMovementActions = [
  "moveLeft",
  "moveRight",
  "moveUp",
  "moveDown",
] as const satisfies KbmAction[];

export type KbmMovementAction = (typeof KbmMovementActions)[number];

export type KbmActionEvent = {
  action: KbmAction;
  ctrlEvent: KbmControlEvent;
};
