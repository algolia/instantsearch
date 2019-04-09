import { action } from '@storybook/addon-actions';

const urlLogger = action('Routing state');

interface MemoryState {
  [key: string]: string | number;
}

export class MemoryRouter {
  private _memoryState: MemoryState;
  constructor(initialState: MemoryState = {}) {
    this._memoryState = initialState;
  }
  write(routeState: MemoryState) {
    this._memoryState = routeState;
    urlLogger(JSON.stringify(routeState, null, 2));
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
}
