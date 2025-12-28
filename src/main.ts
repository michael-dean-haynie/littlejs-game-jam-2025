// import lit web components so they can register themselves in the DOM
import "./aa-rework/ui/lit/components/index";

// import tailwind css so utility classes can be used via light-dom in lit components
import "./main.css";

import { engine } from "./aa-rework/engine/engine";

// start the littlejs game engine
engine.start();
