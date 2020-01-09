/** @jsx h */

import { h } from 'preact';
import { render, fireEvent } from '@testing-library/preact';
import RefinementList from '../RefinementList';

const templates = {
  item({ value, count, isRefined }) {
    return `
  <label>
    <input
      data-testid="checkbox"
      type="checkbox"
      value="${value}"
      ${isRefined ? 'checked' : ''}
    />
    <span data-testid="value">${value}</span>
    <span data-testid="count">${count}</span>
  </label>
  `;
  },
  showMoreText() {
    return `<button data-testid="show-more">Show more</button>`;
  },
  searchableNoResults: 'searchableNoResults',
  searchableReset: 'searchableReset',
  searchableSubmit: 'searchableSubmit',
  searchableLoadingIndicator: 'searchableLoadingIndicator',
  reset: 'reset',
  submit: 'submit',
  loadingIndicator: 'loadingIndicator',
};

const defaultProps = {
  attribute: 'attribute',
  canToggleShowMore: false,
  createURL: () => '#',
  hasExhaustiveItems: true,
  isFromSearch: false,
  isShowingMore: false,
  items: [],
  searchFacetValues: undefined,
  searchIsAlwaysActive: false,
  searchPlaceholder: '',
  showMore: false,
  templateProps: {
    templates,
  },
  toggleRefinement: () => {},
  toggleShowMore: () => {},
  cssClasses: {
    root: 'root',
    noRefinementRoot: 'noRefinementRoot',
    noResults: 'noResults',
    list: 'list',
    item: 'item',
    selectedItem: 'selectedItem',
    label: 'label',
    checkbox: 'checkbox',
    labelText: 'labelText',
    showMore: 'showMore',
    disabledShowMore: 'disabledShowMore',
    count: 'count',
    searchBox: 'searchBox',
    searchable: {
      searchableRoot: 'searchableRoot',
      searchableForm: 'searchableForm',
      searchableInput: 'searchableInput',
      searchableSubmit: 'searchableSubmit',
      searchableSubmitIcon: 'searchableSubmitIcon',
      searchableReset: 'searchableReset',
      searchableResetIcon: 'searchableResetIcon',
      searchableLoadingIndicator: 'searchableLoadingIndicator',
      searchableLoadingIcon: 'searchableLoadingIcon',
    },
  },
};

