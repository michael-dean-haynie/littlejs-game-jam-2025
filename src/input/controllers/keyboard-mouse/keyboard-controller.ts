import { Subject } from "rxjs";
import type {
  KbmBinding,
  KbmModifierMatchMode,
  KbmProfile,
} from "./kbm-profile";
import {
  KbmMovementActions,
  type KbmAction,
  type KbmActionEvent,
  type KbmMovementAction,
} from "./keyboard-action";
import {
  getKbmControl,
  KeyboardModifiers,
  type KbmControl,
  type KbmControlEvent,
  type KeyboardModifier,
  type UpOrDown,
} from "./keyboard-control";
import { kbmProfileKenisis } from "./profiles/kbm-profile-kenisis";
import type { IInputCommand } from "../../commands/input-command";
import { Move } from "../../commands/move";
import { mouseDelta, mousePos, vec2, type Vector2 } from "littlejsengine";
import { FacePosition } from "../../commands/face-position";
import { Attack } from "../../commands/attack";
import { GuardToggle } from "../../commands/guard-toggle";

export class KeyboardController {
  private readonly _commands$ = new Subject<IInputCommand>();
  public readonly commands$ = this._commands$.asObservable();

  /** Actively pressed keyboard keys / mouse buttons (order matters) */
  private readonly _activeCtrls = new Set<KbmControl>();

  /** Actively pressed modifier keys */
  private _activeModifiers = new Set<KeyboardModifier>();

  private _profile: KbmProfile = kbmProfileKenisis;

  constructor() {
    document.addEventListener("keydown", this._onKeyDown.bind(this));
    document.addEventListener("keyup", this._onKeyUp.bind(this));
    document.addEventListener("mousedown", this._onMouseDown.bind(this));
    document.addEventListener("mouseup", this._onMouseUp.bind(this));
  }

  ///////////////////////////////////////////////////////////////////
  // Engine Frame Handlers
  ///////////////////////////////////////////////////////////////////

  update(): void {
    // once a frame, check if the mouse has moved, and reface unit if needed
    if (mouseDelta.length() > 0) {
      this._commands$.next(new FacePosition(mousePos));
    }
  }

  ///////////////////////////////////////////////////////////////////
  // DOM Event Handlers
  ///////////////////////////////////////////////////////////////////

  private _onKeyDown(event: KeyboardEvent): void {
    // michael: rapid fire might require removing this
    if (event.repeat) return;

    const ctrl = getKbmControl(event);
    this._activeCtrls.add(ctrl);
    this._updateActiveModifiers();
    this._onKbmCtrlEvent({
      ctrl,
      upOrDown: "down",
      activeCtrls: [...this._activeCtrls],
      activeModifiers: [...this._activeModifiers],
    });
  }

  private _onKeyUp(event: KeyboardEvent): void {
    const ctrl = getKbmControl(event);
    this._activeCtrls.delete(ctrl);
    this._updateActiveModifiers();
    this._onKbmCtrlEvent({
      ctrl: getKbmControl(event),
      upOrDown: "up",
      activeCtrls: [...this._activeCtrls],
      activeModifiers: [...this._activeModifiers],
    });
  }

  private _onMouseDown(event: MouseEvent): void {
    const ctrl = getKbmControl(event);
    this._activeCtrls.add(ctrl);
    this._onKbmCtrlEvent({
      ctrl: getKbmControl(event),
      upOrDown: "down",
      activeCtrls: [...this._activeCtrls],
      activeModifiers: [...this._activeModifiers],
    });
  }

  private _onMouseUp(event: MouseEvent): void {
    const ctrl = getKbmControl(event);
    this._activeCtrls.delete(ctrl);
    this._onKbmCtrlEvent({
      ctrl: getKbmControl(event),
      upOrDown: "up",
      activeCtrls: [...this._activeCtrls],
      activeModifiers: [...this._activeModifiers],
    });
  }

  ///////////////////////////////////////////////////////////////////
  // Control Event Handlers
  ///////////////////////////////////////////////////////////////////

  private _onKbmCtrlEvent(ctrlEvent: KbmControlEvent): void {
    // trigger action event for matching bindings from profile
    for (const [action, binding] of this._getProfileEntries(this._profile)) {
      if (!this._bindingMatchesEvent(binding, ctrlEvent)) {
        continue;
      }

      this._onKbmActionEvent({
        action: action,
        ctrlEvent: ctrlEvent,
      });
    }
  }

