import { initIocContainer } from "./init-ioc-container";
import "./autoload/autoload-app";
import { GAME_TOKEN, type IGame } from "./game.contracts";

const container = await initIocContainer("app");
const game = container.get<IGame>(GAME_TOKEN);
game.start();
