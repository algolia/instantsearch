import { render } from 'preact';
import algoliasearchHelper from 'algoliasearch-helper';
import sortBy from '../sort-by';
import { createSearchClient } from '../../../../test/mock/createSearchClient';
import { createInstantSearch } from '../../../../test/mock/createInstantSearch';
import {
  createInitOptions,
  createRenderOptions,
} from '../../../../test/mock/createWidget';

jest.mock('preact', () => {
  const module = require.requireActual('preact');

  module.render = jest.fn();

  return module;
});

describe('Usage', () => {
  it('throws without container', () => {
    expect(() => {
      sortBy({ container: undefined });
    }).toThrowErrorMatchingInlineSnapshot(`
"The \`container\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/sort-by/js/"
`);
  });
});

describe('sortBy()', () => {
  let container;
  let items;
  let cssClasses;
  let widget;
  let helper;
  let results;

  beforeEach(() => {
    render.mockClear();

    const instantSearchInstance = createInstantSearch({
      indexName: '',
    });

    container = document.createElement('div');
    items = [
      { value: 'index-a', label: 'Index A' },
      { value: 'index-b', label: 'Index B' },
    ];
    cssClasses = {
      root: ['custom-root', 'cx'],
      select: 'custom-select',
      item: 'custom-item',
    };
    widget = sortBy({ container, items, cssClasses });

    helper = algoliasearchHelper(createSearchClient(), 'index-a');
    helper.setIndex = jest.fn().mockReturnThis();
    helper.search = jest.fn();

    results = {
      hits: [],
      nbHits: 0,
    };
    widget.init(createInitOptions({ helper, instantSearchInstance }));
  });

  it('calls twice render(<Selector props />, container)', () => {
    widget.render(createRenderOptions({ helper, results }));
    widget.render(createRenderOptions({ helper, results }));

    const [firstRender, secondRender] = render.mock.calls;
    const { children, ...rootProps } = firstRender[0].props;

    expect(render).toHaveBeenCalledTimes(2);
    expect(rootProps).toMatchSnapshot();
    expect(children.props).toMatchSnapshot();
    expect(firstRender[1]).toEqual(container);
    expect(secondRender[1]).toEqual(container);
  });

  it('renders transformed items', () => {
    widget = sortBy({
      container,
      items,
      transformItems: allItems =>
        allItems.map(item => ({ ...item, transformed: true })),
    });

    widget.init(createInitOptions({ helper }));
    widget.render(createRenderOptions({ helper, results }));

    const [firstRender] = render.mock.calls;

    expect(firstRender[0].props.children.props.options).toEqual([
      {
        label: 'Index A',
        transformed: true,
        value: 'index-a',
      },
      {
        label: 'Index B',
        transformed: true,
        value: 'index-b',
      },
    ]);
  });

  it('sets the underlying index', () => {
    widget.setIndex('index-b');

    expect(helper.setIndex).toHaveBeenCalledTimes(1);
    expect(helper.search).toHaveBeenCalledTimes(1);
  });
});
