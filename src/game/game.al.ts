import { textures } from "../textures/textures.types";
import { world } from "../world/world.al";
import {
  box2dInit,
  engineInit,
  setCameraPos,
  setInputPreventDefault,
  setShowSplashScreen,
  vec2,
} from "littlejsengine";
import { player } from "../player/player.al";
import { inputManager } from "../input/input-manager/input-manager.al";

export class Game {
  start(): void {
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
  }

  /**
   * Called once after the engine starts up
   */
  private async _gameInit(): Promise<void> {
    // start up LittleJS Box2D plugin
    await box2dInit();

    world.init();

    setCameraPos(vec2(0, 0));

    player.spawnUnit();

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
    inputManager.triggerFrameDrivenInputs();
    world.update();
  }

  /**
   * Called after physics and objects are updated
   * Setup camera and prepare for render
   */
  private _gameUpdatePost(): void {
    // michael: improve: temp - lock camera to player unit - better place
    const unit = player.unit;
    if (unit !== null) {
      setCameraPos(unit.getPerspectivePos());
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

export const game = new Game();
