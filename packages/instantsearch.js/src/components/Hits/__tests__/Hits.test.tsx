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
import Hits from '../Hits';

import type { HitsProps } from '../Hits';
import type { Hit } from 'instantsearch.js';

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('Hits', () => {
  test('sends a default `click` event when clicking on a hit', () => {
    const props = createProps({});

    const { container } = render(<Hits {...props} />);

    userEvent.click(getAllByRole(container as HTMLElement, 'listitem')[0]);

    expect(props.sendEvent).toHaveBeenCalledTimes(1);
    expect(props.sendEvent).toHaveBeenLastCalledWith(
      'click:internal',
      props.hits[0],
      'Hit Clicked'
    );
  });

  function createProps<THit extends Hit = Hit>(props: Partial<HitsProps>) {
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
      cssClasses: { root: '', emptyRoot: '', list: '', item: '' },
      templateProps: prepareTemplateProps({
        defaultTemplates: {
          empty() {
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
