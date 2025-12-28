/** A simple generator for deterministic unique integer ids */
export class IntIdGenerator {
  private _nextId = 0;

  nextId(): number {
    return this._nextId++;
  }
}
