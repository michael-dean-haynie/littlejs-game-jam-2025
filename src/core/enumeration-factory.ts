/**
 * Factory for string literal unions with type guard and value iteration.
 *
 * Why use this instead of TypeScript's built-in `enum`?
 * - Produces a string literal union type (e.g. 'red' | 'green' | 'blue'), not a numeric or string enum.
 * - You get both runtime and compile-time safety, and can easily check if a value is valid at runtime.
 *
 * Usage:
 * ```ts
 * // 1. Create your union and export both the const and the type:
 * export const Colors = enumerationFactory('red', 'green', 'blue');
 * export type Color = (ReturnType<typeof Colors.values>)[number];
 *
 * // 2. Use in your code:
 * function doSomething(val: string) {
 *   if (Colors.includes(val)) {
 *     // val is now typed as Color ('red' | 'green' | 'blue')
 *   }
 * }
 *
 * // 3. Iterate over all values:
 * for (const c of Colors.values()) {
 *   // c is typed as Color
 * }
 * ```
 */
export function enumerationFactory<const T extends string>(...values: T[]) {
  const set = new Set(values);
  return {
    values(): readonly T[] {
      return values as readonly T[];
    },
    includes(value: unknown): value is T {
      return typeof value === "string" && set.has(value as T);
    },
  };
}
