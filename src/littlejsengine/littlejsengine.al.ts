import { Autoloadable } from "../core/autoload/autoloadable";
import { LJS_TOKEN } from "./littlejsengine.token";
import * as ljs from "littlejsengine";

@Autoloadable({
  serviceIdentifier: LJS_TOKEN,
})
export class LJS {
  // michael: this class SHOULD implement ILJS for clarity but I need to find a clever way to do that
  constructor() {
    return ljs;
  }
}