  private _updateActiveModifiers(): void {
    this._activeModifiers.clear();
    for (const mod of KeyboardModifiers) {
      if (this._activeCtrls.has(mod)) {
        this._activeModifiers.add(mod);
      }
    }
  }

  private _getProfileEntries(profile: KbmProfile): [KbmAction, KbmBinding][] {
    const result: [KbmAction, KbmBinding][] = [];
    const entries = Object.entries(profile) as [KbmAction, KbmBinding[]][];

    for (const [action, bindings] of entries) {
      for (const binding of bindings) {
        result.push([action, binding]);
      }
    }
    return result;
  }

  private _bindingMatchesEvent(
    binding: KbmBinding,
    { ctrl, activeModifiers, upOrDown }: KbmControlEvent,
  ): boolean {
    return (
      this._bindingMatchesCtrl(binding, ctrl) &&
      this._bindingMatchesModifiers(binding, activeModifiers) &&
      this._bindingModeMatches(binding, upOrDown)
    );
  }

  private _bindingMatchesCtrl(binding: KbmBinding, ctrl: KbmControl): boolean {
    // keyboard/mouse ctrl values must match
    if (binding.ctrl !== ctrl) return false;
    return true;
  }

  // note: modifier match should probably not be required for deactivating an action
  private _bindingMatchesModifiers(
    binding: KbmBinding,
    activeModifiers: KeyboardModifier[],
  ): boolean {
    // all modifiers must match
    for (const mod of KeyboardModifiers) {
      if (
        !this._modifierMatches(
          mod,
          activeModifiers,
          binding.modifierMatchers?.[mod],
        )
      ) {
        return false;
      }
    }

    return true;
  }

  private _modifierMatches(
    modifier: KeyboardModifier,
    activeModifiers: KeyboardModifier[],
    mode?: KbmModifierMatchMode,
  ): boolean {
    switch (mode) {
      case undefined:
      case "default":
        return true;
      case "required":
        return activeModifiers.includes(modifier);
      case "forbidden":
        return !activeModifiers.includes(modifier);
    }
  }

  private _bindingModeMatches(
    binding: KbmBinding,
    upOrDown: UpOrDown,
  ): boolean {
    switch (binding.bindingMode) {
      case "hold":
        return true;
      case "toggle":
      case "fire":
        return upOrDown === "down";
    }
  }

  ///////////////////////////////////////////////////////////////////
  // Action Event Handlers
  ///////////////////////////////////////////////////////////////////

  // michael: improve: make decorator pattern for discriminated handlers
  private _onKbmActionEvent(actionEvent: KbmActionEvent): void {
    switch (actionEvent.action) {
      case "moveLeft":
      case "moveRight":
      case "moveUp":
      case "moveDown":
        this._onMoveActionEvent(actionEvent.ctrlEvent.activeCtrls);
        break;

      case "attack":
        this._commands$.next(new Attack());
        break;
      case "guard":
        this._commands$.next(new GuardToggle());
        break;

      default:
        break;
    }
  }

  private _movementKeyboardInputVectors = {
    moveLeft: vec2(-1, 0),
    moveRight: vec2(1, 0),
    moveUp: vec2(0, 1),
    moveDown: vec2(0, -1),
  } as const satisfies Record<KbmMovementAction, Vector2>;

  private _onMoveActionEvent(activeCtrls: KbmControl[]): void {
    // get all the active move actions
    const activeMovementActions: KbmMovementAction[] = [];
    for (const [action, binding] of this._getProfileEntries(this._profile)) {
      if (!(KbmMovementActions as KbmAction[]).includes(action)) {
        continue;
      }

      for (const ctrl of activeCtrls) {
        if (this._bindingMatchesCtrl(binding, ctrl)) {
          activeMovementActions.push(action as KbmMovementAction);
        }
      }
    }

    // reduce active move actions to a single vec2
    const reducedMovementVec: Vector2 = activeMovementActions.reduce(
      (acc, cur) => {
        const curVec = this._movementKeyboardInputVectors[cur];

        // replace x/y with more recent inputs.
        // simply summing would make left + right = 0 instead of favoring the most recent
        return vec2(
          curVec.x !== 0 ? curVec.x : acc.x,
          curVec.y !== 0 ? curVec.y : acc.y,
        );
      },
      vec2(0, 0),
    );

    this._commands$.next(new Move(reducedMovementVec));
  }
}

///////////////////////////////////////////////////////////////////
// Init
///////////////////////////////////////////////////////////////////
export const keyboardController = new KeyboardController();
