import { readFileSync } from 'fs';
import { join } from 'path';

import { applyTransform } from 'jscodeshift/dist/testUtils';

import transform from '../src/rish-to-ris';

const fixtureDir = join(import.meta.dirname, '..', '__testfixtures__');

function readFixture(name: string) {
  return readFileSync(join(fixtureDir, `${name}.js`), 'utf8');
}

describe('src/rish-to-ris', () => {
  it.each([
    'rish-to-ris/import',
    'rish-to-ris/path',
    'rish-to-ris/use',
    'rish-to-ris/renderToString',
  ])('transforms correctly using "%s" data', (fixture) => {
    const input = readFixture(`${fixture}.input`);
    const expected = readFixture(`${fixture}.output`);

    const result = applyTransform(transform, null, { source: input });

    expect(result.trim()).toEqual(expected.trim());
  });
});
