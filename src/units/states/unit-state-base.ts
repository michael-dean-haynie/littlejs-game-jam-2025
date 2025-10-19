import { noCap } from "../../core/util/no-cap";
import type {
  Message,
  MessageId,
  MessagePostProcessAction,
} from "../../messages/messages.types";
import type { IUnit } from "../unit.types";
import type { IUnitState, UnitState } from "./states.types";

export type MessageHandlerMap = {
  [K in MessageId]: (
    message: Extract<Message, { id: K }>,
  ) => MessagePostProcessAction;
};

export type TransitionHandlerMap = {
  [K in UnitState]: () => void;
};

export abstract class UnitStateBase implements IUnitState {
  abstract readonly state: UnitState;
  protected readonly _transitionHandlers: Partial<TransitionHandlerMap> = {};
  protected readonly _messageHandlers: Partial<MessageHandlerMap> = {};
  protected readonly _unit: IUnit;

  constructor(unit: IUnit) {
    this._unit = unit;

    this._messageHandlers["unit.faceDirection"] = (msg) => {
      this._unit.faceDirection = msg.direction;
      return "none";
    };
    this._messageHandlers["unit.facePosition"] = (msg) => {
      this._unit.faceDirection = msg.position.subtract(
        this._unit.box2dObjectAdapter.getCenterOfMass(),
      );
      return "none";
    };
  }

  canTransitionTo(state: UnitState): boolean {
    return this._transitionHandlers[state] !== undefined;
  }

  onEnter(): void {}

  onExit(): void {}

  processMessage(message: Message): MessagePostProcessAction {
    const handler = this._messageHandlers[message.id];
    if (handler === undefined) {
      return "skip";
    }

    // michael: maybe improve - might be design or ts limitation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return handler(message as any);
  }

  protected _transitionTo(state: UnitState) {
    noCap(this.canTransitionTo(state));
    this._transitionHandlers[state]!();
  }
}
