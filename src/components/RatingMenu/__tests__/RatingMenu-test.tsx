/** @jsx h */

import { h } from 'preact';
import { render, fireEvent } from '@testing-library/preact';
import RatingMenu from '../RatingMenu';

const cssClasses = {
  root: 'root',
  noRefinementRoot: 'noRefinementRoot',
  list: 'list',
  item: 'item',
  selectedItem: 'selectedItem',
  disabledItem: 'disabledItem',
  starIcon: 'starIcon',
  fullStarIcon: 'fullStarIcon',
  emptyStarIcon: 'emptyStarIcon',
  label: 'label',
  count: 'count',
};

const templates = {
  item: `{{#count}}<a class="{{cssClasses.link}}" aria-label="{{value}} & up" href="{{href}}">{{/count}}{{^count}}<div class="{{cssClasses.link}}" aria-label="{{value}} & up" disabled>{{/count}}
  {{#stars}}<svg class="{{cssClasses.starIcon}} {{#.}}{{cssClasses.fullStarIcon}}{{/.}}{{^.}}{{cssClasses.emptyStarIcon}}{{/.}}" aria-hidden="true" width="24" height="24">
    {{#.}}<use xlink:href="#ais-RatingMenu-starSymbol"></use>{{/.}}{{^.}}<use xlink:href="#ais-RatingMenu-starEmptySymbol"></use>{{/.}}
  </svg>{{/stars}}
  <span class="{{cssClasses.label}}">& Up</span>
  {{#count}}<span class="{{cssClasses.count}}">{{#helpers.formatNumber}}{{count}}{{/helpers.formatNumber}}</span>{{/count}}
{{#count}}</a>{{/count}}{{^count}}</div>{{/count}}`,
};

const defaultProps = {
  createURL: value => `#${value}`,
  cssClasses,
  items: [],
  templateProps: {
    templates,
  },
  toggleRefinement: () => {},
  suit: () => '',
};

describe('RatingMenu', () => {
  test('renders correct DOM without items', () => {
    const props = {
      ...defaultProps,
    };

    const { container } = render(<RatingMenu {...props} />);
    const list = container.querySelector('.list');

    expect(list).not.toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  test('renders correct DOM with items', () => {
    const items = [
      {
        name: '0',
        value: '0',
        count: 3422,
        isRefined: false,
        stars: [false, false, false, false, false],
      },
      {
        name: '1',
        value: '1',
        count: 156,
        isRefined: false,
        stars: [true, false, false, false, false],
      },
      {
        name: '2',
        value: '2',
        count: 194,
        isRefined: false,
        stars: [true, true, false, false, false],
      },
      {
        name: '3',
        value: '3',
        count: 1622,
        isRefined: false,
        stars: [true, true, true, false, false],
      },
      {
        name: '4',
        value: '4',
        count: 13925,
        isRefined: false,
        stars: [true, true, true, true, false],
      },
      {
        name: '5',
        value: '5',
        count: 2150,
        isRefined: true,
        stars: [true, true, true, true, true],
      },
    ];
    const props = {
      ...defaultProps,
      items,
    };

    const { container } = render(<RatingMenu {...props} />);
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
          name: '0',
          value: '0',
          count: 3422,
          isRefined: false,
          stars: [false, false, false, false, false],
        },
      ],
      templateProps: {
        templates: {
          item: itemTemplate,
        },
      },
    };

    render(<RatingMenu {...props} />);

    expect(itemTemplate).toHaveBeenCalledTimes(1);
    expect(itemTemplate).toHaveBeenCalledWith({
      count: 3422,
      cssClasses,
      isRefined: false,
      name: '0',
      stars: [false, false, false, false, false],
      url: '#0',
      value: '0',
    });
  });

  test('triggers refinement on click', () => {
    const toggleRefinement = jest.fn();
    const props = {
      ...defaultProps,
      items: [
        {
          name: '0',
          value: '0',
          count: 3422,
          isRefined: false,
          stars: [false, false, false, false, false],
        },
      ],
      toggleRefinement,
    };

    const { container } = render(<RatingMenu {...props} />);
    const item = container.querySelector('.item')!;

    fireEvent.click(item);

    expect(toggleRefinement).toHaveBeenCalledTimes(1);
    expect(toggleRefinement).toHaveBeenCalledWith('0');
  });
});
