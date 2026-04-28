import fs from 'node:fs';
import path from 'node:path';

import { getSupportedWidgets, UNSUPPORTED_WIDGETS } from '../index';

const MONOREPO_ROOT = path.resolve(__dirname, '../../../../..');

function parseReactBarrel(): string[] {
  const barrel = fs.readFileSync(
    path.join(MONOREPO_ROOT, 'packages/react-instantsearch/src/widgets/index.ts'),
    'utf8'
  );
  return [...barrel.matchAll(/export \* from '\.\/(\w+)'/g)].map((m) => m[1]);
}

describe('widget registry coverage', () => {
  const supported = new Set(getSupportedWidgets());
  const reactWidgets = parseReactBarrel();

  test('every React widget is either supported or explicitly unsupported', () => {
    const uncovered = reactWidgets.filter(
      (w) => !supported.has(w) && !UNSUPPORTED_WIDGETS.has(w)
    );

    expect(uncovered).toEqual([]);
  });

  test('no widget is both supported and unsupported', () => {
    const overlap = [...supported].filter((w) => UNSUPPORTED_WIDGETS.has(w));

    expect(overlap).toEqual([]);
  });

  test('UNSUPPORTED_WIDGETS contains no stale entries', () => {
    const stale = [...UNSUPPORTED_WIDGETS].filter(
      (w) => !reactWidgets.includes(w)
    );

    expect(stale).toEqual([]);
  });
});
