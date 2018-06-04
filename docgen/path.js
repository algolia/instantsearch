import { join } from 'path';

export const rootPath = (...args) => join(__dirname, '..', ...args);

export const corePackage = (...args) =>
  rootPath('packages/react-instantsearch-core/', ...args);

export const domPackage = (...args) =>
  rootPath('packages/react-instantsearch-dom/', ...args);
