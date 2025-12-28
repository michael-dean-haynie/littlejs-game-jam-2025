import { LitElement } from "lit";

// michael: document decision to use light dom instead of shadow for tailwind ease of use
export abstract class BaseLitElement extends LitElement {
  /** Custom rendering without shadow DOM (note, styling leaks in). */
  protected createRenderRoot() {
    return this;
  }
}
