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

  test('no InstantSearch package → unsupported_framework error', () => {
    const result = detect(fixturePath('unsupported'));

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error('expected failure');
    expect(result.code).toBe('unsupported_framework');
    expect(result.message).toMatch(/react-instantsearch|instantsearch\.js/);
  });

  test('both react-instantsearch and instantsearch.js present → unsupported_framework error', () => {
    const result = detect(fixturePath('ambiguous'));

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error('expected failure');
    expect(result.code).toBe('unsupported_framework');
    expect(result.message).toMatch(/ambiguous|--flavor/i);
  });
});
