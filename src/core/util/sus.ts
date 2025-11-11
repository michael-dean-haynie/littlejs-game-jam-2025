import type { Sector } from "../../world/renderers/sectors/sector";

export type DebugStore = {
  sectors: Map<number, Sector>;
  message: "hope this doesn't make it to prod!";
};

/**
 * Writes an objects properties to a window property. For debugging.
 * Nothing happens in prod builds (tree shaking).
 * Brainrot term "sus".
 */
export function sus(value: object): void {
  if (import.meta.env.PROD) return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).sus ??= {};
  for (const key in value) {
    if (!Object.hasOwn(value, key)) continue;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).sus[key] = (value as any)[key];
  }
}
