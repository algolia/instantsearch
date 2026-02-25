/**
 * Rollup plugin to add .js extensions to imports for proper ES Module compatibility.
 *
 * This is the commonjs implementation shared by the ESM wrapper.
 */

const { existsSync } = require('fs');
const { dirname, join, resolve, sep } = require('path');

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
function extensionResolver({
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
      const importExportRegex =
        /(import\s+.*?\s+from\s+['"]|export\s+.*?\s+from\s+['"]|export\s+\*\s+from\s+['"]|import\s+['"])([^'"]+)(['"])/g;

      let hasChanges = false;
      const transformedCode = code.replace(
        importExportRegex,
        (match, prefix, sourcePath, suffix) => {
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
        }
      );

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
    return resolveExternalModulePath(sourcePath, dstExtension);
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
function resolveExternalModulePath(sourcePath, dstExtension) {
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
    // Fallback: append extension if missing
    if (!hasExtension(sourcePath)) {
      return `${sourcePath}${dstExtension}`;
    }
    return sourcePath;
  }
}

/**
 * Checks if a path is relative (starts with . or ..)
 */
function isRelativePath(pathValue) {
  return pathValue.startsWith('./') || pathValue.startsWith('../');
}

/**
 * Checks if a path already has an extension
 */
function hasExtension(pathValue) {
  const lastSegment = pathValue.split('/').pop();
  return lastSegment.includes('.') && !lastSegment.startsWith('.') && !lastSegment.endsWith('/');
}

/**
 * Normalizes path separators to forward slashes
 */
function normalizeToForwardSlashes(pathValue) {
  if (sep === '\\') {
    return pathValue.split(sep).join('/');
  }
  return pathValue;
}

module.exports = {
  extensionResolver,
  default: extensionResolver,
};
