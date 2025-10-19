import type { Container } from "inversify";
import { beforeEach, describe, expect, test } from "vitest";
import {
  LANCER_FACTORY_TOKEN,
  type ILancerFactory,
} from "./lancer-factory.types";
import { setupTestContainerFor } from "../../../test/setup-test-container-for";
import { LancerFactory } from "./lancer-factory.al";
import { vec2 } from "../../../littlejsengine/littlejsengine.pure";

describe("LancerFactory", () => {
  let container: Container;
  let lancerFactory: ILancerFactory;

  beforeEach(async () => {
    container = await setupTestContainerFor(
      LANCER_FACTORY_TOKEN,
      LancerFactory,
    );
    lancerFactory = container.get<ILancerFactory>(LANCER_FACTORY_TOKEN);
  });

  test("should init", () => {
    expect(lancerFactory).toBeDefined();
  });

  test("should create a warrior", () => {
    expect(lancerFactory.createLancer(vec2(0))).toBeDefined();
  });
});
