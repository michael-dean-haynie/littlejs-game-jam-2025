import {
  box2dInit,
  engineInit,
  setCameraPos,
  setInputPreventDefault,
  setShowSplashScreen,
  vec2,
} from "littlejsengine";
import { textures } from "../../textures/textures.types";
import { LitUI } from "../ui/lit/components";
import { keyboardController } from "../../input/hardware/keyboard-mouse/keyboard-controller";
import type { Game } from "../game/game";

/**
 * Represents the game at the level of a web app, powered by littlejs engine.
 * Might be driving a game, or just the menu or whatever.
 */
export class Engine {
  litUi!: LitUI;
  game?: Game;

  start(): void {
    // michael: debug
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).engine = this;

    // pre-init setup
    setShowSplashScreen(true);

    // don't interrupt html stuff (lit components)
    setInputPreventDefault(false);

    engineInit(
      this._gameInit.bind(this),
      this._gameUpdate.bind(this),
      this._gameUpdatePost.bind(this),
      this._gameRender.bind(this),
      this._gameRenderPost.bind(this),
      textures,
    );

    // initialize the lit ui overlay (after engineInit() so canvas exists)
    this.litUi = new LitUI(this);
  }

  /**
   * Called once after the engine starts up
   */
  private async _gameInit(): Promise<void> {
    // start up LittleJS Box2D plugin
    await box2dInit();

    setCameraPos(vec2(0, 0));
  }

  /**
   * Called every frame at 60 frames per second
   * Handle input and update the game state
   */
  private _gameUpdate(): void {
    keyboardController.update();
    this.game?.gameState.update();
  }

  /**
   * Called after physics and objects are updated
   * Setup camera and prepare for render
   */
  private _gameUpdatePost(): void {}

  /**
   * Called before objects are rendered
   * Draw any background effects that appear behind objects
   */
  private _gameRender(): void {}

  /**
   * Called after objects are rendered
   * Draw effects or hud that appear above all objects
   */
  private _gameRenderPost(): void {}
}

export const engine = new Engine();
