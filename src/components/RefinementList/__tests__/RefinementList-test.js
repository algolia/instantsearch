/** @jsx h */

import { h } from 'preact';
import { render, fireEvent } from '@testing-library/preact';
import RefinementList from '../RefinementList';
import defaultTemplates from '../../../widgets/refinement-list/defaultTemplates';

const templates = {
  item({ value, count, isRefined }) {
    return `
  <label>
    <input
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
    return `
  <button data-testid="show-more">Show more</button>
    `;
  },
};

const defaultProps = {
  createURL: () => '#',
  templateProps: {
    templates,
  },
  toggleRefinement: () => {},
};

describe('RefinementList', () => {
  describe('cssClasses', () => {
    it('should add the `root` class to the root element', () => {
      const props = {
        ...defaultProps,
        cssClasses: {
          root: 'root',
          searchable: {},
        },
      };

      const { container } = render(<RefinementList {...props} />);
      const root = container.firstChild;

      expect(root).toHaveClass('root');
    });

    it('should set item classes to the refinements', () => {
      const props = {
        ...defaultProps,
        cssClasses: {
          item: 'item',
          searchable: {},
        },
        facetValues: [{ value: 'foo', isRefined: true }],
      };

      const { container } = render(<RefinementList {...props} />);
      const item = container.querySelector('li');

      expect(item).toHaveClass('item');
    });

    it('should set active classes to the active refinements', () => {
      const props = {
        ...defaultProps,
        cssClasses: {
          selectedItem: 'active',
          searchable: {},
        },
        facetValues: [
          { value: 'foo', isRefined: true },
          { value: 'bar', isRefined: false },
        ],
      };

      const { container } = render(<RefinementList {...props} />);
      const [activeItem, unactiveItem] = container.querySelectorAll('li');

      expect(activeItem).toHaveClass('active');
      expect(unactiveItem).not.toHaveClass('active');
    });
  });

  describe('items', () => {
    it('should have the correct names', () => {
      const props = {
        ...defaultProps,
        facetValues: [
          { value: 'foo', isRefined: false },
          { value: 'bar', isRefined: false },
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
        facetValues: [
          { value: 'foo', isRefined: false },
          { value: 'bar', isRefined: true },
        ],
      };

      const { container } = render(<RefinementList {...props} />);
      const [firstItem, secondItem] = container.querySelectorAll('input');

      expect(firstItem).not.toHaveAttribute('checked');
      expect(secondItem).toHaveAttribute('checked');
    });

    it('should escape the items in the default template to prevent XSS', () => {
      const props = {
        ...defaultProps,
        facetValues: [
          {
            highlighted: 'Samsung"><iframe/onload=alert("xss")>',
            value: 'Samsung"><iframe/onload=alert("xss")>',
            label: 'Samsung"><iframe/onload=alert("xss")>',
            count: 0,
            isRefined: true,
          },
          {
            highlighted: 'Apple',
            value: 'Apple',
            label: 'Apple',
            count: 10,
            isRefined: false,
          },
        ],
        templateProps: {
          templates: defaultTemplates,
        },
        cssClasses: {
          labelText: 'labelText',
        },
      };

      const { container } = render(<RefinementList {...props} />);
      const [firstItem, secondItem] = container.querySelectorAll('.labelText');

      expect(firstItem.innerHTML).toEqual(
        'Samsung"&gt;&lt;iframe/onload=alert("xss")&gt;'
      );
      expect(secondItem.innerHTML).toEqual('Apple');
    });

    it('should allow HTML in the items when SFFV', () => {
      const props = {
        ...defaultProps,
        isFromSearch: true,
        facetValues: [
          {
            highlighted: '<mark>Sam</mark>sung',
            value: 'Samsung',
            label: 'Samsung',
            count: 0,
            isRefined: true,
          },
          {
            highlighted: 'Apple',
            value: 'Apple',
            label: 'Apple',
            count: 10,
            isRefined: false,
          },
        ],
        templateProps: {
          templates: defaultTemplates,
        },
        cssClasses: {
          labelText: 'labelText',
        },
      };

      const { container } = render(<RefinementList {...props} />);
      const [firstItem, secondItem] = container.querySelectorAll('.labelText');

      expect(firstItem.innerHTML).toEqual('<mark>Sam</mark>sung');
      expect(secondItem.innerHTML).toEqual('Apple');
    });
  });

  describe('count', () => {
    it('should pass the count to the templateData', () => {
      const props = {
        ...defaultProps,
        facetValues: [
          { value: 'foo', count: 42, isRefined: false },
          { value: 'bar', count: 16, isRefined: false },
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
        facetValues: [
          { value: 'foo', isRefined: false },
          { value: 'bar', isRefined: false },
          { value: 'baz', isRefined: false },
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
        facetValues: [
          { value: 'foo', isRefined: false },
          { value: 'bar', isRefined: false },
          { value: 'baz', isRefined: false },
        ],
        showMore: false,
        isShowingMore: false,
      };

      const { queryByTestId } = render(<RefinementList {...props} />);
      const showMoreTemplate = queryByTestId('show-more');

      expect(showMoreTemplate).not.toBeInTheDocument();
    });
  });

  describe('sublist', () => {
    it('should create a subList with the sub values', () => {
      const toggleRefinement = jest.fn();
      const props = {
        ...defaultProps,
        toggleRefinement,
        createURL: () => {},
        cssClasses: {
          item: 'item',
        },
        facetValues: [
          {
            value: 'foo',
            data: [
              { value: 'bar', isRefined: false },
              { value: 'baz', isRefined: false },
            ],
            isRefined: false,
          },
        ],
      };

      const { container } = render(<RefinementList {...props} />);
      const [
        mainItem,
        firstSubItem,
        secondISubtem,
      ] = container.querySelectorAll('.item');

      fireEvent.click(mainItem);
      expect(toggleRefinement).toHaveBeenCalledWith('foo', false);

      fireEvent.click(firstSubItem);
      expect(toggleRefinement).toHaveBeenCalledWith('bar', false);

      fireEvent.click(secondISubtem);
      expect(toggleRefinement).toHaveBeenCalledWith('baz', false);
    });

    it('should add depth class for each depth', () => {
      const props = {
        ...defaultProps,
        createURL: () => {},
        cssClasses: {
          depth: 'depth-',
        },
        facetValues: [
          {
            value: 'foo',
            data: [
              { value: 'bar', isRefined: false },
              { value: 'baz', isRefined: false },
            ],
            isRefined: false,
          },
        ],
        templateProps: {
          templates: {
            item: item => item.value,
          },
        },
      };

      const { container } = render(<RefinementList {...props} />);
      const mainItem = container.querySelector('ul');
      const subItem = container.querySelector('ul ul');

      expect(mainItem).toHaveClass('depth-0');
      expect(subItem).toHaveClass('depth-1');
    });

    it('should not add root class on sub lists', () => {
      const props = {
        ...defaultProps,
        createURL: () => {},
        cssClasses: {
          root: 'my-root',
        },
        facetValues: [
          {
            value: 'foo',
            data: [
              { value: 'bar', isRefined: false },
              { value: 'baz', isRefined: false },
            ],
            isRefined: false,
          },
        ],
      };

      const { container } = render(<RefinementList {...props} />);
      const root = container.querySelector('div');

      expect(root).toHaveClass(props.cssClasses.root);
      expect(
        container.querySelectorAll(`.${props.cssClasses.root}`)
      ).toHaveLength(1);
    });
  });

  describe('rendering', () => {
    const cssClasses = {
      root: 'root',
      noRefinementRoot: 'noRefinementRoot',
      list: 'list',
      item: 'item',
      selectedItem: 'selectedItem',
      searchBox: 'searchBox',
      label: 'label',
      checkbox: 'checkbox',
      labelText: 'labelText',
      count: 'count',
      noResults: 'noResults',
      showMore: 'showMore',
      disabledShowMore: 'disabledShowMore',
      searchable: {
        root: 'root',
        form: 'form',
        input: 'input',
        submit: 'submit',
        submitIcon: 'submitIcon',
        reset: 'reset',
        resetIcon: 'resetIcon',
        loadingIndicator: 'loadingIndicator',
        loadingIcon: 'loadingIcon',
      },
    };

    it('without facets', () => {
      const props = {
        container: document.createElement('div'),
        attribute: 'attribute',
        facetValues: [],
        cssClasses,
        className: 'customClassName',
        templateProps: {},
        toggleRefinement: () => {},
      };
      const { container } = render(<RefinementList {...props} />);

      expect(container).toMatchSnapshot();
    });

    it('without facets from search', () => {
      const props = {
        container: document.createElement('div'),
        attribute: 'attribute',
        facetValues: [],
        cssClasses,
        className: 'customClassName',
        isFromSearch: true,
        searchPlaceholder: 'Search',
        searchFacetValues: x => x,
        templateProps: {
          templates: {
            item: item => item.value,
            searchableNoResults: x => JSON.stringify(x),
            reset: 'reset',
            submit: 'submit',
            loadingIndicator: 'loadingIndicator',
          },
        },
        toggleRefinement: () => {},
      };
      const { container } = render(<RefinementList {...props} />);

      expect(container).toMatchSnapshot();
    });

    it('with facets', () => {
      const props = {
        container: document.createElement('div'),
        attribute: 'attribute',
        facetValues: [
          {
            label: 'Amazon',
            count: 1200,
            isRefined: false,
          },
          {
            label: 'Google',
            count: 1000,
            isRefined: true,
          },
        ],
        cssClasses,
        className: 'customClassName',
        templateProps: {
          templates: {
            item: item => item.value,
          },
        },
        toggleRefinement: () => {},
        createURL: () => {},
      };
      const { container } = render(<RefinementList {...props} />);

      expect(container).toMatchSnapshot();
    });

    it('with facets and show more', () => {
      const props = {
        container: document.createElement('div'),
        attribute: 'attribute',
        facetValues: [
          {
            label: 'Amazon',
            count: 1200,
            isRefined: false,
          },
          {
            label: 'Google',
            count: 1000,
            isRefined: true,
          },
        ],
        cssClasses,
        className: 'customClassName',
        showMore: true,
        isShowingMore: false,
        canToggleShowMore: true,
        templateProps: {
          templates: {
            item: item => item.value,
            showMoreText: x => JSON.stringify(x),
          },
        },
        toggleRefinement: () => {},
        createURL: () => {},
      };
      const { container } = render(<RefinementList {...props} />);

      expect(container).toMatchSnapshot();
    });

    it('with facets and disabled show more', () => {
      const props = {
        container: document.createElement('div'),
        attribute: 'attribute',
        facetValues: [
          {
            label: 'Amazon',
            count: 1200,
            isRefined: false,
          },
          {
            label: 'Google',
            count: 1000,
            isRefined: true,
          },
        ],
        cssClasses,
        className: 'customClassName',
        showMore: true,
        isShowingMore: false,
        canToggleShowMore: false,
        templateProps: {
          templates: {
            item: item => item.value,
            showMoreText: x => JSON.stringify(x),
          },
        },
        toggleRefinement: () => {},
        createURL: () => {},
      };
      const { container } = render(<RefinementList {...props} />);

      expect(container).toMatchSnapshot();
    });

    it('with facets from search', () => {
      const props = {
        container: document.createElement('div'),
        attribute: 'attribute',
        facetValues: [
          {
            label: 'Amazon',
            count: 1200,
            isRefined: false,
          },
          {
            label: 'Google',
            count: 1000,
            isRefined: true,
          },
        ],
        cssClasses,
        className: 'customClassName',
        isFromSearch: true,
        searchPlaceholder: 'Search',
        searchFacetValues: x => x,
        templateProps: {
          templates: {
            item: item => item.value,
            reset: 'reset',
            submit: 'submit',
            loadingIndicator: 'loadingIndicator',
          },
        },
        toggleRefinement: () => {},
        createURL: () => {},
      };
      const { container } = render(<RefinementList {...props} />);

      expect(container).toMatchSnapshot();
    });

    it('should not refine on click on already refined items', () => {
      const toggleRefinement = jest.fn();
      const props = {
        container: document.createElement('div'),
        facetValues: [
          { value: 'foo', isRefined: false },
          { value: 'bar', isRefined: true },
          { value: 'baz', isRefined: false },
        ],
        cssClasses: {
          item: 'item',
        },
        templateProps: {
          templates: {
            item: item => `
              <label>
                <input type="radio" checked="${item.isRefined}" />
                ${item.value}
              </span>
            `,
          },
        },
        toggleRefinement,
        createURL: () => {},
      };

      const { container } = render(<RefinementList {...props} />);
      const checkedItem = container.querySelector('.item [checked="true"]');

      fireEvent.click(checkedItem);

      expect(toggleRefinement).toHaveBeenCalledTimes(0);
    });
  });
});
