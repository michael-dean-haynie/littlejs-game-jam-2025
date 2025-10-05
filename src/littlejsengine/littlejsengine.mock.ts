import * as littlejsengine from "littlejsengine";
import { Autoloadable } from "../core/autoload/autoloadable";
import { LJS_TOKEN } from "./littlejsengine.token";
import { mock } from "vitest-mock-extended";

@Autoloadable({
  serviceIdentifier: LJS_TOKEN,
  executionContext: "test",
})
export class LJS {
  // michael: this class SHOULD implement ILJS for clarity but I need to find a clever way to do that
  constructor() {
    return mock<typeof littlejsengine>();
  }
}
