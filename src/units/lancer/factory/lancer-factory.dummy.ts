import { Autoloadable } from "../../../core/autoload/autoloadable";
import type { Lancer } from "../lancer";
import {
  LANCER_FACTORY_TOKEN,
  type ILancerFactory,
} from "./lancer-factory.types";

@Autoloadable({
  serviceIdentifier: LANCER_FACTORY_TOKEN,
  executionContext: "test",
})
export class LancerFactoryDummy implements ILancerFactory {
  createLancer(): Lancer {
    throw new Error("Method not implemented.");
  }
}
