import { wait } from '@instantsearch/testutils';
import React from 'react';

import { DEBOUNCE_MS, createResultsClient, mockAgentFetch } from './utils';

import type { ResultCardWidgetSetup } from '.';
import type { TestOptions } from '../../common';

export function createTemplatesTests(
  setup: ResultCardWidgetSetup,
  { act }: Required<TestOptions>
) {
  describe('templates', () => {
    test('replaces the default card with a custom layout', async () => {
      const searchClient = createResultsClient();
      mockAgentFetch();

      await setup({
        instantSearchOptions: { indexName: 'indexName', searchClient },
        widgetParams: {
          javascript: {
            agentId: 'test-agent-id',
            templates: {
              layout: ({ status, query, messages }) =>
                `Custom layout: ${status} / ${query} / ${messages.length}`,
            },
          },
          react: {
            agentId: 'test-agent-id',
            layoutComponent: ({ status, query, messages }) => (
              <div className="custom-layout">
                Custom layout: {status} / {query} / {messages.length}
              </div>
            ),
          },
          vue: {},
        },
      });

      await act(async () => {
        await wait(DEBOUNCE_MS + 100);
      });

      // The custom layout owns the whole markup, so the default UI component
      // (and its `ais-ResultCard` root) is not rendered.
      expect(document.querySelector('.ais-ResultCard')).toBeNull();
      expect(document.body.textContent).toContain(
        'Custom layout: complete / running shoes / 2'
      );
    });
  });
}
