import type { KbmAction } from "./keyboard-action";
import type { KbmControl } from "./keyboard-control";
import type { KeyboardModifier } from "./keyboard-controller.types";

export type KbmProfile = Record<KbmAction, KbmBinding[]>;

export type KbmBinding = {
  ctrl: KbmControl;
  modifierMatchers?: KbmModifierMatchers;
  bindingMode: KbmBindingMode;
};

export type KbmModifierMatchers = Record<
  KeyboardModifier,
  KbmModifierMatchMode
>;

export const KbmModifierMatchModes = [
  "required", // mod MUST be active
  "forbidden", // mod must NOT be active
  "default", // either way works
] as const;
export type KbmModifierMatchMode = (typeof KbmModifierMatchModes)[number];

export const KbmBindingModes = [
  "hold", // press to activate, release to deactivate
  "toggle", // press to activate, press again to deactivate
  "fire", // a single activation with no deactivation logic
] as const;
export type KbmBindingMode = (typeof KbmBindingModes)[number];
