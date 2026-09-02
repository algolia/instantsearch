/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils/wait';
import algoliasearchHelper from 'algoliasearch-helper';

import { createSingleSearchResponse } from '../../../../../../tests/mocks/createAPIResponse';
import { createInstantSearch } from '../../../../test/createInstantSearch';
import {
  createDisposeOptions,
  createInitOptions,
  createRenderOptions,
} from '../../../../test/createWidget';
import promptSuggestions from '../prompt-suggestions';

import type { InstantSearch } from '../../../types';
import type { SearchResults } from 'algoliasearch-helper';

function makeResults(): SearchResults {
  const helper = algoliasearchHelper(createSearchClient(), '');
  return new algoliasearchHelper.SearchResults(helper.state, [
    createSingleSearchResponse({
      hits: [{ objectID: '1' }] as unknown as SearchResults['hits'],
      query: 'q',
    }),
  ]);
}

function withChat(search: InstantSearch) {
  search.renderState = {
    [search.helper!.state.index]: {
      chat: { sendMessage: jest.fn(), setOpen: jest.fn(), status: 'ready' },
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
}

describe('promptSuggestions', () => {
  it('throws without a `container`', () => {
    expect(() =>
      promptSuggestions({
        // @ts-expect-error
        container: undefined,
        agentId: 'a',
      })
    ).toThrowErrorMatchingInlineSnapshot(`
      "The \`container\` option is required.

      See documentation: https://www.algolia.com/doc/api-reference/widgets/prompt-suggestions/js/"
    `);
  });

  describe('missing chat widget', () => {
    it('throws once no chat widget is found on the index', async () => {
      const search = createInstantSearch();
      // No chat in renderState.
      search.renderState = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;

      const widget = promptSuggestions({
        container: document.createElement('div'),
        agentId: 'a',
      });

      widget.init!(
        createInitOptions({
          instantSearchInstance: search,
          helper: search.helper!,
        })
      );
      // The absence is only conclusive once the deferred mount check has run:
      // a chat can still be registered after this widget's `init`.
      await wait(0);

      expect(() =>
        widget.render!(
          createRenderOptions({
            instantSearchInstance: search,
            helper: search.helper!,
            results: makeResults(),
          })
        )
      ).toThrowErrorMatchingInlineSnapshot(`
        "No \`chat\` widget is mounted on this index, so there is nothing to send a clicked suggestion to. Mount a \`chat\` widget on the same index, or pass \`onSuggestionClick\` to handle the click yourself.

        See documentation: https://www.algolia.com/doc/api-reference/widgets/prompt-suggestions/js/"
      `);
    });

    it('does not throw while a chat can still be registered', () => {
      const search = createInstantSearch();
      search.renderState = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;

      const widget = promptSuggestions({
        container: document.createElement('div'),
        agentId: 'a',
      });

      widget.init!(
        createInitOptions({
          instantSearchInstance: search,
          helper: search.helper!,
        })
      );

      // No `wait(0)`: the mount window is still open, so a render here must not
      // condemn a setup whose chat is further down a React tree.
      expect(() =>
        widget.render!(
          createRenderOptions({
            instantSearchInstance: search,
            helper: search.helper!,
            results: makeResults(),
          })
        )
      ).not.toThrow();

      // The mount check is still pending; unmount so it doesn't fire (and
      // throw) into the next test.
      widget.dispose!(createDisposeOptions({ helper: search.helper! }));
    });

    it('does not throw when an `onSuggestionClick` override owns the click', async () => {
      const search = createInstantSearch();
      search.renderState = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;

      const widget = promptSuggestions({
        container: document.createElement('div'),
        agentId: 'a',
        onSuggestionClick: jest.fn(),
      });

      widget.init!(
        createInitOptions({
          instantSearchInstance: search,
          helper: search.helper!,
        })
      );
      await wait(0);

      expect(() =>
        widget.render!(
          createRenderOptions({
            instantSearchInstance: search,
            helper: search.helper!,
            results: makeResults(),
          })
        )
      ).not.toThrow();
    });

    it('does not throw when a chat widget is mounted', async () => {
      const search = createInstantSearch();
      withChat(search);

      const widget = promptSuggestions({
        container: document.createElement('div'),
        agentId: 'a',
      });

      widget.init!(
        createInitOptions({
          instantSearchInstance: search,
          helper: search.helper!,
        })
      );
      await wait(0);

      expect(() =>
        widget.render!(
          createRenderOptions({
            instantSearchInstance: search,
            helper: search.helper!,
            results: makeResults(),
          })
        )
      ).not.toThrow();
    });
  });
});
