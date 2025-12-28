import type { KbmControlEvent } from "./keyboard-control";

/**
 * An abstract action invoked by keyboard/mouse.
 * Serves as a configurable bridge from physical controls to abstract intentions.
 * NOT a 1:1 mapping.
 */
export const KbmActions = [
  "moveLeft",
  "moveRight",
  "moveUp",
  "moveDown",
  "guard",
  "attack",
  "toggleInGameMenu",
] as const;

/**
 * An abstract action invoked by keyboard/mouse.
 * Serves as a configurable bridge from physical controls to abstract intentions.
 * NOT a 1:1 mapping.
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
