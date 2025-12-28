import { MessageHandler } from "../../aa-rework/messages/message-handler";
import {
  handleToggleInGameMenu,
  type ToggleInGameMenu,
} from "./toggle-in-game-menu";

/** Some sort of intention/action triggered by computer hardware. */
export const HardwareInputMessageTypes = ["toggleInGameMenu"] as const;
/** Some sort of intention/action triggered by computer hardware. */
export type HardwareInputMessageType =
  (typeof HardwareInputMessageTypes)[number];

export type HardwareInputMessage = ToggleInGameMenu;

export const hardwareInputMessageHandler = new MessageHandler<
  HardwareInputMessage,
  object
>();
hardwareInputMessageHandler.contextualize({});
hardwareInputMessageHandler.on("toggleInGameMenu", handleToggleInGameMenu);
