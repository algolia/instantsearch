/** @jsx h */

import algoliasearchHelper from 'algoliasearch-helper';
import { fireEvent } from '@testing-library/preact';
import instantsearch from '../../../index.es';
import { createSearchClient } from '../../../../test/mock/createSearchClient';
import { runAllMicroTasks } from '../../../../test/utils/runAllMicroTasks';
import answers from '../answers';
import searchBox from '../../search-box/search-box';

describe('answers', () => {
  describe('Usage', () => {
    it('throws without `container`', () => {
      expect(() => {
        // @ts-ignore
        answers({});
      }).toThrowErrorMatchingInlineSnapshot(`
"The \`container\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/answers/js/"
`);
    });

    it('throws when searchClient does not support findAnswers', () => {
      const container = document.createElement('div');
      const searchClient = createSearchClient({
        // @ts-ignore-next-line
        initIndex() {
          return {};
        },
      });
      const helper = algoliasearchHelper(searchClient, '', {});
      const search = instantsearch({
        indexName: 'instant_search',
        searchClient,
      });
      const widget = answers({
        container,
        attributesForPrediction: ['description'],
      });
      // @ts-ignore-next-line
      widget.init({
        helper,
        instantSearchInstance: search,
      });
      expect(() => {
        // @ts-ignore-next-line
        widget.render({ state: {}, instantSearchInstance: search });
      }).toThrowErrorMatchingInlineSnapshot(`
"\`algoliasearch\` >= 4.8.0 required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/answers/js/#connector"
`);
    });
  });

  describe('render', () => {
    it('renders with empty state', async () => {
      const container = document.createElement('div');
      const search = instantsearch({
        indexName: 'instant_search',
        searchClient: createSearchClient({
          // @ts-ignore-next-line
          initIndex() {
            return {
              findAnswers: () => Promise.resolve({ hits: [] }),
            };
          },
        }),
      });
      search.addWidgets([
        answers({
          container,
          attributesForPrediction: ['description'],
        }),
      ]);
      search.start();
      await runAllMicroTasks();
      expect(container.innerHTML).toMatchInlineSnapshot(
        `"<div class=\\"ais-Answers ais-Answers--empty\\"><div class=\\"ais-Answers-header\\"></div><ul class=\\"ais-Answers-list\\"></ul></div>"`
      );
    });

    it('renders the answers', async done => {
      const answersContainer = document.createElement('div');
      const searchBoxContainer = document.createElement('div');
      const search = instantsearch({
        indexName: 'instant_search',
        searchClient: createSearchClient({
          // @ts-ignore-next-line
          initIndex() {
            return {
              findAnswers: () =>
                Promise.resolve({ hits: [{ title: 'Hello' }] }),
            };
          },
        }),
      });
      search.addWidgets([
        answers({
          container: answersContainer,
          attributesForPrediction: ['description'],
          cssClasses: {
            root: 'root',
            loader: 'loader',
            emptyRoot: 'empty',
            item: 'item',
          },
          templates: {
            loader: 'loading...',
            item: hit => `title: ${hit.title}`,
          },
        }),
        searchBox({
          container: searchBoxContainer,
        }),
      ]);
      search.start();
      await runAllMicroTasks();

      fireEvent.input(searchBoxContainer.querySelector('input')!, {
        target: { value: 'a' },
      });

      await runAllMicroTasks();
      expect(answersContainer.querySelector('.loader')!.innerHTML).toEqual(
        'loading...'
      );
      expect(answersContainer.querySelector('.root')!.classList).toContain(
        'empty'
      );

      setTimeout(() => {
        // debounced render
        expect(
          answersContainer.querySelector('.root')!.classList
        ).not.toContain('empty');
        expect(answersContainer.querySelectorAll('.item').length).toEqual(1);
        expect(answersContainer.querySelector('.item')!.innerHTML).toEqual(
          'title: Hello'
        );
        done();
      }, 200);
    });
  });
});
