import fs from 'fs';
import os from 'os';
import path from 'path';

import {
  parseEnvFile,
  publicEnvPrefix,
  readProjectCredentials,
  writePublicEnv,
} from '../credentials';

function tempProject(files: Record<string, string>): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'instantsearch-creds-'));
  for (const [name, contents] of Object.entries(files)) {
    fs.writeFileSync(path.join(dir, name), contents, 'utf8');
  }
  return dir;
}

describe('parseEnvFile', () => {
  it('reads plain, quoted, exported, and commented values', () => {
    expect(
      parseEnvFile(
        [
          '# comment',
          'ALGOLIA_APP_ID=latency',
          'export ALGOLIA_INDEX_NAME="instant_search"',
          "ALGOLIA_SEARCH_API_KEY='abc' ",
          'TRAILING=value # note',
          'not a line',
        ].join('\n')
      )
    ).toEqual({
      ALGOLIA_APP_ID: 'latency',
      ALGOLIA_INDEX_NAME: 'instant_search',
      ALGOLIA_SEARCH_API_KEY: 'abc',
      TRAILING: 'value',
    });
  });
});

describe('readProjectCredentials', () => {
  it('layers .env < .env.local < process env, like Next.js and Vite', () => {
    const cwd = tempProject({
      '.env': 'ALGOLIA_APP_ID=from-env\nALGOLIA_INDEX_NAME=products\n',
      '.env.local':
        'ALGOLIA_APP_ID=from-local\nALGOLIA_SEARCH_API_KEY=local-key\n',
    });

    expect(readProjectCredentials(cwd, {})).toMatchObject({
      appId: {
        value: 'from-local',
        variable: 'ALGOLIA_APP_ID',
        file: '.env.local',
      },
      searchApiKey: { value: 'local-key', file: '.env.local' },
      indexName: { value: 'products', file: '.env' },
    });
    expect(
      readProjectCredentials(cwd, { ALGOLIA_APP_ID: 'from-process' }).appId
    ).toEqual({
      value: 'from-process',
      variable: 'ALGOLIA_APP_ID',
      file: undefined,
    });
  });

  it('recognizes Stripe Projects, Vercel, and framework-prefixed names', () => {
    expect(
      readProjectCredentials(
        tempProject({ '.env': 'ALGOLIA_APPLICATION_ID=stripe-app\n' }),
        {}
      ).appId?.value
    ).toBe('stripe-app');
    expect(
      readProjectCredentials(
        tempProject({
          '.env.local': 'NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY=pub\n',
        }),
        {}
      ).searchApiKey?.variable
    ).toBe('NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY');
  });

  it('reports privileged keys by name only', () => {
    const credentials = readProjectCredentials(
      tempProject({ '.env.local': 'ALGOLIA_WRITE_API_KEY=secret\n' }),
      {}
    );
    expect(credentials.privilegedKeyVariables).toEqual([
      'ALGOLIA_WRITE_API_KEY',
    ]);
    expect(JSON.stringify(credentials)).not.toContain('secret');
  });
});

describe('publicEnvPrefix', () => {
  it.each([
    [{ next: '16.0.0', react: '19.0.0' }, 'NEXT_PUBLIC_'],
    [{ vite: '8.0.0', react: '19.0.0' }, 'VITE_'],
    [{ 'react-scripts': '5.0.0' }, 'REACT_APP_'],
    [{ react: '19.0.0' }, null],
  ])('maps %j to %s', (dependencies, prefix) => {
    const cwd = tempProject({
      'package.json': JSON.stringify({ dependencies }),
    });
    expect(publicEnvPrefix(cwd)).toBe(prefix);
  });
});

describe('writePublicEnv', () => {
  it('appends only the missing browser-safe variables, once', () => {
    const cwd = tempProject({
      '.env.local': 'ALGOLIA_APP_ID=latency\nVITE_ALGOLIA_APP_ID=latency',
    });

    const changed = writePublicEnv(cwd, 'VITE_', {
      appId: 'latency',
      searchApiKey: 'search-key',
      indexName: 'instant_search',
    });
    expect(changed).toBe(path.join(cwd, '.env.local'));
    const contents = fs.readFileSync(path.join(cwd, '.env.local'), 'utf8');
    expect(parseEnvFile(contents)).toMatchObject({
      VITE_ALGOLIA_APP_ID: 'latency',
      VITE_ALGOLIA_SEARCH_API_KEY: 'search-key',
      VITE_ALGOLIA_INDEX_NAME: 'instant_search',
    });
    expect(contents.match(/VITE_ALGOLIA_APP_ID/g)).toHaveLength(1);

    expect(
      writePublicEnv(cwd, 'VITE_', {
        appId: 'latency',
        searchApiKey: 'search-key',
      })
    ).toBeNull();
  });
});
