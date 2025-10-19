import { inject } from "inversify";
import { GAME_TOKEN, type IGame } from "./game.types";
import { Autoloadable } from "../core/autoload/autoloadable";
import type { ILJS } from "../littlejsengine/littlejsengine.impure";
import { LJS_TOKEN } from "../littlejsengine/littlejsengine.token";
import { vec2 } from "../littlejsengine/littlejsengine.pure";
import { PLAYER_TOKEN, type IPlayer } from "../player/player.types";
import {
  INPUT_MANAGER_TOKEN,
  type IInputManager,
} from "../input/input-manager/input-manager.types";

@Autoloadable({
  serviceIdentifier: GAME_TOKEN,
})
export class Game implements IGame {
  private readonly _ljs: ILJS;
  private readonly _inputManager: IInputManager;
  private readonly _player: IPlayer;

  constructor(
    @inject(LJS_TOKEN) ljs: ILJS,
    @inject(INPUT_MANAGER_TOKEN) inputManager: IInputManager,
    @inject(PLAYER_TOKEN) player: IPlayer,
  ) {
    this._ljs = ljs;
    this._inputManager = inputManager;
    this._player = player;
  }

  start(): void {
    // pre-init setup
    this._ljs.setShowSplashScreen(true);

    this._ljs.engineInit(
      this._gameInit.bind(this),
      this._gameUpdate.bind(this),
      this._gameUpdatePost.bind(this),
      this._gameRender.bind(this),
      this._gameRenderPost.bind(this),
      [
        "Warrior_Idle.png",
        "Warrior_Run.png",
        "Warrior_Attack1.png",
        "Warrior_Attack2.png",
        "Lancer_Idle.png",
        "Lancer_Run.png",
      ],
    );
  }

  /**
   * Called once after the engine starts up
   */
  private async _gameInit(): Promise<void> {
    // start up LittleJS Box2D plugin
    await this._ljs.box2dInit();

    // michael: organize
    this._ljs.setCameraPos(vec2(0, 0));

    this._player.spawnUnit();

    // to simulate friction on the ground
    // b2Obj.setLinearDamping(0.1); // icey
    // b2Obj.setLinearDamping(0.5); // slippery
    // b2Obj.setLinearDamping(1); // slide
    // b2Obj.setLinearDamping(2); // scootch
    // b2Obj.setLinearDamping(3); // budge

    // figuring out physics
    // b2Obj.applyAcceleration(vec2(1)); // ljs: ignores mass; b2d: impulse
    // b2Obj.applyForce(vec2(100)); // ljs: does not ignore mass; b2d: force
  }

  /**
   * Called every frame at 60 frames per second
   * Handle input and update the game state
   */
  private _gameUpdate(): void {
    this._inputManager.triggerFrameDrivenInputs();
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
