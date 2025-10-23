import { html } from "lit";
import { customElement } from "lit/decorators.js";
import { BaseLitElement } from "./base-lit-element";

@customElement("hello-world")
export class HelloWorld extends BaseLitElement {
  render() {
    return html`<p>Hello, world!</p>`;
  }
}
