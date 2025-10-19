import { Container } from "inversify";
import { beforeEach, describe, expect, test } from "vitest";
import {
  WARRIOR_FACTORY_TOKEN,
  type IWarriorFactory,
} from "./warrior-factory.types";
import { WarriorFactory } from "./warrior-factory.al";
import { setupTestContainerFor } from "../../../test/setup-test-container-for";
import { vec2 } from "../../../littlejsengine/littlejsengine.pure";

describe("WarriorFactory", () => {
  let container: Container;
  let warriorFactory: IWarriorFactory;

  beforeEach(async () => {
    container = await setupTestContainerFor(
      WARRIOR_FACTORY_TOKEN,
      WarriorFactory,
    );
    warriorFactory = container.get<IWarriorFactory>(WARRIOR_FACTORY_TOKEN);
  });

  test("should init", () => {
    expect(warriorFactory).toBeDefined();
  });

  test("should create a warrior", () => {
    expect(warriorFactory.createWarrior(vec2(0))).toBeDefined();
  });
});
