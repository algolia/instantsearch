/** @jsx h */

import { h } from 'preact';
import { render, fireEvent } from '@testing-library/preact';
import HierarchicalMenu from '../HierarchicalMenu';
import itemsFixture from './fixtures/items.json';

const cssClasses = {
  root: 'root',
  noRefinementRoot: 'noRefinementRoot',
  list: 'list',
  childList: 'childList',
  item: 'item',
  selectedItem: 'selectedItem',
  parentItem: 'parentItem',
  link: 'link',
  label: 'label',
  count: 'count',
  showMore: 'showMore',
  disabledShowMore: 'disabledShowMore',
};

const templates = {
  item:
    '<a class="{{cssClasses.link}}" href="{{url}}">' +
    '<span class="{{cssClasses.label}}">{{label}}</span>' +
    '<span class="{{cssClasses.count}}">{{#helpers.formatNumber}}{{count}}{{/helpers.formatNumber}}</span>' +
    '</a>',
  showMoreText: `
    {{#isShowingMore}}
      Show less
    {{/isShowingMore}}
    {{^isShowingMore}}
      Show more
    {{/isShowingMore}}
  `,
};

const defaultProps = {
  canToggleShowMore: false,
  createURL: value => `#${value}`,
  cssClasses,
  hasExhaustiveItems: true,
  isShowingMore: false,
  items: [],
  showMore: false,
  templateProps: {
    templates,
  },
  toggleRefinement: () => {},
  toggleShowMore: () => {},
};

describe('HierarchicalMenu', () => {
  test('renders correct DOM without items', () => {
    const props = {
      ...defaultProps,
    };

    const { container } = render(<HierarchicalMenu {...props} />);
    const list = container.querySelector('.list');

    expect(list).not.toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  test('renders correct DOM with items', () => {
    const items = itemsFixture;

    const props = {
      ...defaultProps,
      items,
    };

    const { container } = render(<HierarchicalMenu {...props} />);
    const list = container.querySelector('.list');
    const listItems = container.querySelectorAll('.item');

    expect(list).toBeInTheDocument();
    // There are 20 items because:
    // - 10 level 1
    // - 10 level 2 in the first level 1
    expect(listItems).toHaveLength(20);
    expect(container).toMatchSnapshot();
  });

  test('calls templates with correct data', () => {
    const itemTemplate = jest.fn(() => '');
    const props = {
      ...defaultProps,
      items: [
        {
          label: 'Video Games',
          value: 'Video Games',
          count: 505,
          isRefined: false,
          exhaustive: true,
          data: null,
        },
      ],
      templateProps: {
        templates: {
          ...defaultProps.templateProps.templates,
          item: itemTemplate,
        },
      },
    };

    render(<HierarchicalMenu {...props} />);

    expect(itemTemplate).toHaveBeenCalledTimes(1);
    expect(itemTemplate).toHaveBeenCalledWith({
      count: 505,
      cssClasses,
      data: null,
      exhaustive: true,
      isRefined: false,
      label: 'Video Games',
      url: '#Video Games',
      value: 'Video Games',
    });
  });

  test('triggers refinement on click', () => {
    const toggleRefinement = jest.fn();
    const props = {
      ...defaultProps,
      items: [
        {
          label: 'Video Games',
          value: 'Video Games',
          count: 505,
          isRefined: false,
          exhaustive: true,
          data: null,
        },
      ],
      toggleRefinement,
    };

    const { container } = render(<HierarchicalMenu {...props} />);
    const item = container.querySelector('.item')!;

    fireEvent.click(item);

    expect(toggleRefinement).toHaveBeenCalledTimes(1);
    expect(toggleRefinement).toHaveBeenCalledWith('Video Games');
  });

  test('triggers refinement on a child click', () => {
    const toggleRefinement = jest.fn();
    const props = {
      ...defaultProps,
      items: [
        {
          label: 'Appliances',
          value: 'Appliances',
          count: 4306,
          isRefined: true,
          exhaustive: true,
          data: [
            {
              label: 'Dishwashers',
              value: 'Appliances > Dishwashers',
              count: 181,
              isRefined: false,
              exhaustive: true,
              data: null,
            },
          ],
        },
      ],
      toggleRefinement,
    };

    const { getByText } = render(<HierarchicalMenu {...props} />);
    const childItem = getByText('Dishwashers');

    fireEvent.click(childItem);

    expect(toggleRefinement).toHaveBeenCalledTimes(1);
    expect(toggleRefinement).toHaveBeenCalledWith('Appliances > Dishwashers');
  });

  test('renders with showMore and isShowingMore to false', () => {
    const props = {
      ...defaultProps,
      showMore: true,
      isShowingMore: false,
      canToggleShowMore: true,
    };

    const { container } = render(<HierarchicalMenu {...props} />);
    const showMore = container.querySelector('.showMore');

    expect(showMore).toBeInTheDocument();
    expect(showMore).toHaveTextContent('Show more');
    expect(container).toMatchSnapshot();
  });

  test('renders with showMore and isShowingMore to true', () => {
    const props = {
      ...defaultProps,
      showMore: true,
      isShowingMore: true,
      canToggleShowMore: true,
    };

    const { container } = render(<HierarchicalMenu {...props} />);
    const showMore = container.querySelector('.showMore');

    expect(showMore).toBeInTheDocument();
    expect(showMore).toHaveTextContent('Show less');
    expect(container).toMatchSnapshot();
  });

  test('renders with showMore and canToggleShowMore to false', () => {
    const props = {
      ...defaultProps,
      showMore: true,
      isShowingMore: false,
    };

    const { container } = render(<HierarchicalMenu {...props} />);
    const showMore = container.querySelector('.showMore');

    expect(showMore).toBeInTheDocument();
    expect(showMore).toHaveTextContent('Show more');
    expect(showMore).toBeDisabled();
    expect(container).toMatchSnapshot();
  });

  test('calls toggleShowMore on show more button click', () => {
    const props = {
      ...defaultProps,
      showMore: true,
      isShowingMore: false,
      canToggleShowMore: true,
      toggleShowMore: jest.fn(),
    };

    const { container } = render(<HierarchicalMenu {...props} />);
    const showMore = container.querySelector('.showMore')!;

    fireEvent.click(showMore);

    expect(props.toggleShowMore).toHaveBeenCalledTimes(1);
  });
});
