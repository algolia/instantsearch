import {reactPackage} from '../path.js';

export const packageMetadata = require(reactPackage('package.json'));

export default {
  pkg: packageMetadata,
};
