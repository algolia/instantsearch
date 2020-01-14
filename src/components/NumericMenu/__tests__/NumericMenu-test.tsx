/** @jsx h */

import { h } from 'preact';
import { render, fireEvent } from '@testing-library/preact';
import NumericMenu from '../NumericMenu';

const cssClasses = {
  root: 'root',
  noRefinementRoot: 'noRefinementRoot',
  list: 'list',
  item: 'item',
  selectedItem: 'selectedItem',
  label: 'label',
  labelText: 'labelText',
  radio: 'radio',
};

const templates = {
  item: `<label class="{{cssClasses.label}}">
  <input type="radio" class="{{cssClasses.radio}}" name="{{attribute}}"{{#isRefined}} checked{{/isRefined}} />
  <span class="{{cssClasses.labelText}}">{{label}}</span>
</label>`,
};

const defaultProps = {
  attribute: 'attribute',
  createURL: value => `#${value}`,
  cssClasses,
  items: [],
  templateProps: {
    templates,
  },
  toggleRefinement: () => {},
};

describe('NumericMenu', () => {
  test('renders correct DOM without items', () => {
    const props = {
      ...defaultProps,
    };

    const { container } = render(<NumericMenu {...props} />);
    const list = container.querySelector('.list');

    expect(list).not.toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  test('renders correct DOM with items', () => {
    const items = [
      {
        label: 'All',
        value: encodeURIComponent('{}'),
        isRefined: true,
      },
      {
        label: 'Less than 10',
        value: encodeURIComponent('{"end":10}'),
        isRefined: false,
      },
      {
        label: 'Between 10 and 100',
        value: encodeURIComponent('{"start":10,"end":100}'),
        isRefined: false,
      },
      {
        label: '1000',
        value: encodeURIComponent('{"start":1000,"end":1000}'),
        isRefined: false,
      },
      {
        label: 'More than 1000',
        value: encodeURIComponent('{"start":1000}'),
        isRefined: false,
      },
    ];
    const props = {
      ...defaultProps,
      items,
    };

    const { container } = render(<NumericMenu {...props} />);
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
          label: '1000',
          value: encodeURIComponent('{"start":1000,"end":1000}'),
          isRefined: false,
        },
      ],
      templateProps: {
        templates: {
          item: itemTemplate,
        },
      },
    };

    render(<NumericMenu {...props} />);

    expect(itemTemplate).toHaveBeenCalledTimes(1);
    expect(itemTemplate).toHaveBeenCalledWith({
      attribute: 'attribute',
      cssClasses,
      isRefined: false,
      label: '1000',
      url: '#%7B%22start%22%3A1000%2C%22end%22%3A1000%7D',
      value: '%7B%22start%22%3A1000%2C%22end%22%3A1000%7D',
    });
  });

  test('triggers refinement on click', () => {
    const toggleRefinement = jest.fn();
    const props = {
      ...defaultProps,
      items: [
        {
          label: '1000',
          value: encodeURIComponent('{"start":1000,"end":1000}'),
          isRefined: false,
        },
      ],
      toggleRefinement,
    };

    const { container } = render(<NumericMenu {...props} />);
    const item = container.querySelector('.item')!;

    fireEvent.click(item);

    expect(toggleRefinement).toHaveBeenCalledTimes(1);
    expect(toggleRefinement).toHaveBeenCalledWith(
      '%7B%22start%22%3A1000%2C%22end%22%3A1000%7D'
    );
  });
});
