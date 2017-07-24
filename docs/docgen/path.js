import {join} from 'path';

export const rootPath = (...args) => join(__dirname, '..', ...args);
