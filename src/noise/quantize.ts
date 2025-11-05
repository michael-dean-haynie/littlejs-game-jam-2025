/** Convert continuous values (0 - 1) into discrete buckets */
export function quantize(value: number, bounds: number[]): number {
  const upperBoundIdx = bounds.findIndex((bound) => value <= bound);
  return upperBoundIdx === -1 ? bounds.length : upperBoundIdx;
}
