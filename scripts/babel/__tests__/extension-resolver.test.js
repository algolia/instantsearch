import fs from 'fs';

import { transformAsync } from '@babel/core';

import plugin from '../extension-resolver';
jest.mock('fs');

describe('babel-plugin-extension-resolver', () => {
  const pluginOptions = {
    modulesToResolve: [
      // in workspace (in local path)
      '@instantsearch/babel-testfixture',
      // not in workspace (in node_modules)
      'algoliasearch-v3',
    ],
  };
  const options = {
    filename: '/path/to/src/file.js',
    configFile: false,
    babelrc: false,
    plugins: [[plugin, pluginOptions]],
  };

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('name=babel-plugin-extension-resolver', () =>
    expect(plugin({ types: {} }, {}).name).toStrictEqual(
      'babel-plugin-extension-resolver'
    ));

  it('ignores empty code', async () => {
    expect(await transformAsync('', options)).toHaveProperty('code', '');
  });

  it('ignores module imports', async () => {
    expect(
      await transformAsync('import path from "path";', options)
    ).toHaveProperty('code', 'import path from "path";');
  });

  it('finds .js files', async () => {
    fs.__setMockFiles([
      '/path/to/src/other.js',
      '/path/to/src/other.ts',
      '/path/to/src/other.tsx',
    ]);

    expect(
      await transformAsync('import other from "./other";', options)
    ).toHaveProperty('code', 'import other from "./other.js";');
  });

  it('finds .ts files', async () => {
    fs.__setMockFiles(['/path/to/src/other.ts', '/path/to/src/other.tsx']);

    expect(
      await transformAsync('import other from "./other";', options)
    ).toHaveProperty('code', 'import other from "./other.js";');
  });

  it('finds .tsx files', async () => {
    fs.__setMockFiles(['/path/to/src/other.tsx']);

    expect(
      await transformAsync('import other from "./other";', options)
    ).toHaveProperty('code', 'import other from "./other.js";');
  });

  it('finds files in parent directory', async () => {
    fs.__setMockFiles(['/path/to/other.js', '/path/to/src/other.js']);

    expect(
      await transformAsync('import other from "../other";', options)
    ).toHaveProperty('code', 'import other from "../other.js";');
  });

  it('finds files in child directory', async () => {
    fs.__setMockFiles(['/path/to/src/other.js', '/path/to/src/child/other.js']);

    expect(
      await transformAsync('import other from "./child/other";', options)
    ).toHaveProperty('code', 'import other from "./child/other.js";');
  });

  it('uses index file', async () => {
    fs.__setMockFiles(['/path/to/src/other/index.js']);

    expect(
      await transformAsync('import other from "./other";', options)
    ).toHaveProperty('code', 'import other from "./other/index.js";');
  });

  it('uses modulesToResolve', async () => {
    fs.__setMockFiles(['/path/to/src/other/index.js']);

    expect(
      await transformAsync(
        'import workspaceRoot from "@instantsearch/babel-testfixture";\n' +
          'import workspacePath from "@instantsearch/babel-testfixture/nested/index/index";\n' +
          'import nodeModulesRoot from "algoliasearch-v3";\n' +
          'import nodeModulesPath from "algoliasearch-v3/src/browser/builds/algoliasearch";\n' +
          'import otherRoot from "different-module";\n' +
          'import otherPath from "different-module/other";',
        options
      )
    ).toHaveProperty(
      'code',
      'import workspaceRoot from "@instantsearch/babel-testfixture";\n' +
        'import workspacePath from "@instantsearch/babel-testfixture/nested/index/index.js";\n' +
        'import nodeModulesRoot from "algoliasearch-v3";\n' +
        'import nodeModulesPath from "algoliasearch-v3/src/browser/builds/algoliasearch.js";\n' +
        'import otherRoot from "different-module";\n' +
        'import otherPath from "different-module/other";'
    );
  });

  it('works with multiple imports', async () => {
    fs.__setMockFiles(['/path/to/src/other.js', '/path/to/src/another.js']);

    expect(
      await transformAsync(
        'import other from "./other";\nimport another from "./another";',
        options
      )
    ).toHaveProperty(
      'code',
      'import other from "./other.js";\nimport another from "./another.js";'
    );
  });

  it('works with export from', async () => {
    fs.__setMockFiles(['/path/to/src/other.js']);

    expect(
      await transformAsync('export * from "./other"', options)
    ).toHaveProperty('code', 'export * from "./other.js";');
  });

  it('ignores require()', async () => {
    fs.__setMockFiles(['/path/to/src/other.js', '/path/to/src/another.js']);

    expect(await transformAsync('require("./other");', options)).toHaveProperty(
      'code',
      'require("./other");'
    );
  });

  it('ignores other function calls', async () => {
    fs.__setMockFiles(['/path/to/src/other.js']);

    expect(
      await transformAsync('requireOOPS("./other");', options)
    ).toHaveProperty('code', 'requireOOPS("./other");');
  });

  it('errors if file not found', async () => {
    fs.__setMockFiles([]);

    await expect(() =>
      transformAsync('import other from "./other";', options)
    ).rejects.toThrow(
      '/path/to/src/file.js: import for "./other" could not be resolved'
    );
  });

  it('errors if module file not found', async () => {
    fs.__setMockFiles([]);

    await expect(() =>
      transformAsync(
        'import other from "@instantsearch/babel-testfixture/non-existing-folder-this-can-never-exist/qsdf/gh/jklm";',
        options
      )
    ).rejects.toThrow(
      "/path/to/src/file.js: Cannot find module '@instantsearch/babel-testfixture/non-existing-folder-this-can-never-exist/qsdf/gh/jklm' from 'scripts/babel/extension-resolver.js'"
    );
  });
});
