import { injectable, type ServiceIdentifier } from "inversify";
import type { ExecutionContext } from "../execution-context";

/** Dependency registration metadata used for IoC container autoloading */
export type Registration = {
  executionContext: ExecutionContext;
  serviceIdentifier: ServiceIdentifier;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  ctor: void | Function;
};

const registrations: Registration[] = [];

/** Read-only array of all dependency registrations collected by `@Autoloadable()` decorators */
export const autoloadedRegistrations: ReadonlyArray<Registration> =
  registrations;

export type AutoloadableParams = RequiredAutoloadableParams &
  OptionalAutoloadableParams;

export type RequiredAutoloadableParams = {
  serviceIdentifier: ServiceIdentifier;
};

export type OptionalAutoloadableParams = {
  executionContext: ExecutionContext;
};

export const defaultAutoloadableParams: OptionalAutoloadableParams = {
  executionContext: "app",
};

/** Class decorator factory that marks a class as injectable and automatically registers it for IoC container binding */
export function Autoloadable(
  parameters: RequiredAutoloadableParams & Partial<OptionalAutoloadableParams>,
): ClassDecorator {
  const params: AutoloadableParams = {
    ...defaultAutoloadableParams,
    ...parameters,
  };

  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  return function <TFunction extends Function>(
    target: TFunction,
  ): void | TFunction {
    const { serviceIdentifier, executionContext } = params;

    const decorator = injectable();
    const newCtor = decorator(target) ?? target;

    registrations.push({
      ctor: newCtor,
      serviceIdentifier,
      executionContext,
    });

    return newCtor;
  };
}
