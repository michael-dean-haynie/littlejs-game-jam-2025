import { Warrior } from "./warrior";
import { Autoloadable } from "./autoload/autoloadable";
import {
  WARRIOR_FACTORY_TOKEN,
  type IWarriorFactory,
} from "./warrior-factory.contracts";

@Autoloadable({
  serviceIdentifier: WARRIOR_FACTORY_TOKEN,
})
export class WarriorFactory implements IWarriorFactory {
  // private readonly container: Container;

  // constructor(@inject(CONTAINER_TOKEN) _container: Container) {
  //   this.container = _container;
  // }

  createWarrior(): Warrior {
    // create new instance using container resolution
    // return this.container.get(Warrior, { autobind: true });
    return new Warrior();
  }
}
