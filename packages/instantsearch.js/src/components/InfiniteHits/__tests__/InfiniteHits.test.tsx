/**
 * @jest-environment jsdom
 */
/** @jsx h */
import { createSingleSearchResponse } from '@instantsearch/mocks';
import { getAllByRole, render } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { SearchParameters, SearchResults } from 'algoliasearch-helper';
import { h } from 'preact';

import { prepareTemplateProps } from '../../../lib/templating';
import InfiniteHits from '../InfiniteHits';

import type { InfiniteHitsProps } from '../InfiniteHits';
import type { Hit } from 'instantsearch.js';

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('InfiniteHits', () => {
  test('sends a default `click` event when clicking on a hit', () => {
    const props = createProps({});

    const { container } = render(<InfiniteHits {...props} />);

    userEvent.click(getAllByRole(container as HTMLElement, 'listitem')[0]);

    expect(props.sendEvent).toHaveBeenCalledTimes(1);
    expect(props.sendEvent).toHaveBeenLastCalledWith(
      'click:internal',
      props.hits[0],
      'Hit Clicked'
    );
  });

  function createProps<THit extends Hit = Hit>(
    props: Partial<InfiniteHitsProps>
  ) {
    const hits = [
      { objectID: 'abc', __position: 1 },
      { objectID: 'def', __position: 2 },
    ];

    return {
      results: new SearchResults(new SearchParameters(), [
        createSingleSearchResponse({ hits }),
      ]),
      hits: hits as THit[],
      sendEvent: jest.fn(),
      bindEvent: jest.fn(),
      showPrevious: jest.fn(),
      showMore: jest.fn(),
      hasShowPrevious: true,
      isFirstPage: true,
      isLastPage: false,
      cssClasses: {
        root: '',
        emptyRoot: '',
        list: '',
        item: '',
        loadPrevious: '',
        disabledLoadPrevious: '',
        loadMore: '',
        disabledLoadMore: '',
      },
      templateProps: prepareTemplateProps({
        defaultTemplates: {
          empty() {
            return '';
          },
          showPreviousText() {
            return '';
          },
          showMoreText() {
            return '';
          },
          item() {
            return '';
          },
        },
        templatesConfig: {},
        templates: {},
      }),
      ...props,
    };
  }
});
