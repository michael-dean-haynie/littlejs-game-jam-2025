/** These are abstract actions that the game logic understands */
export const InputActions = [
  "move",
  "faceDirection",
  "facePosition",
  "guardToggle",
  "attack",
];
export type InputAction = (typeof InputActions)[number];
