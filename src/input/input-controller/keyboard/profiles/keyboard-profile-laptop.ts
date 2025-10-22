import type { KeyboardProfile } from "../keyboard-controller.types";

export const keyboardProfileLaptop: KeyboardProfile = {
  moveLeft: [
    { key: "a", holdOrToggle: "hold" },
    { key: "arrowleft", holdOrToggle: "hold" },
  ],
  moveRight: [
    { key: "d", holdOrToggle: "hold" },
    { key: "arrowright", holdOrToggle: "hold" },
  ],
  moveUp: [
    { key: "w", holdOrToggle: "hold" },
    { key: "arrowup", holdOrToggle: "hold" },
  ],
  moveDown: [
    { key: "s", holdOrToggle: "hold" },
    { key: "arrowdown", holdOrToggle: "hold" },
  ],
  attack: [{ key: "j" }],
  guard: [{ key: "k", holdOrToggle: "hold" }],
};
