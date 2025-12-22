import type { KbmProfile } from "../kbm-profile";

export const kbmProfileKenisis: KbmProfile = {
  moveLeft: [
    { ctrl: "s", bindingMode: "hold" },
    { ctrl: "arrowleft", bindingMode: "hold" },
  ],
  moveRight: [
    { ctrl: "f", bindingMode: "hold" },
    { ctrl: "arrowright", bindingMode: "hold" },
  ],
  moveUp: [
    { ctrl: "e", bindingMode: "hold" },
    { ctrl: "arrowup", bindingMode: "hold" },
  ],
  moveDown: [
    { ctrl: "d", bindingMode: "hold" },
    { ctrl: "arrowdown", bindingMode: "hold" },
  ],
  attack: [{ ctrl: "mouse0", bindingMode: "fire" }],
  guard: [{ ctrl: "mouse2", bindingMode: "hold" }],
};
