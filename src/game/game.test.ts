import { Container } from "inversify";
import { beforeEach, describe, expect, test } from "vitest";
import { GAME_TOKEN, type IGame } from "./game.contracts";
import { Game } from "./game.al";
import { setupTestContainerFor } from "../test/setup-test-container-for";

describe("Game", () => {
  let container: Container;
  let game: IGame;

  beforeEach(async () => {
    container = await setupTestContainerFor(GAME_TOKEN, Game);
    game = container.get<IGame>(GAME_TOKEN);
  });

  test("should init", () => {
    expect(game).toBeDefined();
  });

  // actually initializing the littlejs engine will require a ton of mocking/stubbing canvas, audio context, etc.
  // jsdom seems to be pretty limited, actually.
  test.skip("start should not throw", () => {
    expect(() => game.start()).not.toThrow();
  });
});
