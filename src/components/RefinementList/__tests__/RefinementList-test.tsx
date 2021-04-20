/** @jsx h */

import { h } from 'preact';
import { render, fireEvent } from '@testing-library/preact';
import RefinementList, { RefinementListProps } from '../RefinementList';
import defaultTemplates from '../../../widgets/refinement-list/defaultTemplates';
import {
  RefinementListItemData,
  RefinementListRendererCSSClasses,
} from '../../../widgets/refinement-list/refinement-list';

const defaultProps = {
  createURL: () => '#',
  templateProps: {
    templatesConfig: {},
    templates: {
      item({ value, count, isRefined }: RefinementListItemData) {
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
      searchableNoResults: 'No results',
    },
    useCustomCompileOptions: {},
  },
  toggleRefinement: () => {},
  cssClasses: {
    root: 'ais-RefinementList',
    noRefinementRoot: 'ais-RefinementList--noRefinement',
    list: 'ais-RefinementList-list',
    item: 'ais-RefinementList-item',
    selectedItem: 'ais-RefinementList-item--selected',
    searchBox: 'ais-RefinementList-searchBox',
    label: 'ais-RefinementList-label',
    checkbox: 'ais-RefinementList-checkbox',
    labelText: 'ais-RefinementList-labelText',
    count: 'ais-RefinementList-count',
    noResults: 'ais-RefinementList-noResults',
    showMore: 'ais-RefinementList-showMore',
    disabledShowMore: 'ais-RefinementList-showMore--disabled',
    searchable: {
      root: 'ais-SearchBox',
      form: 'ais-SearchBox-form',
      input: 'ais-SearchBox-input',
      submit: 'ais-SearchBox-submit',
      submitIcon: 'ais-SearchBox-submitIcon',
      reset: 'ais-SearchBox-reset',
      resetIcon: 'ais-SearchBox-resetIcon',
      loadingIndicator: 'ais-SearchBox-loadingIndicator',
      loadingIcon: 'ais-SearchBox-loadingIcon',
    },
  },
};
type TestDefaultTemplates = typeof defaultProps.templateProps.templates;

describe('RefinementList', () => {
  describe('cssClasses', () => {
    it('should add the `root` class to the root element', () => {
      const props: RefinementListProps<
        TestDefaultTemplates,
        RefinementListRendererCSSClasses
      > = {
        ...defaultProps,
        cssClasses: {
          ...defaultProps.cssClasses,
          root: 'root',
        },
      };

      const { container } = render(<RefinementList {...props} />);
      const root = container.firstChild;

      expect(root).toHaveClass('root');
    });

    it('should set item classes to the refinements', () => {
      const props: RefinementListProps<
        TestDefaultTemplates,
        RefinementListRendererCSSClasses
      > = {
        ...defaultProps,
        cssClasses: {
          ...defaultProps.cssClasses,
          item: 'item',
        },
        facetValues: [
          { value: 'foo', label: 'foo', count: 1, isRefined: true },
        ],
      };

      const { container } = render(<RefinementList {...props} />);
      const item = container.querySelector('li');

      expect(item).toHaveClass('item');
    });

    it('should set active classes to the active refinements', () => {
      const props: RefinementListProps<
        TestDefaultTemplates,
        RefinementListRendererCSSClasses
      > = {
        ...defaultProps,
        cssClasses: {
          ...defaultProps.cssClasses,
          selectedItem: 'active',
        },
        facetValues: [
          { value: 'foo', label: 'foo', count: 1, isRefined: true },
          { value: 'bar', label: 'bar', count: 2, isRefined: false },
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
      const props: RefinementListProps<
        TestDefaultTemplates,
        RefinementListRendererCSSClasses
      > = {
        ...defaultProps,
        facetValues: [
          { value: 'foo', label: 'foo', count: 1, isRefined: false },
          { value: 'bar', label: 'bar', count: 2, isRefined: false },
        ],
      };

      const { container } = render(<RefinementList {...props} />);
      const [firstItem, secondItem] = container.querySelectorAll('li');

      expect(firstItem).toHaveTextContent('foo');
      expect(secondItem).toHaveTextContent('bar');
    });

    it('should correctly set if refined or not', () => {
      const props: RefinementListProps<
        TestDefaultTemplates,
        RefinementListRendererCSSClasses
      > = {
        ...defaultProps,
        facetValues: [
          { value: 'foo', label: 'foo', count: 1, isRefined: false },
          { value: 'bar', label: 'bar', count: 2, isRefined: true },
        ],
      };

      const { container } = render(<RefinementList {...props} />);
      const [firstItem, secondItem] = container.querySelectorAll('input');

      expect(firstItem).not.toHaveAttribute('checked');
      expect(secondItem).toHaveAttribute('checked');
    });

    it('should escape the items in the default template to prevent XSS', () => {
      const props: RefinementListProps<
        typeof defaultTemplates,
        RefinementListRendererCSSClasses
      > = {
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
          templatesConfig: {},
          templates: defaultTemplates,
          useCustomCompileOptions: {},
        },
        cssClasses: {
          ...defaultProps.cssClasses,
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
      const props: RefinementListProps<
        typeof defaultTemplates,
        RefinementListRendererCSSClasses
      > = {
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
          templatesConfig: {},
          templates: defaultTemplates,
          useCustomCompileOptions: {},
        },
        cssClasses: {
          ...defaultProps.cssClasses,
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
      const props: RefinementListProps<
        TestDefaultTemplates,
        RefinementListRendererCSSClasses
      > = {
        ...defaultProps,
        facetValues: [
          { value: 'foo', label: 'foo', count: 42, isRefined: false },
          { value: 'bar', label: 'bar', count: 16, isRefined: false },
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
      const props: RefinementListProps<
        TestDefaultTemplates,
        RefinementListRendererCSSClasses
      > = {
        ...defaultProps,
        facetValues: [
          { value: 'foo', label: 'foo', count: 1, isRefined: false },
          { value: 'bar', label: 'bar', count: 2, isRefined: false },
          { value: 'baz', label: 'baz', count: 3, isRefined: false },
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
      const props: RefinementListProps<
        TestDefaultTemplates,
        RefinementListRendererCSSClasses
      > = {
        ...defaultProps,
        facetValues: [
          { value: 'foo', label: 'foo', count: 1, isRefined: false },
          { value: 'bar', label: 'bar', count: 2, isRefined: false },
          { value: 'baz', label: 'baz', count: 3, isRefined: false },
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
      const props: RefinementListProps<
        TestDefaultTemplates,
        RefinementListRendererCSSClasses
      > = {
        ...defaultProps,
        toggleRefinement,
        createURL: () => '',
        cssClasses: {
          ...defaultProps.cssClasses,
          item: 'item',
        },
        facetValues: [
          {
            value: 'foo',
            label: 'foo',
            count: 1,
            data: [
              {
                value: 'bar',
                label: 'bar',
                count: 2,
                isRefined: false,
                data: null,
              },
              {
                value: 'baz',
                label: 'baz',
                count: 3,
                isRefined: false,
                data: null,
              },
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
      expect(toggleRefinement).toHaveBeenCalledWith('foo');

      fireEvent.click(firstSubItem);
      expect(toggleRefinement).toHaveBeenCalledWith('bar');

      fireEvent.click(secondISubtem);
      expect(toggleRefinement).toHaveBeenCalledWith('baz');
    });

    it('should not add root class on sub lists', () => {
      const props: RefinementListProps<
        TestDefaultTemplates,
        RefinementListRendererCSSClasses
      > = {
        ...defaultProps,
        createURL: () => '',
        cssClasses: {
          ...defaultProps.cssClasses,
          root: 'my-root',
        },
        facetValues: [
          {
            value: 'foo',
            label: 'foo',
            count: 1,
            data: [
              {
                value: 'bar',
                label: 'bar',
                count: 2,
                isRefined: false,
                data: null,
              },
              {
                value: 'baz',
                label: 'baz',
                count: 3,
                isRefined: false,
                data: null,
              },
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
      const templates = {
        item: (item: RefinementListItemData) => item.value,
        showMoreText: '',
      };
      type TestTemplates = typeof templates;

      const props: RefinementListProps<
        TestTemplates,
        RefinementListRendererCSSClasses
      > = {
        createURL: () => '',
        attribute: 'attribute',
        facetValues: [],
        cssClasses,
        className: 'customClassName',
        templateProps: {
          templatesConfig: {},
          templates,
          useCustomCompileOptions: {},
        },
        toggleRefinement: () => {},
      };
      const { container } = render(<RefinementList {...props} />);

      expect(container).toMatchSnapshot();
    });

    it('without facets from search', () => {
      const templates = {
        item: (item: RefinementListItemData) => item.value,
        searchableNoResults: x => JSON.stringify(x),
        showMoreText: '',
      };
      type TestTemplates = typeof templates;

      const props: RefinementListProps<
        TestTemplates,
        RefinementListRendererCSSClasses
      > = {
        createURL: () => '',
        attribute: 'attribute',
        facetValues: [],
        cssClasses,
        className: 'customClassName',
        isFromSearch: true,
        searchPlaceholder: 'Search',
        searchFacetValues: x => x,
        templateProps: {
          templatesConfig: {},
          templates,
          useCustomCompileOptions: {},
        },
        searchBoxTemplateProps: {
          templatesConfig: {},
          templates: {
            reset: 'reset',
            submit: 'submit',
            loadingIndicator: 'loadingIndicator',
          },
          useCustomCompileOptions: {},
        },
        toggleRefinement: () => {},
      };
      const { container } = render(<RefinementList {...props} />);

      expect(container).toMatchSnapshot();
    });

    it('with facets', () => {
      const templates = {
        item: (item: RefinementListItemData) => item.value,
        showMoreText: '',
      };
      type TestTemplates = typeof templates;

      const props: RefinementListProps<
        TestTemplates,
        RefinementListRendererCSSClasses
      > = {
        attribute: 'attribute',
        facetValues: [
          {
            value: '',
            label: 'Amazon',
            count: 1200,
            isRefined: false,
          },
          {
            value: '',
            label: 'Google',
            count: 1000,
            isRefined: true,
          },
        ],
        cssClasses,
        className: 'customClassName',
        templateProps: {
          templatesConfig: {},
          templates,
          useCustomCompileOptions: {},
        },
        toggleRefinement: () => {},
        createURL: () => '',
      };
      const { container } = render(<RefinementList {...props} />);

      expect(container).toMatchSnapshot();
    });

    it('with facets and show more', () => {
      const templates = {
        item: (item: RefinementListItemData) => item.value,
        showMoreText: (x: any) => JSON.stringify(x),
      };
      type TestTemplates = typeof templates;

      const props: RefinementListProps<
        TestTemplates,
        RefinementListRendererCSSClasses
      > = {
        attribute: 'attribute',
        facetValues: [
          {
            value: '',
            label: 'Amazon',
            count: 1200,
            isRefined: false,
          },
          {
            value: '',
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
          templatesConfig: {},
          templates: {
            item: (item: RefinementListItemData) => item.value,
            showMoreText: (x: any) => JSON.stringify(x),
          },
          useCustomCompileOptions: {},
        },
        toggleRefinement: () => {},
        createURL: () => '',
      };
      const { container } = render(<RefinementList {...props} />);

      expect(container).toMatchSnapshot();
    });

    it('with facets and disabled show more', () => {
      const templates = {
        item: (item: RefinementListItemData) => item.value,
        showMoreText: (x: any) => JSON.stringify(x),
      };
      type TestTemplates = typeof templates;

      const props: RefinementListProps<
        TestTemplates,
        RefinementListRendererCSSClasses
      > = {
        attribute: 'attribute',
        facetValues: [
          {
            value: '',
            label: 'Amazon',
            count: 1200,
            isRefined: false,
          },
          {
            value: '',
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
          templatesConfig: {},
          templates: {
            item: (item: RefinementListItemData) => item.value,
            showMoreText: (x: any) => JSON.stringify(x),
          },
          useCustomCompileOptions: {},
        },
        toggleRefinement: () => {},
        createURL: () => '',
      };
      const { container } = render(<RefinementList {...props} />);

      expect(container).toMatchSnapshot();
    });

    it('with facets from search', () => {
      const templates = {
        item: (item: RefinementListItemData) => item.value,
        showMoreText: '',
      };
      type TestTemplates = typeof templates;

      const props: RefinementListProps<
        TestTemplates,
        RefinementListRendererCSSClasses
      > = {
        attribute: 'attribute',
        facetValues: [
          {
            value: '',
            label: 'Amazon',
            count: 1200,
            isRefined: false,
          },
          {
            value: '',
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
          templatesConfig: {},
          templates,
          useCustomCompileOptions: {},
        },
        searchBoxTemplateProps: {
          templatesConfig: {},
          templates: {
            reset: 'reset',
            submit: 'submit',
            loadingIndicator: 'loadingIndicator',
          },
          useCustomCompileOptions: {},
        },
        toggleRefinement: () => {},
        createURL: () => '',
      };
      const { container } = render(<RefinementList {...props} />);

      expect(container).toMatchSnapshot();
    });

    it('should not refine on click on already refined items', () => {
      const toggleRefinement = jest.fn();

      const templates = {
        item: (item: RefinementListItemData) => `
              <label>
                <input type="radio" checked="${item.isRefined}" />
                ${item.value}
              </span>
            `,
        showMoreText: '',
      };
      type TestTemplates = typeof templates;

      const props: RefinementListProps<
        TestTemplates,
        RefinementListRendererCSSClasses
      > = {
        facetValues: [
          { value: 'foo', label: 'foo', count: 1, isRefined: false },
          { value: 'bar', label: 'bar', count: 2, isRefined: true },
          { value: 'baz', label: 'baz', count: 3, isRefined: false },
        ],
        cssClasses: {
          ...defaultProps.cssClasses,
          item: 'item',
        },
        templateProps: {
          templatesConfig: {},
          templates,
          useCustomCompileOptions: {},
        },
        toggleRefinement,
        createURL: () => '',
      };

      const { container } = render(<RefinementList {...props} />);
      const checkedItem = container.querySelector('.item [checked="true"]');

      fireEvent.click(checkedItem!);

      expect(toggleRefinement).toHaveBeenCalledTimes(0);
    });
  });
});
