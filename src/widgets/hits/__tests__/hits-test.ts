import { render as preactRender, VNode } from 'preact';
import algoliasearchHelper from 'algoliasearch-helper';
import { SearchClient } from '../../../types';
import hits from '../hits';
import { castToJestMock } from '../../../../test/utils/castToJestMock';
import { createInstantSearch } from '../../../../test/mock/createInstantSearch';
import { HitsProps } from '../../../components/Hits/types';

const render = castToJestMock(preactRender);
jest.mock('preact', () => {
  const module = jest.requireActual('preact');

  module.render = jest.fn();

  return module;
});

describe('Usage', () => {
  it('throws without container', () => {
    expect(() => {
      // @ts-expect-error
      hits({ container: undefined });
    }).toThrowErrorMatchingInlineSnapshot(`
"The \`container\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/hits/js/"
`);
  });
});

describe('hits()', () => {
  let container;
  let widget;
  let results;
  let helper;

  beforeEach(() => {
    render.mockClear();

    helper = algoliasearchHelper({} as SearchClient, '', {});
    container = document.createElement('div');
    widget = hits({ container, cssClasses: { root: ['root', 'cx'] } });
    widget.init({
      helper,
      instantSearchInstance: createInstantSearch({
        templatesConfig: undefined,
      }),
    });
    results = {
      hits: [{ first: 'hit', second: 'hit' }],
      hitsPerPage: 4,
      page: 2,
    };
  });

  it('calls twice render(<Hits props />, container)', () => {
    widget.render({ results });
    widget.render({ results });

    const firstRender = render.mock.calls[0][0] as VNode<HitsProps>;
    const secondRender = render.mock.calls[1][0] as VNode<HitsProps>;
    const firstContainer = render.mock.calls[0][1];
    const secondContainer = render.mock.calls[1][1];

    expect(render).toHaveBeenCalledTimes(2);
    expect(firstRender.props).toMatchSnapshot();
    expect(firstContainer).toEqual(container);
    expect(secondRender.props).toMatchSnapshot();
    expect(secondContainer).toEqual(container);
  });

  it('renders transformed items', () => {
    widget = hits({
      container,
      transformItems: items =>
        items.map(item => ({ ...item, transformed: true })),
    });

    widget.init({
      helper,
      instantSearchInstance: createInstantSearch({
        templatesConfig: undefined,
      }),
    });
    widget.render({ results });

    const firstRender = render.mock.calls[0][0] as VNode<HitsProps>;

    expect(firstRender.props).toMatchSnapshot();
  });

  it('should add __position key with absolute position', () => {
    results = { ...results, page: 4, hitsPerPage: 10 };
    const state = { page: results.page };

    widget.render({ results, state });

    expect(results.hits[0].__position).toEqual(41);
  });
});
