import { engine } from "../../aa-rework/engine/engine";
import type { Message } from "../../aa-rework/messages/mesage";
import type { HardwareInputMessageType } from "./hardware-input-message-handler";

export class ToggleInGameMenu implements Message<HardwareInputMessageType> {
  readonly type = "toggleInGameMenu";
}

export function handleToggleInGameMenu(): void {
  engine.litUi.showInGameMenu = !engine.litUi.showInGameMenu;
}
