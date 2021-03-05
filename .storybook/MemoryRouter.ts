import { action } from '@storybook/addon-actions';
import { Router, RouteState } from '../src/types';

const urlLogger = action('Routing state');

export function memoryRouter(initialState: RouteState): Router {
  let memoryState = initialState;

  return {
    write(routeState) {
      memoryState = routeState;
      urlLogger(JSON.stringify(routeState, null, 2));
    },
    read() {
      return memoryState;
    },
    createURL() {
      return '';
    },
    onUpdate() {
      return {};
    },
    dispose() {},
  };
}
