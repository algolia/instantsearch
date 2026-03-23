/* eslint-disable import/no-commonjs */
const fs = require('fs');
const os = require('os');
const path = require('path');

const { fixMismatchesIn } = require('../fix-mismatches');
const { buildVersionFileContent } = require('../shared');

function createTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'fix-mismatches-'));
}

function writePackage(dir, name, version, deps = {}) {
  const pkgDir = path.join(dir, 'packages', name);
  fs.mkdirSync(pkgDir, { recursive: true });
  fs.writeFileSync(
    path.join(pkgDir, 'package.json'),
    `${JSON.stringify({ name, version, ...deps }, null, 2)}\n`
  );
  return pkgDir;
}

function writeVersionFile(dir, name, filePath, version, format) {
  const fullPath = path.join(dir, 'packages', name, filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, buildVersionFileContent(version, format));
}

function writeChangelog(dir, name, content) {
  const changelogPath = path.join(dir, 'packages', name, 'CHANGELOG.md');
  fs.writeFileSync(changelogPath, content);
}

function writeExample(dir, examplePath, deps) {
  const exampleDir = path.join(dir, 'examples', examplePath);
  fs.mkdirSync(exampleDir, { recursive: true });
  fs.writeFileSync(
    path.join(exampleDir, 'package.json'),
    `${JSON.stringify(
      { name: examplePath, version: '0.0.0', ...deps },
      null,
      2
    )}\n`
  );
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function runFix(tmpDir, packageGroups, versionFiles = []) {
  fixMismatchesIn(packageGroups, versionFiles, {
    rootDir: tmpDir,
    packagesDir: path.join(tmpDir, 'packages'),
    examplesDir: path.join(tmpDir, 'examples'),
  });
}

describe('fixMismatchesIn', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = createTmpDir();
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('bumps lagging package version to the highest in the group', () => {
    writePackage(tmpDir, 'pkg-a', '1.2.0');
    writePackage(tmpDir, 'pkg-b', '1.1.0');
    writePackage(tmpDir, 'pkg-c', '1.2.0');

    runFix(tmpDir, { group: ['pkg-a', 'pkg-b', 'pkg-c'] });

    const pkgB = readJson(path.join(tmpDir, 'packages/pkg-b/package.json'));
    expect(pkgB.version).toBe('1.2.0');
  });

  it('does not modify packages already at the highest version', () => {
    writePackage(tmpDir, 'pkg-a', '1.2.0');
    writePackage(tmpDir, 'pkg-b', '1.1.0');

    runFix(tmpDir, { group: ['pkg-a', 'pkg-b'] });

    const pkgA = readJson(path.join(tmpDir, 'packages/pkg-a/package.json'));
    expect(pkgA.version).toBe('1.2.0');
  });

  it('updates the in-source version file', () => {
    writePackage(tmpDir, 'pkg-a', '1.2.0');
    writeVersionFile(tmpDir, 'pkg-a', 'src/version.ts', '1.1.0', 'esm');

    runFix(tmpDir, {}, [
      { name: 'pkg-a', versionFile: 'src/version.ts', format: 'esm' },
    ]);

    const content = fs.readFileSync(
      path.join(tmpDir, 'packages/pkg-a/src/version.ts'),
      'utf8'
    );
    expect(content).toBe("export default '1.2.0';\n");
  });

  it('updates cjs version files', () => {
    writePackage(tmpDir, 'pkg-a', '2.0.0');
    writeVersionFile(tmpDir, 'pkg-a', 'src/version.js', '1.9.0', 'cjs');

    runFix(tmpDir, {}, [
      { name: 'pkg-a', versionFile: 'src/version.js', format: 'cjs' },
    ]);

    const content = fs.readFileSync(
      path.join(tmpDir, 'packages/pkg-a/src/version.js'),
      'utf8'
    );
    expect(content).toBe("'use strict';\n\nmodule.exports = '2.0.0';\n");
  });

  it('inserts a CHANGELOG entry for bumped packages', () => {
    writePackage(tmpDir, 'pkg-a', '1.2.0');
    writePackage(tmpDir, 'pkg-b', '1.1.0');
    writeChangelog(
      tmpDir,
      'pkg-b',
      [
        '# Change Log',
        '',
        '## [1.1.0](https://github.com/algolia/instantsearch/compare/pkg-b@1.0.0...pkg-b@1.1.0) (2026-01-01)',
        '',
        '**Note:** Version bump only for package pkg-b',
        '',
      ].join('\n')
    );

    runFix(tmpDir, { group: ['pkg-a', 'pkg-b'] });

    const changelog = fs.readFileSync(
      path.join(tmpDir, 'packages/pkg-b/CHANGELOG.md'),
      'utf8'
    );
    expect(changelog).toContain('## [1.2.0]');
    expect(changelog).toContain('compare/pkg-b@1.1.0...pkg-b@1.2.0');
    expect(changelog).toContain(
      '**Note:** Version bump only for package pkg-b'
    );
    // New entry should come before the old one
    expect(changelog.indexOf('## [1.2.0]')).toBeLessThan(
      changelog.indexOf('## [1.1.0]')
    );
  });

  it('updates dependency references in other packages', () => {
    writePackage(tmpDir, 'pkg-a', '1.2.0');
    writePackage(tmpDir, 'pkg-b', '1.1.0');
    writePackage(tmpDir, 'pkg-consumer', '2.0.0', {
      dependencies: { 'pkg-b': '1.1.0' },
    });

    runFix(tmpDir, { group: ['pkg-a', 'pkg-b'] });

    const consumer = readJson(
      path.join(tmpDir, 'packages/pkg-consumer/package.json')
    );
    expect(consumer.dependencies['pkg-b']).toBe('1.2.0');
  });

  it('updates devDependencies references', () => {
    writePackage(tmpDir, 'pkg-a', '1.2.0');
    writePackage(tmpDir, 'pkg-b', '1.1.0');
    writePackage(tmpDir, 'pkg-consumer', '2.0.0', {
      devDependencies: { 'pkg-b': '1.1.0' },
    });

    runFix(tmpDir, { group: ['pkg-a', 'pkg-b'] });

    const consumer = readJson(
      path.join(tmpDir, 'packages/pkg-consumer/package.json')
    );
    expect(consumer.devDependencies['pkg-b']).toBe('1.2.0');
  });

  it('updates dependency references in examples', () => {
    writePackage(tmpDir, 'pkg-a', '1.2.0');
    writePackage(tmpDir, 'pkg-b', '1.1.0');
    writeExample(tmpDir, 'react/my-app', {
      dependencies: { 'pkg-b': '1.1.0' },
    });

    runFix(tmpDir, { group: ['pkg-a', 'pkg-b'] });

    const example = readJson(
      path.join(tmpDir, 'examples/react/my-app/package.json')
    );
    expect(example.dependencies['pkg-b']).toBe('1.2.0');
  });

  it('skips node_modules when scanning for dependency references', () => {
    writePackage(tmpDir, 'pkg-a', '1.2.0');
    writePackage(tmpDir, 'pkg-b', '1.1.0');

    // Create a node_modules package that references pkg-b
    const nmDir = path.join(tmpDir, 'packages/pkg-a/node_modules/some-dep');
    fs.mkdirSync(nmDir, { recursive: true });
    fs.writeFileSync(
      path.join(nmDir, 'package.json'),
      JSON.stringify({
        name: 'some-dep',
        dependencies: { 'pkg-b': '1.0.0' },
      })
    );

    runFix(tmpDir, { group: ['pkg-a', 'pkg-b'] });

    // node_modules file should be untouched
    const nmPkg = readJson(path.join(nmDir, 'package.json'));
    expect(nmPkg.dependencies['pkg-b']).toBe('1.0.0');
  });
});
