import { injectable, type ServiceIdentifier } from "inversify";
import type { ExecutionContext } from "../execution-context";

/** dependency registration. used for autoloading */
export type Registration = {
  executionContext: ExecutionContext;
  serviceIdentifier: ServiceIdentifier;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  ctor: void | Function;
};

const registrations: Registration[] = [];

/** registrations that have been autoloaded */
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

/** decorator factory. applies the `@injectable()` decorator, and registers the dependency for autoloading */
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
