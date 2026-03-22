import { readFileSync } from 'fs';
import { join } from 'path';

import { applyTransform } from 'jscodeshift/dist/testUtils';

import transform from '../src/ris-v6-to-v7';

const fixtureDir = join(import.meta.dirname, '..', '__testfixtures__');

function readFixture(name: string) {
  return readFileSync(join(fixtureDir, `${name}.js`), 'utf8');
}

describe('src/ris-v6-to-v7', () => {
  it.each([
    'ris-v6-to-v7/app-inline',
    'ris-v6-to-v7/translations-not-inline',
    'ris-v6-to-v7/translations-functions-lambda',
    'ris-v6-to-v7/translations-functions-declaration',
    'ris-v6-to-v7/translations-functions-no-param',
    'ris-v6-to-v7/translations-functions-not-inline',
    'ris-v6-to-v7/placeholder-not-inline',
    'ris-v6-to-v7/import-path',
    'ris-v6-to-v7/menuselect',
    'ris-v6-to-v7/connectors',
    'ris-v6-to-v7/searchbox-icons',
  ])('transforms correctly using "%s" data', (fixture) => {
    const input = readFixture(`${fixture}.input`);
    const expected = readFixture(`${fixture}.output`);

    const result = applyTransform(transform, null, { source: input });

    expect(result.trim()).toEqual(expected.trim());
  });
});
