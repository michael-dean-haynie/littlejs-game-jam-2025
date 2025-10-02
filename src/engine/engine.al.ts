import { frame } from "littlejsengine";
import { Autoloadable } from "../core/autoload/autoloadable";
import { ENGINE_TOKEN, type IEngine } from "./engine.contracts";

@Autoloadable({
  serviceIdentifier: ENGINE_TOKEN,
})
export class Engine implements IEngine {
  get frame(): number {
    return frame;
  }
}
