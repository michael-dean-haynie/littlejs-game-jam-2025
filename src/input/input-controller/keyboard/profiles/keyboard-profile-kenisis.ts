import type { KeyboardProfile } from "../keyboard-controller.types";

export const keyboardProfileKenisis: KeyboardProfile = {
  moveLeft: [
    { key: "s", holdOrToggle: "hold" },
    { key: "arrowleft", holdOrToggle: "hold" },
  ],
  moveRight: [
    { key: "f", holdOrToggle: "hold" },
    { key: "arrowright", holdOrToggle: "hold" },
  ],
  moveUp: [
    { key: "e", holdOrToggle: "hold" },
    { key: "arrowup", holdOrToggle: "hold" },
  ],
  moveDown: [
    { key: "d", holdOrToggle: "hold" },
    { key: "arrowdown", holdOrToggle: "hold" },
  ],
  attack: [{ key: "mouse0" }],
  guard: [{ key: "mouse2", holdOrToggle: "hold" }],
};
