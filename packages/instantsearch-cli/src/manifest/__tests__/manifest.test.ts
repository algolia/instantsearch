import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  readRootManifest,
  writeRootManifest,
  ROOT_MANIFEST_FILENAME,
} from '../index';

function makeTempProject(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'is-cli-manifest-'));
}

describe('manifest', () => {
  test('writeRootManifest then readRootManifest returns the same content', () => {
    const projectDir = makeTempProject();
    const manifest = {
      apiVersion: 1 as const,
      flavor: 'react' as const,
      framework: null,
      typescript: true,
      componentsPath: 'src/components',
      aliases: { components: '@/components' },
      algolia: { appId: 'APP', searchApiKey: 'KEY' },
      experiences: [],
    };

    writeRootManifest(projectDir, manifest);

    expect(readRootManifest(projectDir)).toEqual(manifest);
  });

  test('writeRootManifest creates instantsearch.json at the project root', () => {
    const projectDir = makeTempProject();

    writeRootManifest(projectDir, { apiVersion: 1, flavor: 'react' });

    const written = fs.readFileSync(
      path.join(projectDir, ROOT_MANIFEST_FILENAME),
      'utf8'
    );
    expect(JSON.parse(written)).toEqual({ apiVersion: 1, flavor: 'react' });
  });

  test('readRootManifest returns null when no manifest exists', () => {
    const projectDir = makeTempProject();

    expect(readRootManifest(projectDir)).toBeNull();
  });
});
