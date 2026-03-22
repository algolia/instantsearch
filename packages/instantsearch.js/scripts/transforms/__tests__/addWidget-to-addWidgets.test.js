import { readFileSync } from 'fs';
import { join } from 'path';

import { applyTransform } from 'jscodeshift/dist/testUtils';

import transform from 'instantsearch-codemods/src/addWidget-to-addWidgets';

const fixtureDir = join(import.meta.dirname, '..', '__testfixtures__');

function readFixture(name) {
  return readFileSync(join(fixtureDir, `${name}.js`), 'utf8');
}

describe('addWidget-to-addWidgets', () => {
  it.each([
    'addWidget-to-addWidgets/global',
    'addWidget-to-addWidgets/imported',
    'addWidget-to-addWidgets/mixed',
    'addWidget-to-addWidgets/remove',
  ])('transforms correctly using "%s" data', (fixture) => {
    const input = readFixture(`${fixture}.input`);
    const expected = readFixture(`${fixture}.output`);

    const result = applyTransform(transform, null, { source: input });

    expect(result.trim()).toEqual(expected.trim());
  });
});
