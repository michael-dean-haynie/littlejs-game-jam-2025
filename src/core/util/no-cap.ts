function capMsg(msg?: string, specifier?: string): string {
  // return msg ? `That's cap: ${msg}` : "That's cap";
  return ["That's cap.", specifier, msg]
    .filter((str) => str !== undefined)
    .join(" ");
}

function doError(error: Error): void {
  console.trace(error.message);
  throw error;
}

/** Asserts a condition is truthy */
function noCap(condition: unknown, msg?: string): asserts condition {
  if (import.meta.env.PROD) return;
  if (!condition) {
    doError(Error(capMsg(msg)));
  }
}

/** Asserts a value is not null */
noCap.notNull = function notNull<T>(
  value: T,
  msg?: string,
): asserts value is Exclude<T, null> {
  if (import.meta.env.PROD) return;
  if (value === null) {
    doError(Error(capMsg(msg, "Expected value NOT to be null.")));
  }
};

/** Asserts a value is null */
noCap.isNull = function isNull<T>(
  value: T | null,
  msg?: string,
): asserts value is null {
  if (import.meta.env.PROD) return;
  if (value !== null) {
    doError(Error(capMsg(msg, "Expected value to be null.")));
  }
};

/** Asserts a value is not undefined */
noCap.notUndefined = function notUndefined<T>(
  value: T,
  msg?: string,
): asserts value is Exclude<T, undefined> {
  if (import.meta.env.PROD) return;
  if (value === undefined) {
    doError(Error(capMsg(msg, "Expected value NOT to be undefined.")));
  }
};

/** Asserts a value is undefined */
noCap.isUndefined = function isUndefined<T>(
  value: T | undefined,
  msg?: string,
): asserts value is undefined {
  if (import.meta.env.PROD) return;
  if (value !== undefined) {
    doError(Error(capMsg(msg, "Expected value to be undefined.")));
  }
};

export { noCap };
