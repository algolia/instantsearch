const fs = require('fs');
const os = require('os');
const path = require('path');
const Module = require('module');

const { extensionResolver } = require('../rollup-plugin-extension-resolver.cjs');
const tempDirs = [];

function createTempDir() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'extension-resolver-'));
  tempDirs.push(tempDir);
  return tempDir;
}

function runTransform(code, { baseDir, options } = {}) {
  const plugin = extensionResolver(options);
  const result = plugin.renderChunk(code, {
    facadeModuleId: path.join(baseDir, 'entry.ts'),
  });
  return result ? result.code : code;
}

describe('rollup-plugin-extension-resolver', () => {
  afterEach(() => {
    while (tempDirs.length > 0) {
      const tempDir = tempDirs.pop();
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('adds .js extension for relative file imports', () => {
    const tempDir = createTempDir();
    const fooPath = path.join(tempDir, 'foo.ts');

    fs.writeFileSync(fooPath, '');

    const input = "import foo from './foo';";
    const output = runTransform(input, { baseDir: tempDir });

    expect(output).toBe("import foo from './foo.js';");
  });

  it('resolves directory imports to index.js', () => {
    const tempDir = createTempDir();
    const dirPath = path.join(tempDir, 'dir');

    fs.mkdirSync(dirPath, { recursive: true });
    fs.writeFileSync(path.join(dirPath, 'index.tsx'), '');

    const input = "export * from './dir';";
    const output = runTransform(input, { baseDir: tempDir });

    expect(output).toBe("export * from './dir/index.js';");
  });

  it('handles side-effect-only imports', () => {
    const tempDir = createTempDir();
    const sideEffectPath = path.join(tempDir, 'side.ts');

    fs.writeFileSync(sideEffectPath, '');

    const input = "import './side';";
    const output = runTransform(input, { baseDir: tempDir });

    expect(output).toBe("import './side.js';");
  });

  it('leaves specifiers with extensions untouched', () => {
    const tempDir = createTempDir();
    const input = "import foo from './foo.js';";
    const output = runTransform(input, { baseDir: tempDir });

    expect(output).toBe(input);
  });

  it('leaves unresolved paths untouched', () => {
    const tempDir = createTempDir();
    const input = "import foo from './missing';";
    const output = runTransform(input, { baseDir: tempDir });

    expect(output).toBe(input);
  });

  it('resolves external modules listed in modulesToResolve', () => {
    const tempDir = createTempDir();
    const moduleRoot = path.join(tempDir, 'node_modules', 'fake-pkg');
    const moduleEntry = path.join(moduleRoot, 'es', 'widgets.js');
    const originalNodePath = process.env.NODE_PATH;

    fs.mkdirSync(path.dirname(moduleEntry), { recursive: true });
    fs.writeFileSync(
      path.join(moduleRoot, 'package.json'),
      JSON.stringify({ name: 'fake-pkg', version: '1.0.0' })
    );
    fs.writeFileSync(moduleEntry, '');

    try {
      process.env.NODE_PATH = [path.join(tempDir, 'node_modules'), originalNodePath]
        .filter(Boolean)
        .join(path.delimiter);
      Module._initPaths();

      const input = "import widget from 'fake-pkg/es/widgets';";
      const output = runTransform(input, {
        baseDir: tempDir,
        options: { modulesToResolve: ['fake-pkg'] },
      });

      expect(output).toBe("import widget from 'fake-pkg/es/widgets.js';");
    } finally {
      process.env.NODE_PATH = originalNodePath;
      Module._initPaths();
    }
  });
});
