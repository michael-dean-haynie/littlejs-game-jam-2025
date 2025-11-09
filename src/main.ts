import { initIocContainer } from "./core/init-ioc-container";

// trigger autoload stuff (includes lit components)
import "./core/autoload/autoload-app";

// import tailwind css
import "./main.css";
import { game } from "./game/game.al";

await initIocContainer("app");
game.start();
