/**
 * Any kind of message (commands/events/signals) which might be handled.
 */
export type Message<T extends string> = {
  type: T;
};
