import { initIocContainer } from "./core/init-ioc-container";
import { GAME_TOKEN, type IGame } from "./game/game.types";

// trigger autoload stuff (includes lit components)
import "./core/autoload/autoload-app";

// import tailwind css
import "./main.css";

const container = await initIocContainer("app");
const game = container.get<IGame>(GAME_TOKEN);
game.start();
