import path from 'path';

import { detect } from '../src/detector';

const FIXTURES_ROOT = path.join(__dirname, 'fixtures', 'detector');

function fixture(name: string): string {
  return path.join(FIXTURES_ROOT, name);
}

describe('detect()', () => {
  describe('successful detection', () => {
    it('identifies a React + Vite project', () => {
      const result = detect(fixture('react-vite'), { command: 'init' });

      expect(result).toEqual({
        ok: true,
        flavor: 'react',
        framework: 'vite',
        typescript: false,
        aliases: {},
      });
    });

    it('identifies a Next.js App Router project', () => {
      const result = detect(fixture('next-app'), { command: 'init' });

      expect(result).toEqual({
        ok: true,
        flavor: 'react',
        framework: 'next-app',
        typescript: false,
        aliases: {},
      });
    });

    it('identifies a Next.js App Router project with src/app layout', () => {
      const result = detect(fixture('next-app-src'), { command: 'init' });

      expect(result).toEqual({
        ok: true,
        flavor: 'react',
        framework: 'next-app',
        typescript: false,
        aliases: {},
      });
    });

    it('flips typescript: true when tsconfig.json exists', () => {
      const result = detect(fixture('react-vite-ts'), { command: 'init' });

      expect(result).toMatchObject({
        ok: true,
        typescript: true,
      });
    });

    it('populates aliases from tsconfig compilerOptions.paths', () => {
      const result = detect(fixture('react-vite-ts'), { command: 'init' });

      expect(result).toMatchObject({
        ok: true,
        aliases: {
          '@/*': ['./src/*'],
          '@components/*': ['./src/components/*'],
        },
      });
    });

    it('parses tsconfig.json with JSONC syntax (comments, trailing commas)', () => {
      const result = detect(fixture('react-vite-ts-jsonc'), { command: 'init' });

      expect(result).toMatchObject({
        ok: true,
        typescript: true,
        aliases: {
          '@/*': ['./src/*'],
          '@components/*': ['./src/components/*'],
        },
      });
    });

    it('keeps typescript: true with empty aliases when tsconfig.json is unparseable', () => {
      const result = detect(fixture('react-vite-ts-broken'), { command: 'init' });

      expect(result).toMatchObject({
        ok: true,
        typescript: true,
        aliases: {},
      });
    });
  });

  describe('refusals', () => {
    it.each(['next-pages', 'next-pages-src'])(
      'refuses Next.js Pages Router-only projects (%s)',
      (name) => {
        const result = detect(fixture(name), { command: 'init' });

        expect(result).toEqual({
          ok: false,
          command: 'init',
          code: 'unsupported_framework',
          message: expect.any(String),
        });
      }
    );

    it.each(['next-ambiguous', 'next-ambiguous-src', 'next-ambiguous-src-app'])(
      'refuses Next.js projects with both App Router and Pages Router as ambiguous (%s)',
      (name) => {
        const result = detect(fixture(name), { command: 'init' });

        expect(result).toEqual({
          ok: false,
          command: 'init',
          code: 'ambiguous_framework',
          message: expect.any(String),
        });
      }
    );

    it.each(['vanilla', 'vue'])(
      'refuses %s projects with unsupported_flavor',
      (name) => {
        const result = detect(fixture(name), { command: 'init' });

        expect(result).toEqual({
          ok: false,
          command: 'init',
          code: 'unsupported_flavor',
          message: expect.any(String),
        });
      }
    );

    it('threads the caller-supplied command name into the envelope', () => {
      const result = detect(fixture('next-pages'), { command: 'add' });

      expect(result).toMatchObject({
        ok: false,
        command: 'add',
        code: 'unsupported_framework',
      });
    });
  });
});
