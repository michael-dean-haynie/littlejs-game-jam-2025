// michael: document: I'm gonna use "key" value because gives the user the best control over their input
// https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key

/**
 * A string value to represent a physical key on a keyboard.
 */
export type KeyboardControl = string;

/**
 * A string value to represent a physical button on a mouse.
 */
export type MouseControl = `mouse${number}`;

/**
 * A string value to represent a physical key/button on a keyboard/mouse.
 */
export type KbmControl = KeyboardControl | MouseControl;

export function getKeyboardControl(kbEvent: KeyboardEvent): KeyboardControl {
  let result = kbEvent.key.toLowerCase();
  if (result === "control") {
    result = "ctrl";
  }
  return result;
}

export function getMouseControl(mouseEvent: MouseEvent): MouseControl {
  return `mouse${mouseEvent.button}`;
}

export function getKbmControl(event: KeyboardEvent | MouseEvent): KbmControl {
  return event instanceof KeyboardEvent
    ? getKeyboardControl(event)
    : getMouseControl(event);
}

export const KeyboardModifiers = ["ctrl", "alt", "shift", "meta"] as const;
export type KeyboardModifier = (typeof KeyboardModifiers)[number];

/** Whether a keyboard key / mouse button was pressed down, or released up */
export type UpOrDown = "up" | "down";

/** An event about keyboard key / mouse button being pressed or released */
export type KbmControlEvent = {
  ctrl: KbmControl;
  upOrDown: UpOrDown;
  activeCtrls: KbmControl[];
  activeModifiers: KeyboardModifier[];
};
