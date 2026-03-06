/**
 * Rollup plugin to add .js extensions to imports for proper ES Module compatibility.
 *
 * This file re-exports the CommonJS implementation to keep Rollup configs in ESM.
 */

import resolverModule from './rollup-plugin-extension-resolver.cjs';

export const extensionResolver =
  resolverModule.extensionResolver ?? resolverModule.default ?? resolverModule;

export default extensionResolver;
