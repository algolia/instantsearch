import { transformAsync } from '@babel/core';

import plugin from '../extension-resolver';

describe('babel-plugin-extension-resolver', () => {
  let files;
  let options;

  beforeEach(() => {
    files = {};
    options = {
      filename: '/path/to/src/file.js',
      configFile: false,
      babelrc: false,
      plugins: [
        [
          plugin,
          {
            resolveOptions: {
              isFile: jest.fn((filename) => Boolean(files[filename])),
              isDirectory: jest.fn(() => false),
              readFileSync: jest.fn((filename) => files[filename]),
            },
          },
        ],
      ],
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('name=babel-plugin-extension-resolver', () =>
    expect(plugin({ types: {} }, {}).name).toStrictEqual(
      'babel-plugin-extension-resolver'
    ));

  it('ignores empty code', async () =>
    expect(await transformAsync('', options)).toHaveProperty('code', ''));

  it('ignores module imports', async () =>
    expect(
      await transformAsync('import path from "path";', options)
    ).toHaveProperty('code', 'import path from "path";'));

  it('finds .node.mjs files', async () => {
    files = {
      '/path/to/src/other.node.mjs': true,
      '/path/to/src/other.mjs': true,
      '/path/to/src/other.node.js': true,
      '/path/to/src/other.js': true,
      '/path/to/src/other.node.ts': true,
      '/path/to/src/other.ts': true,
      '/path/to/src/other.node.tsx': true,
      '/path/to/src/other.tsx': true,
      '/path/to/src/other.json': true,
      '/path/to/src/other.node.jsx': true,
      '/path/to/src/other.jsx': true,
      '/path/to/src/other.node': true,
    };

    expect(
      await transformAsync('import other from "./other";', options)
    ).toHaveProperty('code', 'import other from "./other.node.mjs";');
  });

  it('finds .mjs files', async () => {
    files = {
      '/path/to/src/other.mjs': true,
      '/path/to/src/other.node.js': true,
      '/path/to/src/other.js': true,
      '/path/to/src/other.node.ts': true,
      '/path/to/src/other.ts': true,
      '/path/to/src/other.node.tsx': true,
      '/path/to/src/other.tsx': true,
      '/path/to/src/other.json': true,
      '/path/to/src/other.node.jsx': true,
      '/path/to/src/other.jsx': true,
      '/path/to/src/other.node': true,
    };

    expect(
      await transformAsync('import other from "./other";', options)
    ).toHaveProperty('code', 'import other from "./other.mjs";');
  });

  it('finds .node.js files', async () => {
    files = {
      '/path/to/src/other.node.js': true,
      '/path/to/src/other.js': true,
      '/path/to/src/other.node.ts': true,
      '/path/to/src/other.ts': true,
      '/path/to/src/other.node.tsx': true,
      '/path/to/src/other.tsx': true,
      '/path/to/src/other.json': true,
      '/path/to/src/other.node.jsx': true,
      '/path/to/src/other.jsx': true,
      '/path/to/src/other.node': true,
    };

    expect(
      await transformAsync('import other from "./other";', options)
    ).toHaveProperty('code', 'import other from "./other.node.js";');
  });

  it('finds .js files', async () => {
    files = {
      '/path/to/src/other.js': true,
      '/path/to/src/other.node.ts': true,
      '/path/to/src/other.ts': true,
      '/path/to/src/other.node.tsx': true,
      '/path/to/src/other.tsx': true,
      '/path/to/src/other.json': true,
      '/path/to/src/other.node.jsx': true,
      '/path/to/src/other.jsx': true,
      '/path/to/src/other.node': true,
    };

    expect(
      await transformAsync('import other from "./other";', options)
    ).toHaveProperty('code', 'import other from "./other.js";');
  });

  it('finds .node.ts files', async () => {
    files = {
      '/path/to/src/other.node.ts': true,
      '/path/to/src/other.ts': true,
      '/path/to/src/other.node.tsx': true,
      '/path/to/src/other.tsx': true,
      '/path/to/src/other.json': true,
      '/path/to/src/other.node.jsx': true,
      '/path/to/src/other.jsx': true,
      '/path/to/src/other.node': true,
    };

    expect(
      await transformAsync('import other from "./other";', options)
    ).toHaveProperty('code', 'import other from "./other.node.ts";');
  });

  it('finds .ts files', async () => {
    files = {
      '/path/to/src/other.ts': true,
      '/path/to/src/other.node.tsx': true,
      '/path/to/src/other.tsx': true,
      '/path/to/src/other.json': true,
      '/path/to/src/other.node.jsx': true,
      '/path/to/src/other.jsx': true,
      '/path/to/src/other.node': true,
    };

    expect(
      await transformAsync('import other from "./other";', options)
    ).toHaveProperty('code', 'import other from "./other.ts";');
  });

  it('finds .node.tsx files', async () => {
    files = {
      '/path/to/src/other.node.tsx': true,
      '/path/to/src/other.tsx': true,
      '/path/to/src/other.json': true,
      '/path/to/src/other.node.jsx': true,
      '/path/to/src/other.jsx': true,
      '/path/to/src/other.node': true,
    };

    expect(
      await transformAsync('import other from "./other";', options)
    ).toHaveProperty('code', 'import other from "./other.node.tsx";');
  });

  it('finds .tsx files', async () => {
    files = {
      '/path/to/src/other.tsx': true,
      '/path/to/src/other.json': true,
      '/path/to/src/other.node.jsx': true,
      '/path/to/src/other.jsx': true,
      '/path/to/src/other.node': true,
    };

    expect(
      await transformAsync('import other from "./other";', options)
    ).toHaveProperty('code', 'import other from "./other.tsx";');
  });

  it('finds .json files', async () => {
    files = {
      '/path/to/src/other.json': true,
      '/path/to/src/other.node.jsx': true,
      '/path/to/src/other.jsx': true,
      '/path/to/src/other.node': true,
    };

    expect(
      await transformAsync('import other from "./other";', options)
    ).toHaveProperty('code', 'import other from "./other.json";');
  });

  it('finds .node.jsx files', async () => {
    files = {
      '/path/to/src/other.node.jsx': true,
      '/path/to/src/other.jsx': true,
      '/path/to/src/other.node': true,
    };

    expect(
      await transformAsync('import other from "./other";', options)
    ).toHaveProperty('code', 'import other from "./other.node.jsx";');
  });

  it('finds .jsx files', async () => {
    files = {
      '/path/to/src/other.jsx': true,
      '/path/to/src/other.node': true,
    };

    expect(
      await transformAsync('import other from "./other";', options)
    ).toHaveProperty('code', 'import other from "./other.jsx";');
  });

  it('finds .node files', async () => {
    files = {
      '/path/to/src/other.node': true,
    };

    expect(
      await transformAsync('import other from "./other";', options)
    ).toHaveProperty('code', 'import other from "./other.node";');
  });

  it('uses extensions override', async () => {
    options.plugins[0][1].extensions = ['.jsx'];
    files = {
      '/path/to/src/other.node.mjs': true,
      '/path/to/src/other.mjs': true,
      '/path/to/src/other.node.js': true,
      '/path/to/src/other.js': true,
      '/path/to/src/other.node.ts': true,
      '/path/to/src/other.ts': true,
      '/path/to/src/other.node.tsx': true,
      '/path/to/src/other.tsx': true,
      '/path/to/src/other.json': true,
      '/path/to/src/other.node.jsx': true,
      '/path/to/src/other.jsx': true,
      '/path/to/src/other.node': true,
    };

    expect(
      await transformAsync('import other from "./other";', options)
    ).toHaveProperty('code', 'import other from "./other.jsx";');
  });

  it('finds files in parent directory', async () => {
    files = {
      '/path/to/other.js': true,
      '/path/to/src/other.js': true,
    };

    expect(
      await transformAsync('import other from "../other";', options)
    ).toHaveProperty('code', 'import other from "../other.js";');
  });

  it('finds files in child directory', async () => {
    files = {
      '/path/to/src/child/other.js': true,
      '/path/to/src/other.js': true,
    };

    expect(
      await transformAsync('import other from "./child/other";', options)
    ).toHaveProperty('code', 'import other from "./child/other.js";');
  });

  it('uses index file', async () => {
    files = {
      '/path/to/src/other/index.mjs': true,
    };

    expect(
      await transformAsync('import other from "./other";', options)
    ).toHaveProperty('code', 'import other from "./other/index.mjs";');
  });

  it('works with multiple imports', async () => {
    files = {
      '/path/to/src/other.js': true,
      '/path/to/src/another.js': true,
    };

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

  it('ignores require()', async () => {
    files = {
      '/path/to/src/other.node.mjs': true,
      '/path/to/src/other.js': true,
    };

    expect(await transformAsync('require("./other");', options)).toHaveProperty(
      'code',
      'require("./other");'
    );
  });

  it('ignores dynamic require()', async () => {
    files = {
      '/path/to/src/other.node.mjs': true,
      '/path/to/src/other.js': true,
    };

    expect(
      await transformAsync(
        'const other = "./other";\n\nrequire(other);',
        options
      )
    ).toHaveProperty('code', 'const other = "./other";\n\nrequire(other);');
  });

  it('ignores multiple arguments', async () => {
    files = {
      '/path/to/src/other.node.mjs': true,
      '/path/to/src/other.js': true,
    };

    expect(
      await transformAsync('require("./other", true);', options)
    ).toHaveProperty('code', 'require("./other", true);');
  });

  it('ignores other function calls', async () => {
    files = {
      '/path/to/src/other.node.mjs': true,
      '/path/to/src/other.js': true,
    };

    expect(
      await transformAsync('requireOOPS("./other");', options)
    ).toHaveProperty('code', 'requireOOPS("./other");');
  });

  it('works with export from', async () => {
    files = {
      '/path/to/src/other.js': true,
    };

    expect(
      await transformAsync('export * from "./other"', options)
    ).toHaveProperty('code', 'export * from "./other.js";');
  });

  /*
   * TODO package.json resolution
   * BODY https://github.com/browserify/resolve/blob/master/test/mock_sync.js#L49
   */

  /*
   * TODO dynamic imports
   * BODY https://babeljs.io/docs/en/babel-plugin-syntax-dynamic-import
   */
});
