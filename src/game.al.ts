import { inject } from "inversify";
import {
  setShowSplashScreen,
  engineInit,
  box2dInit,
  setCameraPos,
  vec2,
} from "littlejsengine";
import { Autoloadable } from "./autoload/autoloadable";
import {
  WARRIOR_FACTORY_TOKEN,
  type IWarriorFactory,
} from "./warrior-factory.contracts";
import { GAME_TOKEN, type IGame } from "./game.contracts";

@Autoloadable({
  serviceIdentifier: GAME_TOKEN,
})
export class Game implements IGame {
  private readonly _warriorFactory: IWarriorFactory;

  constructor(@inject(WARRIOR_FACTORY_TOKEN) warriorFactory: IWarriorFactory) {
    this._warriorFactory = warriorFactory;
  }

  start(): void {
    // pre-init setup
    setShowSplashScreen(true);

    engineInit(
      this._gameInit.bind(this),
      this._gameUpdate.bind(this),
      this._gameUpdatePost.bind(this),
      this._gameRender.bind(this),
      this._gameRenderPost.bind(this),
      ["Warrior_Idle.png"],
    );
  }

  /**
   * called once after the engine starts up
   * setup the game
   */
  private async _gameInit(): Promise<void> {
    // start up LittleJS Box2D plugin
    await box2dInit();

    // michael: organize
    setCameraPos(vec2(0, 0));

    this._warriorFactory.createWarrior();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any --- temp debugging in chrome console
    // (window as unknown as any).b2Obj = b2Obj;

    // to simulate friction on the ground
    // b2Obj.setLinearDamping(0.1); // icey
    // b2Obj.setLinearDamping(0.5); // slippery
    // b2Obj.setLinearDamping(1); // slide
    // b2Obj.setLinearDamping(2); // scootch
    // b2Obj.setLinearDamping(3); // budge

    // figuring out physics
    // b2Obj.applyAcceleration(vec2(1)); // ignores mass
    // b2Obj.applyForce(vec2(100)); // does not ignore mass
  }

  /**
   * called every frame at 60 frames per second
   * handle input and update the game state
   */
  private _gameUpdate(): void {}

  /**
   * called after physics and objects are updated
   * setup camera and prepare for render
   */
  private _gameUpdatePost(): void {}

  /**
   * called before objects are rendered
   * draw any background effects that appear behind objects
   */
  private _gameRender(): void {}

  /**
   * called after objects are rendered
   * draw effects or hud that appear above all objects
   */
  private _gameRenderPost(): void {}
}
