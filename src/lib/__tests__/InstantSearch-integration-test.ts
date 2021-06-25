import {
  getByText,
  fireEvent,
  getByPlaceholderText,
} from '@testing-library/dom';
import instantsearch from '../../index.es';
import { configure, searchBox } from '../../widgets';
import { connectConfigure } from '../../connectors';
import { createSearchClient } from '../../../test/mock/createSearchClient';
import { MiddlewareDefinition } from '../../types';
import { runAllMicroTasks } from '../../../test/utils/runAllMicroTasks';

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
  it("runs middleware's onStateChange uiState has changed", async () => {
    const container = document.createElement('div');
    const search = instantsearch({
      indexName: 'instant_search',
      searchClient: createSearchClient(),
    });

    const middlewareDefinition: MiddlewareDefinition = {
      onStateChange: jest.fn(),
      subscribe: jest.fn(),
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

    fireEvent.input(getByPlaceholderText(container, 'search'), {
      target: { value: 'q' },
    });

    await runAllMicroTasks();
    expect(middlewareDefinition.onStateChange).toHaveBeenCalledTimes(1);
  });

  it("runs middleware's onStateChange uiState has changed and onStateChange was provided", async () => {
    const container = document.createElement('div');
    const search = instantsearch({
      indexName: 'instant_search',
      searchClient: createSearchClient(),
      onStateChange({ uiState, setUiState }) {
        setUiState(uiState);
      },
    });

    const middlewareDefinition: MiddlewareDefinition = {
      onStateChange: jest.fn(),
      subscribe: jest.fn(),
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

    fireEvent.input(getByPlaceholderText(container, 'search'), {
      target: { value: 'q' },
    });

    await runAllMicroTasks();
    expect(middlewareDefinition.onStateChange).toHaveBeenCalledTimes(1);
  });
});
