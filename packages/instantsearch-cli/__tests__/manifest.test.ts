import fs from 'fs';
import os from 'os';
import path from 'path';

import {
  MANIFEST_API_VERSION,
  readManifest,
  serializeManifest,
  validateManifest,
  writeManifest,
  type Manifest,
} from '../src/manifest';

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'instantsearch-cli-manifest-'));
}

function validManifest(overrides: Partial<Manifest> = {}): Manifest {
  return {
    apiVersion: MANIFEST_API_VERSION,
    flavor: 'react',
    framework: 'vite',
    typescript: true,
    componentsPath: 'src/components',
    libPath: 'src/lib',
    aliases: { '@/*': ['./src/*'] },
    algolia: {
      appId: 'APP_ID',
      searchApiKey: 'SEARCH_KEY',
    },
    features: [
      { name: 'search', path: 'src/features/search', indexName: 'products' },
    ],
    ...overrides,
  };
}

describe('manifest', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = makeTempDir();
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  describe('readManifest', () => {
    it('returns the parsed manifest when JSON is valid', () => {
      const filePath = path.join(tempDir, 'instantsearch.json');
      const manifest = validManifest();
      fs.writeFileSync(filePath, serializeManifest(manifest), 'utf8');

      const result = readManifest(filePath, { command: 'introspect' });

      expect(result).toEqual({ ok: true, manifest });
    });

    it('returns invalid_manifest for malformed JSON', () => {
      const filePath = path.join(tempDir, 'instantsearch.json');
      fs.writeFileSync(filePath, '{ not valid json', 'utf8');

      const result = readManifest(filePath, { command: 'add' });

      expect(result).toEqual({
        ok: false,
        command: 'add',
        code: 'invalid_manifest',
        message: expect.stringContaining('not valid JSON'),
      });
    });

    it('returns not_found when the file does not exist', () => {
      const filePath = path.join(tempDir, 'missing.json');

      const result = readManifest(filePath, { command: 'add' });

      expect(result).toEqual({
        ok: false,
        command: 'add',
        code: 'not_found',
        message: expect.stringContaining(filePath),
      });
    });

    it('returns invalid_manifest when the schema is violated', () => {
      const filePath = path.join(tempDir, 'instantsearch.json');
      const bad = { ...validManifest(), apiVersion: 2 };
      fs.writeFileSync(filePath, JSON.stringify(bad), 'utf8');

      const result = readManifest(filePath, { command: 'introspect' });

      expect(result).toMatchObject({
        ok: false,
        command: 'introspect',
        code: 'invalid_manifest',
      });
    });
  });

  describe('writeManifest', () => {
    it('writes a manifest that round-trips byte-identically', () => {
      const filePath = path.join(tempDir, 'instantsearch.json');
      const manifest = validManifest();

      const writeResult = writeManifest(filePath, manifest, {
        command: 'init',
      });
      expect(writeResult).toEqual({ ok: true, path: filePath });

      const writtenBytes = fs.readFileSync(filePath);
      expect(writtenBytes.equals(Buffer.from(serializeManifest(manifest)))).toBe(
        true
      );

      const readResult = readManifest(filePath, { command: 'introspect' });
      expect(readResult).toEqual({ ok: true, manifest });
    });

    it('returns manifest_exists when init points at an existing path', () => {
      const filePath = path.join(tempDir, 'instantsearch.json');
      fs.writeFileSync(filePath, serializeManifest(validManifest()), 'utf8');

      const result = writeManifest(filePath, validManifest(), {
        command: 'init',
      });

      expect(result).toEqual({
        ok: false,
        command: 'init',
        code: 'manifest_exists',
        message: expect.stringContaining(filePath),
      });
    });

  });

  describe('validateManifest', () => {
    it('accepts a fully populated manifest', () => {
      const manifest = validManifest();
      const result = validateManifest(manifest, { command: 'introspect' });
      expect(result).toEqual({ ok: true, manifest });
    });

    it.each([
      'flavor',
      'framework',
      'typescript',
      'componentsPath',
      'libPath',
      'aliases',
      'algolia',
      'features',
    ])('rejects missing "%s" with invalid_manifest', (field) => {
      const manifest = validManifest();
      delete (manifest as Record<string, unknown>)[field];

      const result = validateManifest(manifest, { command: 'init' });

      expect(result).toMatchObject({
        ok: false,
        command: 'init',
        code: 'invalid_manifest',
      });
    });

    it('rejects malformed feature entries', () => {
      const manifest = validManifest({
        features: [
          { name: 'search', path: '', indexName: 'products' },
        ],
      });

      const result = validateManifest(manifest, { command: 'add' });

      expect(result).toMatchObject({
        ok: false,
        code: 'invalid_manifest',
        message: expect.stringContaining('features[0].path'),
      });
    });

    it('rejects malformed algolia credentials', () => {
      const manifest = validManifest({
        algolia: { appId: 'APP', searchApiKey: 123 as unknown as string },
      });

      const result = validateManifest(manifest, { command: 'init' });

      expect(result).toMatchObject({
        ok: false,
        code: 'invalid_manifest',
        message: expect.stringContaining('algolia.searchApiKey'),
      });
    });

    it('rejects an apiVersion that does not equal 1', () => {
      const manifest = { ...validManifest(), apiVersion: 2 as unknown as 1 };
      const result = validateManifest(manifest, { command: 'init' });

      expect(result).toMatchObject({
        ok: false,
        code: 'invalid_manifest',
        message: expect.stringContaining('apiVersion'),
      });
    });
  });
});
