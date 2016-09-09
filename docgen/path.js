import {join} from 'path';

export const root = (...args) => join(__dirname, '..', ...args);
export const reactPackage = (...args) => root('packages/react-instantsearch/', ...args);
