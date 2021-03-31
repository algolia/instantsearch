import { render as preactRender } from 'preact';
import algoliasearchHelper from 'algoliasearch-helper';
import sortBy from '../sort-by';
import { createSearchClient } from '../../../../test/mock/createSearchClient';
import { createInstantSearch } from '../../../../test/mock/createInstantSearch';
import {
  createInitOptions,
  createRenderOptions,
} from '../../../../test/mock/createWidget';
import { castToJestMock } from '../../../../test/utils/castToJestMock';

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
      option: 'custom-option',
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
    // @ts-expect-error
    const { children, ...rootProps } = firstRender[0].props;

    expect(render).toHaveBeenCalledTimes(2);
    expect(rootProps).toMatchInlineSnapshot(`
      Object {
        "className": "ais-SortBy custom-root cx",
      }
    `);
    expect(children.props).toMatchInlineSnapshot(`
      Object {
        "cssClasses": Object {
          "option": "ais-SortBy-option custom-option",
          "root": "ais-SortBy custom-root cx",
          "select": "ais-SortBy-select custom-select",
        },
        "currentValue": "index-a",
        "options": Array [
          Object {
            "label": "Index A",
            "value": "index-a",
          },
          Object {
            "label": "Index B",
            "value": "index-b",
          },
        ],
        "setValue": [Function],
      }
    `);
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

    // @ts-expect-error
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
});
