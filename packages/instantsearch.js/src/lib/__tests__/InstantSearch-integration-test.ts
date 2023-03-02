/**
 * @jest-environment jsdom
 */

import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils/wait';
import { getByText, fireEvent } from '@testing-library/dom';

import { connectConfigure, connectSearchBox } from '../../connectors';
import instantsearch from '../../index.es';
import { configure, searchBox } from '../../widgets';

import type { MiddlewareDefinition } from '../../types';

describe('configure', () => {
  it('provides up-to-date uiState to onStateChange', () => {
    const container = document.createElement('div');
    const onStateChange = jest.fn();
    const search = instantsearch({
      indexName: 'instant_search',
      searchClient: createSearchClient(),
      onStateChange({ uiState, setUiState }) {
        onStateChange(uiState);
        setUiState(uiState);
      },
    });
    const customComp = connectConfigure(({ refine }, isFirstRendering) => {
      if (isFirstRendering) {
        const button = document.createElement('button');
        button.setAttribute('type', 'button');
        button.textContent = 'click me';
        container.appendChild(button);
        container.querySelector('button')!.addEventListener('click', () => {
          refine({ hitsPerPage: 4 });
        });
      }
    });
    search.addWidgets([
      configure({
        hitsPerPage: 10,
      }),
      customComp({ searchParameters: {} }),
    ]);

    search.start();
    expect(onStateChange).not.toHaveBeenCalled();

    fireEvent.click(getByText(container, 'click me'));
    expect(onStateChange).toHaveBeenCalledTimes(1);
    expect(onStateChange).toHaveBeenCalledWith({
      instant_search: { configure: { hitsPerPage: 4 } },
    });
  });
});

describe('middleware', () => {
  it("runs middlewares' onStateChange when uiState changes", async () => {
    const container = document.createElement('div');
    const search = instantsearch({
      indexName: 'instant_search',
      searchClient: createSearchClient(),
    });

    const middlewareDefinition: MiddlewareDefinition = {
      $$type: 'fake',
      $$internal: false,
      onStateChange: jest.fn(),
      subscribe: jest.fn(),
      started: jest.fn(),
      unsubscribe: jest.fn(),
    };

    search.use(() => middlewareDefinition);

    search.addWidgets([
      searchBox({
        container,
        placeholder: 'search',
      }),
    ]);

    search.start();

    fireEvent.input(container.querySelector('input')!, {
      target: { value: 'q' },
    });

    await wait(0);
    expect(middlewareDefinition.onStateChange).toHaveBeenCalledTimes(1);
  });

  it("runs middlewares' onStateChange when uiState changes with user-provided onStateChange param", async () => {
    const container = document.createElement('div');
    const search = instantsearch({
      indexName: 'instant_search',
      searchClient: createSearchClient(),
      onStateChange({ uiState, setUiState }) {
        setUiState(uiState);
      },
    });

    const middlewareDefinition: MiddlewareDefinition = {
      $$type: 'fake',
      $$internal: false,
      onStateChange: jest.fn(),
      subscribe: jest.fn(),
      started: jest.fn(),
      unsubscribe: jest.fn(),
    };

    search.use(() => middlewareDefinition);

    search.addWidgets([
      searchBox({
        container,
        placeholder: 'search',
      }),
    ]);

    search.start();

    fireEvent.input(container.querySelector('input')!, {
      target: { value: 'q' },
    });

    await wait(0);
    expect(middlewareDefinition.onStateChange).toHaveBeenCalledTimes(1);
  });
});

describe('errors', () => {
  const virtualSearchBox = connectSearchBox(() => {});

  it('client errors can be handled', () => {
    const search = instantsearch({
      searchClient: createSearchClient({
        search() {
          return Promise.reject(new Error('test!'));
        },
      }),
      indexName: '123',
    });

    search.addWidgets([virtualSearchBox({})]);

    expect.assertions(4);

    search.on('error', (error) => {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('test!');

      expect(error.error).toBeInstanceOf(Error);
      expect(error.error.message).toBe('test!');
    });

    search.start();
  });
});
