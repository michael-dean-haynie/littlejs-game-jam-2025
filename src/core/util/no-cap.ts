// =======================================================
// Condition
// =======================================================

/** Asserts a condition is truthy */
function noCap(condition: unknown, msg?: string): asserts condition {
  if (import.meta.env.PROD) return;
  if (!condition) {
    doError(Error(capMsg(msg)));
  }
}

// =======================================================
// Null
// =======================================================

/** Asserts that a value is null */
noCap.isNull = function isNull<T>(
  value: T | null,
  msg?: string,
): asserts value is null {
  if (import.meta.env.PROD) return;
  if (value !== null) {
    doError(Error(capMsg(msg, "Expected value to be null.")));
  }
};

/** Asserts that a value is not null */
noCap.notNull = function notNull<T>(
  value: T,
  msg?: string,
): asserts value is Exclude<T, null> {
  if (import.meta.env.PROD) return;
  if (value === null) {
    doError(Error(capMsg(msg, "Expected value NOT to be null.")));
  }
};

// =======================================================
// Undefined
// =======================================================

/** Asserts that a value is defined (or not undefined) */
noCap.isDefined = function isDefined<T>(
  value: T,
  msg?: string,
): asserts value is Exclude<T, undefined> {
  if (import.meta.env.PROD) return;
  if (value === undefined) {
    doError(Error(capMsg(msg, "Expected undefined value to be defined.")));
  }
};

/** Asserts that a value is undefined */
noCap.isUndefined = function isUndefined<T>(
  value: T | undefined,
  msg?: string,
): asserts value is undefined {
  if (import.meta.env.PROD) return;
  if (value !== undefined) {
    doError(Error(capMsg(msg, "Expected value to be undefined.")));
  }
};

/** Asserts that a value is not defined (or is undefined) */
noCap.notDefined = function notDefined<T>(
  value: T | undefined,
  msg?: string,
): asserts value is undefined {
  if (import.meta.env.PROD) return;
  return noCap.isUndefined(value, msg);
};

/** Asserts that a value is not undefined (or is defined) */
noCap.notUndefined = function notUndefined<T>(
  value: T | undefined,
  msg?: string,
): asserts value is Exclude<T, undefined> {
  if (import.meta.env.PROD) return;
  return noCap.isDefined(value, msg);
};

// =======================================================
// Util
// =======================================================

function capMsg(msg?: string, specifier?: string): string {
  return ["That's cap.", specifier, msg]
    .filter((str) => str !== undefined)
    .join(" ");
}

function doError(error: Error): void {
  console.trace(error.message);
  throw error;
}

// =======================================================
// Export
// =======================================================

export { noCap };
