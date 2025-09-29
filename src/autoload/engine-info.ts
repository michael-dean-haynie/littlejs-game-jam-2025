import { frame } from "littlejsengine";

/** injectable dependency for getting updated engine information */
export class EngineInfo {
  get frame(): number {
    return frame;
  }
}
