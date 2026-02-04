/**
 * Rollup plugin to add .js extensions to imports for proper ES Module compatibility.
 * 
 * This is a port of the Babel plugin at scripts/babel/extension-resolver.js
 * 
 * For ES Modules, import paths need to be fully-specified with extensions.
 * This plugin resolves imports like `./foo` to `./foo.js` in the output.
 */

import { existsSync, statSync } from 'fs';
import { dirname, join, resolve, sep, posix } from 'path';

/**
 * @typedef {Object} ExtensionResolverOptions
 * @property {string[]} [modulesToResolve=[]] - External modules to resolve (e.g., ['instantsearch.js'])
 * @property {string[]} [srcExtensions=['.js', '.ts', '.tsx']] - Source file extensions to look for
 * @property {string} [dstExtension='.js'] - Extension to add in output
 */

/**
 * Creates the extension resolver plugin.
 * @param {ExtensionResolverOptions} [options]
 * @returns Rollup plugin
 */
export function extensionResolver({
  modulesToResolve = [],
  srcExtensions = ['.js', '.ts', '.tsx'],
  dstExtension = '.js',
} = {}) {
  return {
    name: 'extension-resolver',

    /**
     * Transform the output code to add extensions to imports/exports.
     * We use renderChunk instead of resolveId to modify the final output,
     * ensuring extensions are added to the generated code.
     */
    renderChunk(code, chunk) {
      const chunkDir = chunk.facadeModuleId ? dirname(chunk.facadeModuleId) : process.cwd();
      
      // Match import/export statements with string specifiers
      // Handles: import x from './foo', export { x } from './foo', export * from './foo'
      const importExportRegex = /(import\s+.*?\s+from\s+['"]|export\s+.*?\s+from\s+['"]|export\s+\*\s+from\s+['"])([^'"]+)(['"])/g;
      
      let hasChanges = false;
      const transformedCode = code.replace(importExportRegex, (match, prefix, sourcePath, suffix) => {
        const resolved = resolveSourcePath(sourcePath, chunkDir, {
          modulesToResolve,
          srcExtensions,
          dstExtension,
        });
        
        if (resolved !== sourcePath) {
          hasChanges = true;
          return `${prefix}${resolved}${suffix}`;
        }
        return match;
      });

      if (hasChanges) {
        return { code: transformedCode, map: null };
      }
      return null;
    },
  };
}

/**
 * Resolves a source path, adding extension if needed.
 * @param {string} sourcePath - The import path
 * @param {string} baseDir - The directory of the importing file
 * @param {ExtensionResolverOptions} options
 * @returns {string} The resolved path with extension
 */
function resolveSourcePath(sourcePath, baseDir, { modulesToResolve, srcExtensions, dstExtension }) {
  // Check if it's a relative import
  if (isRelativePath(sourcePath)) {
    return resolveRelativePath(baseDir, sourcePath, srcExtensions, dstExtension);
  }
  
  // Check if it's an external module we should resolve
  if (modulesToResolve.some((mod) => sourcePath.startsWith(`${mod}/`))) {
    return resolveExternalModulePath(sourcePath);
  }
  
  return sourcePath;
}

/**
 * Resolves a relative import path, adding extension if needed.
 */
function resolveRelativePath(baseDir, sourcePath, srcExtensions, dstExtension) {
  // Already has an extension
  if (hasExtension(sourcePath)) {
    return sourcePath;
  }
  
  const absolutePath = resolve(baseDir, sourcePath);
  
  // Check if it's a file (with one of the source extensions)
  for (const ext of srcExtensions) {
    if (existsSync(`${absolutePath}${ext}`)) {
      return `${sourcePath}${dstExtension}`;
    }
  }
  
  // Check if it's a directory with an index file
  for (const ext of srcExtensions) {
    const indexPath = join(absolutePath, `index${ext}`);
    if (existsSync(indexPath)) {
      return `${sourcePath}/index${dstExtension}`;
    }
  }
  
  // Couldn't resolve, return as-is
  return sourcePath;
}

/**
 * Resolves an external module path (e.g., 'instantsearch.js/es/widgets').
 * Uses require.resolve to find the actual file path.
 */
function resolveExternalModulePath(sourcePath) {
  try {
    // Get the package name (handles scoped packages)
    const packageNameRegex = sourcePath.startsWith('@')
      ? /^(?<packageName>@[^/]+\/[^/]+)\/(?<pathName>.+)/
      : /^(?<packageName>[^/]+)\/(?<pathName>.+)/;
    
    const match = sourcePath.match(packageNameRegex);
    if (!match) {
      return sourcePath;
    }
    
    const { packageName } = match.groups;
    
    // Resolve the full path
    const fullPath = require.resolve(sourcePath);
    
    // Get the package root
    const packageJson = '/package.json';
    const packagePath = require.resolve(packageName + packageJson).slice(0, -packageJson.length);
    
    // Get the path inside the package
    const [, resolvedPath] = fullPath.split(packagePath);
    
    // Normalize to forward slashes
    return normalizeToForwardSlashes(packageName + resolvedPath);
  } catch {
    return sourcePath;
  }
}

/**
 * Checks if a path is relative (starts with . or ..)
 */
function isRelativePath(path) {
  return path.startsWith('./') || path.startsWith('../');
}

/**
 * Checks if a path already has an extension
 */
function hasExtension(path) {
  const lastSegment = path.split('/').pop();
  return lastSegment.includes('.') && !lastSegment.startsWith('.');
}

/**
 * Normalizes path separators to forward slashes
 */
function normalizeToForwardSlashes(path) {
  if (sep === '\\') {
    return path.split(sep).join('/');
  }
  return path;
}

export default extensionResolver;
