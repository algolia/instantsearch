import { render } from '@testing-library/react';
import React from 'react';
import { InstantSearch, Hits } from 'react-instantsearch-dom';

import {  } from '../widget';

const runAllMicroTasks = (): Promise<void> => new Promise(setImmediate);

describe('nothing', () => {
  it('tests nothing', async () => {
    const searchClient = {
      search(_requests: any[]) {
        return Promise.resolve({
          results: [
            {
              hits:
              [
                {
                  objectID: 'a',
                  name: 'test',
                },
              ],
            },
          ],
        });
      },
    };

    const { debug } = render(
      <InstantSearch indexName="test_index" searchClient={searchClient}>
        < />
        <Hits hitComponent={({ hit }: { hit: any }) => hit.name} />
      </InstantSearch>
    );

    await runAllMicroTasks();
    debug();
  });
});
