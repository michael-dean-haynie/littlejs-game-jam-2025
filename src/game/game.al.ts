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
import {
  TERRAIN_THING_TOKEN,
  type ITerrainThing,
} from "../terrain/terrain-thing.types";

@Autoloadable({
  serviceIdentifier: GAME_TOKEN,
})
export class Game implements IGame {
  private readonly _ljs: ILJS;
  private readonly _inputManager: IInputManager;
  private readonly _player: IPlayer;
  private readonly _terrainThing: ITerrainThing;

  constructor(
    @inject(LJS_TOKEN) ljs: ILJS,
    @inject(INPUT_MANAGER_TOKEN) inputManager: IInputManager,
    @inject(PLAYER_TOKEN) player: IPlayer,
    @inject(TERRAIN_THING_TOKEN) terrainThing: ITerrainThing,
  ) {
    this._ljs = ljs;
    this._inputManager = inputManager;
    this._player = player;
    this._terrainThing = terrainThing;
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
    this._terrainThing.init();
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
  private _gameUpdatePost(): void {
    // michael: temp - lock camera to player unit
    const unit = this._player.unit;
    if (unit !== null) {
      // this._ljs.setCameraPos(unit.box2dObjectAdapter.getCenterOfMass());
      // this is jumpy, at least while we can jump over cliffs, maybe enable again later
      this._ljs.setCameraPos(
        unit.box2dObjectAdapter
          .getCenterOfMass()
          .add(vec2(0, unit.box2dObjectAdapter.travelingHeight)),
      );
    }
  }

  /**
   * Called before objects are rendered
   * Draw any background effects that appear behind objects
   */
  private _gameRender(): void {
    // michael: remove
    this._terrainThing.render();
  }

  /**
   * Called after objects are rendered
   * Draw effects or hud that appear above all objects
   */
  private _gameRenderPost(): void {}
}
