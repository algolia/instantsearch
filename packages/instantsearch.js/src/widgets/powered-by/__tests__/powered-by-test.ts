/**
 * @jest-environment jsdom
 */

import { createSearchClient } from '@instantsearch/mocks';
import { castToJestMock } from '@instantsearch/testutils/castToJestMock';
import algoliasearchHelper from 'algoliasearch-helper';
import { render as preactRender } from 'preact';

import {
  createInitOptions,
  createRenderOptions,
} from '../../../../test/createWidget';
import poweredBy from '../powered-by';

import type { PoweredByProps } from '../../../components/PoweredBy/PoweredBy';
import type { AlgoliaSearchHelper } from 'algoliasearch-helper';
import type { VNode } from 'preact';

const render = castToJestMock(preactRender);
jest.mock('preact', () => {
  const module = jest.requireActual('preact');

  module.render = jest.fn();

  return module;
});

describe('poweredBy call', () => {
  it('throws an exception when no container', () => {
    expect(poweredBy).toThrowErrorMatchingInlineSnapshot(`
"The \`container\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/powered-by/js/"
`);
  });
});

describe('poweredBy', () => {
  let widget: ReturnType<typeof poweredBy>;
  let container: HTMLElement;
  let helper: AlgoliaSearchHelper;

  beforeEach(() => {
    render.mockClear();

    container = document.createElement('div');
    widget = poweredBy({
      container,
      cssClasses: {
        root: 'root',
        link: 'link',
        logo: 'logo',
      },
    });

    helper = algoliasearchHelper(createSearchClient(), '', {});

    widget.init!(createInitOptions({ helper }));
  });

  it('renders only once at init', () => {
    widget.render!(createRenderOptions({ helper }));
    widget.render!(createRenderOptions({ helper }));

    const firstRender = render.mock.calls[0][0] as VNode<PoweredByProps>;
    const firstContainer = render.mock.calls[0][1];

    expect(render).toHaveBeenCalledTimes(1);
    expect(firstRender.props).toEqual({
      cssClasses: {
        link: 'ais-PoweredBy-link link',
        logo: 'ais-PoweredBy-logo logo',
        root: 'ais-PoweredBy ais-PoweredBy--light root',
      },
      theme: 'light',
      url: 'https://www.algolia.com/?utm_source=instantsearch.js&utm_medium=website&utm_content=localhost&utm_campaign=poweredby',
    });
    expect(firstContainer).toEqual(container);
  });
});
