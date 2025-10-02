import type { Container, Newable, ServiceIdentifier } from "inversify";
import { initIocContainer } from "../core/init-ioc-container";

/** sets up an inversify IoC container for testing a particular dependency */
export async function setupTestContainerFor(
  token: ServiceIdentifier,
  impl: Newable<unknown>,
): Promise<Container> {
  const container = await initIocContainer("test");
  container.unbind(token); // unbind any autobinded test doubles for the service-under-test
  container.bind(token).to(impl);
  return container;
}
