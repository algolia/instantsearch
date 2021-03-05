import { Router } from '../src/types';

export function hashRouter(): Router {
  return {
    read() {
      return location.hash
        ? JSON.parse(decodeURIComponent(location.hash.substring(1)))
        : {};
    },
    write(routeState) {
      location.href = this.createURL(routeState);
    },
    createURL(routeState) {
      const url = new URL(location.href);
      url.hash = JSON.stringify(routeState);
      return url.href;
    },
    onUpdate() {},
    dispose() {},
  };
}
