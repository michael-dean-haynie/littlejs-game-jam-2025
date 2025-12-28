import { html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { BaseLitElement } from "./base-lit-element";
import { noCap } from "../../../../core/util/no-cap";
import { engineObjectsDestroy } from "littlejsengine";
import { when } from "lit/directives/when.js";
import type { GameModeDetail } from "./lit-main-menu";
import { gameFactory } from "../../../game/game-factory";
import type { Engine } from "../../../engine/engine";

@customElement("lit-ui")
export class LitUI extends BaseLitElement {
  private readonly _canvasResizeObserver: ResizeObserver;

  @property({ type: Boolean })
  showInGameMenu = false;

  @state()
  private _showMainMenu = true;

  constructor(private readonly _engine: Engine) {
    super();
    const body = document.querySelector("body");
    noCap.notNull(body);
    body.insertAdjacentElement("beforeend", this);

    const canvas = document.querySelector("canvas");
    noCap.notNull(canvas);
    this._canvasResizeObserver = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      this.style.height = `${height}px`;
      this.style.width = `${width}px`;
    });
    this._canvasResizeObserver.observe(canvas);
  }

  render() {
    return html`
      <style>
        lit-ui {
          /* overlay the lit-ui right on top of the littlejs canvas */
          display: block;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
      </style>

      ${when(
        this._showMainMenu,
        () =>
          html`<lit-main-menu
            @playGameMode=${this._playGameMode}
          ></lit-main-menu>`,
      )}
      ${when(
        this.showInGameMenu,
        () =>
          html`<lit-in-game-menu
            @exitGameMode=${this._exitGameModeListener}
          ></lit-in-game-menu>`,
      )}
    `;
  }

  private _playGameMode(event: CustomEvent<GameModeDetail>): void {
    const { gameMode } = event.detail;
    engineObjectsDestroy();
    this._engine.game = gameFactory(gameMode);

    this._showMainMenu = false;
  }

  private _exitGameModeListener(): void {
    engineObjectsDestroy();
    this._engine.game?.end();
    this.showInGameMenu = false;
    this._showMainMenu = true;
  }
}
