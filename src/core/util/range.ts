/**
 * Creates an array of numbers from start to end (exclusive)
 * range(5) -> [0, 1, 2, 3, 4]
 * range(2, 5) -> [2, 3, 4]
 * range(0, 10, 2) -> [0, 2, 4, 6, 8]
 */
export function range(start: number, end?: number, step: number = 1): number[] {
  // If only one argument, treat it as end with start=0
  if (end === undefined) {
    end = start;
    start = 0;
  }

  if (step === 0) {
    throw new Error("Step cannot be zero");
  }

  const result: number[] = [];

  if (step > 0) {
    for (let i = start; i < end; i += step) {
      result.push(i);
    }
  } else {
    for (let i = start; i > end; i += step) {
      result.push(i);
    }
  }

  return result;
}
