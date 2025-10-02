import { initIocContainer } from "./core/init-ioc-container";
import "./core/autoload/autoload-app";
import { GAME_TOKEN, type IGame } from "./game/game.contracts";

const container = await initIocContainer("app");
const game = container.get<IGame>(GAME_TOKEN);
game.start();
