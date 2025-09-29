import { Container, type Newable } from "inversify";
import { autoloadedRegistrations } from "./autoload/autoloadable";
import type { ExecutionContext } from "./execution-context";

/** initialize an ioc container for a particular execution context */
export function initIocContainer(context: ExecutionContext): Container {
  const container = new Container({ defaultScope: "Singleton" });

  for (const {
    executionContext,
    serviceIdentifier,
    ctor,
  } of autoloadedRegistrations) {
    if (executionContext !== context) continue;
    if (!ctor) continue;
    container.bind(serviceIdentifier).to(ctor as Newable);
  }

  return container;
}
