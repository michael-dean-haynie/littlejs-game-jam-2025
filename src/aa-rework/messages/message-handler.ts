import { noCap } from "../../core/util/no-cap";
import type { Message } from "./mesage";

/**
 * A typesafe message handler where functions can be registerd for particular message types.
 */
export class MessageHandler<TMsg extends Message<string>, TCtx extends object> {
  private readonly _handlers = new Map<string, MessageHandlerFn<TMsg, TCtx>>();

  constructor(private _context?: TCtx) {}

  contextualize(context: TCtx): MessageHandler<TMsg, TCtx> {
    this._context = context;
    return this;
  }

  /**
   * Registers a function handler for a particular message type.
   * @param messageType
   * @param handler
   */
  on<TMsgType extends TMsg["type"]>(
    messageType: TMsgType,
    handler: MessageHandlerFn<Extract<TMsg, { type: TMsgType }>, TCtx>,
  ): MessageHandler<TMsg, TCtx> {
    this._handlers.set(messageType, handler as MessageHandlerFn<TMsg, TCtx>);
    return this;
  }

  /**
   * Executes the registered handler for a message by its type.
   * @param message
   */
  handle(message: TMsg): void {
    const handler = this._handlers.get(message.type);
    if (handler) {
      noCap.isDefined(this._context);
      handler(message, this._context);
    }
  }
}

export type MessageHandlerFn<
  TMsg extends Message<string>,
  TCtx extends object,
> = (message: TMsg, context: TCtx) => void;
