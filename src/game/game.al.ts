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
import { textures } from "../textures/textures.types";
import { WORLD_TOKEN, type IWorld } from "../world/world.types";

@Autoloadable({
  serviceIdentifier: GAME_TOKEN,
})
export class Game implements IGame {
  private readonly _ljs: ILJS;
  private readonly _inputManager: IInputManager;
  private readonly _player: IPlayer;
  private readonly _world: IWorld;

  constructor(
    @inject(LJS_TOKEN) ljs: ILJS,
    @inject(INPUT_MANAGER_TOKEN) inputManager: IInputManager,
    @inject(PLAYER_TOKEN) player: IPlayer,
    @inject(WORLD_TOKEN) world: IWorld,
  ) {
    this._ljs = ljs;
    this._inputManager = inputManager;
    this._player = player;
    this._world = world;
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
      textures,
    );
  }

  /**
   * Called once after the engine starts up
   */
  private async _gameInit(): Promise<void> {
    // start up LittleJS Box2D plugin
    await this._ljs.box2dInit();

    // michael: organize
    this._world.init();

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
    this._world.update();
  }

  /**
   * Called after physics and objects are updated
   * Setup camera and prepare for render
   */
  private _gameUpdatePost(): void {
    // michael: temp - lock camera to player unit
    const unit = this._player.unit;
    if (unit !== null) {
      this._ljs.setCameraPos(unit.box2dObjectAdapter.getPerspectivePos());
    }
  }

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
