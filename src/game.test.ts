import { Container } from "inversify";
import { beforeEach, describe, expect, test } from "vitest";
import { initIocContainer } from "./init-ioc-container";
import { GAME_TOKEN, type IGame } from "./game.contracts";
import { Game } from "./game.al";

describe("Game", () => {
  let container: Container;
  let game: IGame;

  beforeEach(async () => {
    container = await initIocContainer("test");
    container.bind(GAME_TOKEN).to(Game);
    game = container.get<IGame>(GAME_TOKEN);
  });

  test("should init", () => {
    expect(game).toBeDefined();
  });
});
