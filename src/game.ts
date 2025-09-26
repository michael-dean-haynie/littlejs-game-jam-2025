import * as LJS from "littlejsengine";
import { vec2 } from "littlejsengine";

export class Game {
  start(): void {
    LJS.setShowSplashScreen(true);

    LJS.engineInit(
      this._gameInit.bind(this),
      this._gameUpdate.bind(this),
      this._gameUpdatePost.bind(this),
      this._gameRender.bind(this),
      this._gameRenderPost.bind(this),
      ["tiles.png"],
    );
  }

  /**
   * called once after the engine starts up
   * setup the game
   */
  private async _gameInit(): Promise<void> {
    // start up LittleJS Box2D plugin
    await LJS.box2dInit();

    // michael: organize
    LJS.setCameraPos(vec2(0, 0));

    const squareTileInfo = LJS.tile(0, 16, 0, 1);

    const b2Obj = new LJS.Box2dObject(
      vec2(0, 0),
      vec2(1, 1),
      //   undefined,
      squareTileInfo,
      0,
      LJS.WHITE,
      LJS.box2d.bodyTypeDynamic,
    );
    b2Obj.drawSize = b2Obj.size.scale(1.02); // slightly enlarge to cover gaps
    b2Obj.addBox(b2Obj.size);
    // michael: remove

    // michael: remove
    // eslint-disable-next-line @typescript-eslint/no-explicit-any --- temp debugging in chrome console
    (window as unknown as any).b2Obj = b2Obj;

    // to simulate friction on the ground
    // b2Obj.setLinearDamping(0.1); // icey
    // b2Obj.setLinearDamping(0.5); // slippery
    b2Obj.setLinearDamping(1); // slide
    // b2Obj.setLinearDamping(2); // scootch
    // b2Obj.setLinearDamping(3); // budge

    // figuring out physics
    // b2Obj.applyAcceleration(vec2(1)); // ignores mass
    b2Obj.applyForce(vec2(100)); // does not ignore mass
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
