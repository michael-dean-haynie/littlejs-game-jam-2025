import type { Sector } from "../../world/renderers/sectors/sector";
import {
  phase2Idx,
  phases,
} from "../../world/renderers/sectors/sector-phases";
import { world } from "../../world/world.al";

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

export function susStuff(): void {
  if (import.meta.env.PROD) return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const win = window as any;
  win.sectorPhases = () => {
    // Initialize with all phases
    const initialStats = Object.fromEntries(
      phases.map((phase) => [phase, { count: 0, phaseIdx: phase2Idx[phase] }]),
    ) as Record<string, { count: number; phaseIdx: number }>;

    const phaseStats = Array.from(world.sectors.values()).reduce(
      (acc, sector) => {
        const phase = sector._phase;
        acc[phase].count++;
        return acc;
      },
      initialStats,
    );

    console.table(phaseStats);
  };
}

susStuff();
