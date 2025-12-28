/** These are the inputs for the keyboard that users can map to particular keys via a profile */
export const keyboardInputs = [
  "moveLeft",
  "moveRight",
  "moveUp",
  "moveDown",
  "guard",
  "attack",
] as const;

/** These are the inputs for the keyboard that users can map to particular keys via a profile */
export type KeyboardInput = (typeof keyboardInputs)[number];
