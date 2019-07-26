import qs from 'qs';
// import { action } from '@storybook/addon-actions';

const urlLogger = console.log;
// const urlLogger = action('Routing state');

interface MemoryState {
  [key: string]: any;
  // [key: string]: string | number;
}

const defaultCreateURL = ({ qsModule, routeState, location }) => {
  const { protocol, hostname, port = '', pathname, hash } = location;
  const queryString = qsModule.stringify(routeState);
  const portWithPrefix = port === '' ? '' : `:${port}`;

  // IE <= 11 has no proper `location.origin` so we cannot rely on it.
  if (!routeState || Object.keys(routeState).length === 0) {
    return `${protocol}//${hostname}${portWithPrefix}${pathname}${hash}`;
  }

  return `${protocol}//${hostname}${portWithPrefix}${pathname}?${queryString}${hash}`;
};

export class MemoryRouter {
  private _memoryState: MemoryState;
  private _writeTimer?: number;

  constructor(initialState: MemoryState = {}) {
    this._memoryState = initialState;
  }
  write(routeState: MemoryState) {
    this._memoryState = routeState;
    urlLogger(JSON.stringify(routeState, null, 2));

    window.clearTimeout(this._writeTimer);
    this._writeTimer = window.setTimeout(() => {
      console.log('pushState', routeState, '');
      window.history.pushState(routeState, '');
    }, 400);
  }
  read() {
    return this._memoryState;
  }
  createURL(routeState: any) {
    const endpoint = defaultCreateURL({
      qsModule: qs,
      routeState,
      location,
    });
    // console.log('createURL', routeState);
    // console.log(endpoint);
    return endpoint;
  }
  onUpdate(callback: (routeState: any) => void): void {
    const onPopState = event => {
      window.clearTimeout(this._writeTimer);

      const routeState = event.state;
      console.log('onPopState', routeState);

      // At initial load, the state is read from the URL without update.
      // Therefore the state object is not available.
      // In this case, we fallback and read the URL.
      if (!routeState) {
        callback(this.read());
      } else {
        callback(routeState);
      }
    };

    window.addEventListener('popstate', onPopState);
  }
}
