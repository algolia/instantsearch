import path from 'node:path';

import { detect } from '../index';

const fixturePath = (name: string): string =>
  path.join(__dirname, 'fixtures', name);

describe('detector', () => {
  test('React + TypeScript fixture detects react flavor with no framework, typescript: true', () => {
    const result = detect(fixturePath('react-ts'));

    expect(result).toEqual({
      ok: true,
      detection: {
        flavor: 'react',
        framework: null,
        typescript: true,
        componentsPath: 'src/components',
        aliases: { components: '@/components' },
      },
    });
  });

  test('React + plain JS fixture detects react flavor with no framework, typescript: false', () => {
    const result = detect(fixturePath('react-js'));

    expect(result).toEqual({
      ok: true,
      detection: {
        flavor: 'react',
        framework: null,
        typescript: false,
        componentsPath: 'src/components',
        aliases: {},
      },
    });
  });

  test('react in deps but no IS package → needs_install with inferred flavor react', () => {
    const result = detect(fixturePath('react-no-is'));

    expect(result).toEqual({
      ok: true,
      detection: {
        flavor: 'react',
        framework: null,
        typescript: false,
        componentsPath: 'src/components',
        aliases: {},

        packagesToInstall: ['react-instantsearch', 'algoliasearch'],
      },
    });
  });

  test('next in deps but no IS package → needs_install with react + nextjs', () => {
    const result = detect(fixturePath('next-no-is'));

    expect(result).toEqual({
      ok: true,
      detection: {
        flavor: 'react',
        framework: 'nextjs',
        typescript: false,
        componentsPath: 'components',
        aliases: {},

        packagesToInstall: [
          'react-instantsearch',
          'react-instantsearch-nextjs',
          'algoliasearch',
        ],
      },
    });
  });

  test('no InstantSearch package and no react/next → needs_install with inferred flavor js', () => {
    const result = detect(fixturePath('unsupported'));

    expect(result).toEqual({
      ok: true,
      detection: {
        flavor: 'js',
        framework: null,
        typescript: false,
        componentsPath: 'components',
        aliases: {},

        packagesToInstall: ['instantsearch.js', 'algoliasearch'],
      },
    });
  });

  test('both react-instantsearch and instantsearch.js present → unsupported_framework error', () => {
    const result = detect(fixturePath('ambiguous'));

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error('expected failure');
    expect(result.code).toBe('unsupported_framework');
    expect(result.message).toMatch(/ambiguous|--flavor/i);
  });

  test('Next.js project with both app/ and pages/ → unsupported_framework with --framework hint', () => {
    const result = detect(fixturePath('next-ambiguous'));

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error('expected failure');
    expect(result.code).toBe('unsupported_framework');
    expect(result.message).toMatch(/--framework nextjs/);
    expect(result.message).toMatch(/app.*pages|pages.*app/i);
  });

  test('JS-only fixture detects js flavor with no framework, typescript: false', () => {
    const result = detect(fixturePath('js-only'));

    expect(result).toEqual({
      ok: true,
      detection: {
        flavor: 'js',
        framework: null,
        typescript: false,
        componentsPath: 'src/components',
        aliases: {},
      },
    });
  });

  test('Next.js App Router + TS fixture detects react flavor with framework nextjs', () => {
    const result = detect(fixturePath('nextjs-ts'));

    expect(result).toEqual({
      ok: true,
      detection: {
        flavor: 'react',
        framework: 'nextjs',
        typescript: true,
        componentsPath: 'src/components',
        aliases: { components: '@/components' },
      },
    });
  });
});
