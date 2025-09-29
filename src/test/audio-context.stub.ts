class FakeAudioNode {
  connect() {}
  disconnect() {}
}
class FakeBufferSource extends FakeAudioNode {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  buffer: any = null;
  onended: (() => void) | null = null;
  start() {
    /* optionally call this.onended?.() later */
  }
  stop() {
    this.onended?.();
  }
}

class FakeAudioContext {
  currentTime = 0;
  destination = new FakeAudioNode();
  createGain() {
    return new FakeAudioNode();
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  createBuffer(_ch: number, _len: number, _rate: number) {
    return {};
  }
  createBufferSource() {
    return new FakeBufferSource();
  }
  resume() {
    return Promise.resolve();
  }
  suspend() {
    return Promise.resolve();
  }
  close() {
    return Promise.resolve();
  }
}

Object.defineProperty(globalThis, "AudioContext", { value: FakeAudioContext });
Object.defineProperty(globalThis, "webkitAudioContext", {
  value: FakeAudioContext,
});
