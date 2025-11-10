import { describe, test } from "vitest";
import { noCap } from "./no-cap";

describe("noCap", () => {
  test("should not be throwin errors", () => {
    noCap(1 < 2, "1 should be less than than 2");
    noCap.isNull(null);
    noCap.notNull({});
    noCap.isDefined({});
    noCap.notDefined(undefined);
    noCap.isUndefined(undefined);
    noCap.notUndefined({});
  });
});
