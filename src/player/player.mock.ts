import { mock } from "vitest-mock-extended";
import { Autoloadable } from "../core/autoload/autoloadable";
import { PLAYER_TOKEN, type IPlayer } from "./player.types";

@Autoloadable({
  serviceIdentifier: PLAYER_TOKEN,
  executionContext: "test",
})
export class PlayerMock {
  // michael: figure out how to autload non-classes so I can make this officially implement the interface
  constructor() {
    return mock<IPlayer>();
  }
}
