import { Autoloadable } from "../core/autoload/autoloadable";
import type { Warrior } from "./warrior";
import {
  WARRIOR_FACTORY_TOKEN,
  type IWarriorFactory,
} from "./warrior-factory.types";

@Autoloadable({
  serviceIdentifier: WARRIOR_FACTORY_TOKEN,
  executionContext: "test",
})
export class WarriorFactoryDummy implements IWarriorFactory {
  createWarrior(): Warrior {
    throw new Error("Method not implemented.");
  }
}
