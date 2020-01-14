/** @jsx h */

import { h } from 'preact';
import { render, fireEvent } from '@testing-library/preact';
import Menu from '../Menu';

const cssClasses = {
  root: 'root',
  noRefinementRoot: 'noRefinementRoot',
  list: 'list',
  item: 'item',
  selectedItem: 'selectedItem',
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
    '<span class="{{cssClasses.count}}">{{count}}</span>' +
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
  isShowingMore: false,
  items: [],
  showMore: false,
  templateProps: {
    templates,
  },
  toggleRefinement: () => {},
  toggleShowMore: () => {},
};

describe('Menu', () => {
  test('renders correct DOM without items', () => {
    const props = {
      ...defaultProps,
    };

    const { container } = render(<Menu {...props} />);
    const list = container.querySelector('.list');

    expect(list).not.toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  test('renders correct DOM with items', () => {
    const items = [
      {
        label: 'Appliances',
        value: 'Appliances',
        count: 4306,
        isRefined: true,
      },
      {
        label: 'Computers & Tablets',
        value: 'Computers & Tablets',
        count: 3563,
        isRefined: false,
      },
      {
        label: 'Cell Phones',
        value: 'Cell Phones',
        count: 3291,
        isRefined: false,
      },
      {
        label: 'Cell Phone Accessories',
        value: 'Cell Phone Accessories',
        count: 2836,
        isRefined: false,
      },
      {
        label: 'Audio',
        value: 'Audio',
        count: 1570,
        isRefined: false,
      },
      {
        label: 'Small Kitchen Appliances',
        value: 'Small Kitchen Appliances',
        count: 1510,
        isRefined: false,
      },
      {
        label: 'Cameras & Camcorders',
        value: 'Cameras & Camcorders',
        count: 1369,
        isRefined: false,
      },
      {
        label: 'Car Electronics & GPS',
        value: 'Car Electronics & GPS',
        count: 1208,
        isRefined: false,
      },
      {
        label: 'TV & Home Theater',
        value: 'TV & Home Theater',
        count: 1201,
        isRefined: false,
      },
      {
        label: 'Cell Phone Cases & Clips',
        value: 'Cell Phone Cases & Clips',
        count: 1195,
        isRefined: false,
      },
    ];
    const props = {
      ...defaultProps,
      items,
    };

    const { container } = render(<Menu {...props} />);
    const list = container.querySelector('.list');
    const listItems = container.querySelectorAll('.item');

    expect(list).toBeInTheDocument();
    expect(listItems).toHaveLength(items.length);
    expect(container).toMatchSnapshot();
  });

  test('calls templates with correct data', () => {
    const itemTemplate = jest.fn(() => '');
    const props = {
      ...defaultProps,
      items: [
        {
          label: 'Appliances',
          value: 'Appliances',
          count: 4306,
          isRefined: false,
        },
      ],
      templateProps: {
        templates: {
          item: itemTemplate,
        },
      },
    };

    render(<Menu {...props} />);

    expect(itemTemplate).toHaveBeenCalledTimes(1);
    expect(itemTemplate).toHaveBeenCalledWith({
      count: 4306,
      cssClasses,
      isRefined: false,
      label: 'Appliances',
      url: '#Appliances',
      value: 'Appliances',
    });
  });

  test('triggers refinement on click', () => {
    const toggleRefinement = jest.fn();
    const props = {
      ...defaultProps,
      items: [
        {
          label: 'Appliances',
          value: 'Appliances',
          count: 4306,
          isRefined: false,
        },
      ],
      toggleRefinement,
    };

    const { container } = render(<Menu {...props} />);
    const item = container.querySelector('.item')!;

    fireEvent.click(item);

    expect(toggleRefinement).toHaveBeenCalledTimes(1);
    expect(toggleRefinement).toHaveBeenCalledWith('Appliances');
  });

  test('renders with showMore and isShowingMore to false', () => {
    const props = {
      ...defaultProps,
      showMore: true,
      isShowingMore: false,
      canToggleShowMore: true,
    };

    const { container } = render(<Menu {...props} />);
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

    const { container } = render(<Menu {...props} />);
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

    const { container } = render(<Menu {...props} />);
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

    const { container } = render(<Menu {...props} />);
    const showMore = container.querySelector('.showMore')!;

    fireEvent.click(showMore);

    expect(props.toggleShowMore).toHaveBeenCalledTimes(1);
  });
});