describe('RefinementList', () => {
  describe('cssClasses', () => {
    it('should add the `root` class to the root element', () => {
      const props = {
        ...defaultProps,
        cssClasses: {
          ...defaultProps.cssClasses,
          root: 'customRoot',
        },
      };

      const { container } = render(<RefinementList {...props} />);
      const root = container.firstChild;

      expect(root).toHaveClass('customRoot');
    });

    it('should set item classes to the refinements', () => {
      const props = {
        ...defaultProps,
        cssClasses: {
          ...defaultProps.cssClasses,
          item: 'customItem',
        },
        items: [{ label: 'foo', value: 'foo', isRefined: true, count: 10 }],
      };

      const { container } = render(<RefinementList {...props} />);
      const item = container.querySelector('li');

      expect(item).toHaveClass('customItem');
    });

    it('should set active classes to the active refinements', () => {
      const props = {
        ...defaultProps,
        cssClasses: {
          ...defaultProps.cssClasses,
          selectedItem: 'customSelectedItem',
        },
        items: [
          { label: 'foo', value: 'foo', isRefined: true, count: 10 },
          { label: 'bar', value: 'bar', isRefined: false, count: 10 },
        ],
      };

      const { container } = render(<RefinementList {...props} />);
      const [selectedItem, nonSelectedItems] = container.querySelectorAll('li');

      expect(selectedItem).toHaveClass('customSelectedItem');
      expect(nonSelectedItems).not.toHaveClass('customSelectedItem');
    });
  });

  describe('items', () => {
    it('should have the correct names', () => {
      const props = {
        ...defaultProps,
        items: [
          { label: 'foo', value: 'foo', isRefined: false, count: 10 },
          { label: 'bar', value: 'bar', isRefined: false, count: 10 },
        ],
      };

      const { container } = render(<RefinementList {...props} />);
      const [firstItem, secondItem] = container.querySelectorAll('li');

      expect(firstItem).toHaveTextContent('foo');
      expect(secondItem).toHaveTextContent('bar');
    });

    it('should correctly set if refined or not', () => {
      const props = {
        ...defaultProps,
        items: [
          { label: 'foo', value: 'foo', isRefined: false, count: 10 },
          { label: 'bar', value: 'bar', isRefined: true, count: 10 },
        ],
      };

      const { queryAllByTestId } = render(<RefinementList {...props} />);
      const [firstItem, secondItem] = queryAllByTestId('checkbox');

      expect(firstItem).not.toHaveAttribute('checked');
      expect(secondItem).toHaveAttribute('checked');
    });
  });

  describe('count', () => {
    it('should pass the count to the templateData', () => {
      const props = {
        ...defaultProps,
        items: [
          { label: 'foo', value: 'foo', count: 42, isRefined: false },
          { label: 'bar', value: 'bar', count: 16, isRefined: false },
        ],
      };

      const { queryAllByTestId } = render(<RefinementList {...props} />);
      const [firstItem, secondItem] = queryAllByTestId('count');

      expect(firstItem).toHaveTextContent('42');
      expect(secondItem).toHaveTextContent('16');
    });
  });

  describe('showMore', () => {
    it('adds a showMore link when the feature is enabled', () => {
      const props = {
        ...defaultProps,
        items: [
          { label: 'foo', value: 'foo', isRefined: false, count: 10 },
          { label: 'bar', value: 'bar', isRefined: false, count: 10 },
          { label: 'baz', value: 'baz', isRefined: false, count: 10 },
        ],
        showMore: true,
        isShowingMore: false,
        canToggleShowMore: true,
      };

      const { queryByTestId } = render(<RefinementList {...props} />);
      const showMoreTemplate = queryByTestId('show-more');

      expect(showMoreTemplate).toBeInTheDocument();
    });

    it('does not add a showMore link when the feature is disabled', () => {
      const props = {
        ...defaultProps,
        items: [
          { label: 'foo', value: 'foo', isRefined: false, count: 10 },
          { label: 'bar', value: 'bar', isRefined: false, count: 10 },
          { label: 'baz', value: 'baz', isRefined: false, count: 10 },
        ],
        showMore: false,
        isShowingMore: false,
      };

      const { queryByTestId } = render(<RefinementList {...props} />);
      const showMoreTemplate = queryByTestId('show-more');

      expect(showMoreTemplate).not.toBeInTheDocument();
    });
  });

  describe('rendering', () => {
    it('without facets', () => {
      const props = {
        ...defaultProps,
      };
      const { container } = render(<RefinementList {...props} />);

      expect(container).toMatchSnapshot();
    });

    it('without facets from search', () => {
      const props = {
        ...defaultProps,
        searchFacetValues: () => {},
        isFromSearch: true,
        searchPlaceholder: 'Search',
        templateProps: {
          templates: {
            ...defaultProps.templateProps.templates,
            item: item => item.value,
            searchableNoResults: x => JSON.stringify(x),
          },
        },
      };
      const { container } = render(<RefinementList {...props} />);

      expect(container).toMatchSnapshot();
    });

    it('with facets', () => {
      const props = {
        ...defaultProps,
        items: [
          {
            label: 'Amazon',
            value: 'Amazon',
            count: 1200,
            isRefined: false,
          },
          {
            label: 'Google',
            value: 'Google',
            count: 1000,
            isRefined: true,
          },
        ],
        templateProps: {
          templates: {
            ...defaultProps.templateProps.templates,
            item: item => item.value,
          },
        },
      };
      const { container } = render(<RefinementList {...props} />);

      expect(container).toMatchSnapshot();
    });

    it('with facets and show more', () => {
      const props = {
        ...defaultProps,
        items: [
          {
            label: 'Amazon',
            value: 'Amazon',
            count: 1200,
            isRefined: false,
          },
          {
            label: 'Google',
            value: 'Google',
            count: 1000,
            isRefined: true,
          },
        ],
        showMore: true,
        isShowingMore: false,
        canToggleShowMore: true,
        templateProps: {
          templates: {
            ...defaultProps.templateProps.templates,
            item: item => item.value,
            showMoreText: x => JSON.stringify(x),
          },
        },
      };
      const { container } = render(<RefinementList {...props} />);

      expect(container).toMatchSnapshot();
    });

    it('with facets and disabled show more', () => {
      const props = {
        ...defaultProps,
        items: [
          {
            label: 'Amazon',
            value: 'Amazon',
            count: 1200,
            isRefined: false,
          },
          {
            label: 'Google',
            value: 'Google',
            count: 1000,
            isRefined: true,
          },
        ],
        showMore: true,
        isShowingMore: false,
        canToggleShowMore: false,
        templateProps: {
          templates: {
            ...defaultProps.templateProps.templates,
            item: item => item.value,
          },
        },
      };
      const { container } = render(<RefinementList {...props} />);

      expect(container).toMatchSnapshot();
    });

    it('with facets from search', () => {
      const props = {
        ...defaultProps,
        items: [
          {
            label: 'Amazon',
            value: 'Amazon',
            count: 1200,
            isRefined: false,
          },
          {
            label: 'Google',
            value: 'Google',
            count: 1000,
            isRefined: true,
          },
        ],
        searchFacetValues: () => {},
        isFromSearch: true,
        searchPlaceholder: 'Search',
        templateProps: {
          templates: {
            ...defaultProps.templateProps.templates,
            item: item => item.value,
            searchableNoResults: x => JSON.stringify(x),
          },
        },
      };
      const { container } = render(<RefinementList {...props} />);

      expect(container).toMatchSnapshot();
    });

    it('should not refine on click on already refined items', () => {
      const toggleRefinement = jest.fn();
      const props = {
        ...defaultProps,
        items: [
          { label: 'foo', value: 'foo', isRefined: false, count: 10 },
          { label: 'bar', value: 'bar', isRefined: true, count: 10 },
          { label: 'baz', value: 'baz', isRefined: false, count: 10 },
        ],
        templateProps: {
          templates: {
            ...defaultProps.templateProps.templates,
            item: item => `
              <label>
                <input type="radio" checked="${item.isRefined}" />
                ${item.value}
              </span>
            `,
          },
        },
      };

      const { container } = render(<RefinementList {...props} />);
      const checkedItem = container.querySelector('.item [checked="true"]')!;

      fireEvent.click(checkedItem);

      expect(toggleRefinement).toHaveBeenCalledTimes(0);
    });
  });
});
