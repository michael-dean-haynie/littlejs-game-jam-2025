import { Container, type Newable } from "inversify";
import type { ExecutionContext } from "./execution-context";
import { autoloadedRegistrations } from "./autoload/autoloadable";

/** Initializes an IoC container for a particular execution context */
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
