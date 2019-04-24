export class MemoryRouter {
  constructor(initialState = {}) {
    this._memoryState = initialState;
  }
  write(routeState) {
    this._memoryState = routeState;
  }
  read() {
    return this._memoryState;
  }
  createURL() {
    return '';
  }
  onUpdate() {
    return {};
  }
  dispose() {}
}
