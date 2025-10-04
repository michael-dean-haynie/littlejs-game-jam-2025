import { describe, test } from "vitest";
import { noCap } from "./no-cap";

describe("noCap", () => {
  test("should run", () => {
    noCap(1 < 2, "1 should be greater than 2");
    noCap.isNull(null);
    noCap.isUndefined(undefined);
    noCap.notNull({});
    noCap.notUndefined({});
  });
});
