import { generate } from '../index';

describe('generator', () => {
  test('React + TypeScript emits src/lib/algolia-client.ts with appId + searchApiKey inlined', () => {
    const files = generate({
      flavor: 'react',
      framework: null,
      typescript: true,
      algolia: { appId: 'APP_ID_XYZ', searchApiKey: 'SEARCH_KEY_XYZ' },
    });

    const contents = files.get('src/lib/algolia-client.ts');
    expect(contents).toBeDefined();
    expect(contents).toMatch(/from ['"]algoliasearch['"]/);
    expect(contents).toContain("'APP_ID_XYZ'");
    expect(contents).toContain("'SEARCH_KEY_XYZ'");
    expect(contents).toMatch(/export const searchClient/);
  });

  test('React + plain JS emits src/lib/algolia-client.js', () => {
    const files = generate({
      flavor: 'react',
      framework: null,
      typescript: false,
      algolia: { appId: 'APP_ID_XYZ', searchApiKey: 'SEARCH_KEY_XYZ' },
    });

    expect(files.has('src/lib/algolia-client.js')).toBe(true);
    expect(files.has('src/lib/algolia-client.ts')).toBe(false);
  });

  test('snapshot: React + TypeScript algolia-client.ts', () => {
    const files = generate({
      flavor: 'react',
      framework: null,
      typescript: true,
      algolia: { appId: 'APP_ID', searchApiKey: 'SEARCH_KEY' },
    });
    expect(files.get('src/lib/algolia-client.ts')).toMatchSnapshot();
  });

  test('snapshot: React + plain JS algolia-client.js', () => {
    const files = generate({
      flavor: 'react',
      framework: null,
      typescript: false,
      algolia: { appId: 'APP_ID', searchApiKey: 'SEARCH_KEY' },
    });
    expect(files.get('src/lib/algolia-client.js')).toMatchSnapshot();
  });
});
