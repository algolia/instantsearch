/** @jsx h */

import { h } from 'preact';
import { shallow, mount } from 'enzyme';
import { render, fireEvent } from '@testing-library/preact';
import RefinementList from '../RefinementList';
import RefinementListItem from '../RefinementListItem';

const defaultProps = {
  templateProps: {
    templates: {
      item: 'item',
      templateKey: 'templateKey',
      searchableNoResults: 'searchableNoResults',
    },
  },
  toggleRefinement: () => {},
};

describe('RefinementList', () => {
  let createURL;

  function shallowRender(extraProps = {}) {
    createURL = () => {};
    const props = {
      ...defaultProps,
      createURL,
      facetValues: [],
      ...extraProps,
    };

    return shallow(<RefinementList {...props} />);
  }

  describe('cssClasses', () => {
    it('should add the `root` class to the root element', () => {
      const props = {
        ...defaultProps,
        cssClasses: {
          root: 'root',
          searchable: {},
        },
      };

      const wrapper = shallowRender(props);

      expect(wrapper.hasClass('root')).toEqual(true);
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

      const wrapper = shallowRender(props).find(RefinementListItem);

      expect(wrapper.props().className).toContain('item');
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

      const activeItem = shallowRender(props).find({ isRefined: true });
      const inactiveItem = shallowRender(props).find({ isRefined: false });

      expect(activeItem.props().className).toContain('active');
      expect(inactiveItem.props().className).not.toContain('active');
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

      const items = shallowRender(props).find(RefinementListItem);
      const firstItem = items.at(0);
      const secondItem = items.at(1);

      expect(firstItem.props().facetValueToRefine).toEqual('foo');
      expect(secondItem.props().facetValueToRefine).toEqual('bar');
    });

    it('should correctly set if refined or not', () => {
      const props = {
        ...defaultProps,
        facetValues: [
          { value: 'foo', isRefined: false },
          { value: 'bar', isRefined: true },
        ],
      };

      const items = shallowRender(props).find(RefinementListItem);
      const firstItem = items.at(0);
      const secondItem = items.at(1);

      expect(firstItem.props().isRefined).toEqual(false);
      expect(secondItem.props().isRefined).toEqual(true);
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

      const items = shallowRender(props).find(RefinementListItem);
      const firstItem = items.at(0);
      const secondItem = items.at(1);

      expect(firstItem.props().templateData.count).toEqual(42);
      expect(secondItem.props().templateData.count).toEqual(16);
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

      const root = shallowRender(props);
      const wrapper = root.find('[templateKey="showMoreText"]');

      expect(wrapper).toHaveLength(1);
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

      const root = shallowRender(props);
      const wrapper = root.find('[templateKey="showMoreText"]');

      expect(wrapper).toHaveLength(0);
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
      const wrapper = mount(<RefinementList {...props} />);

      expect(wrapper).toMatchSnapshot();
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
            item: item => item,
            searchableNoResults: x => x,
            reset: 'reset',
            submit: 'submit',
            loadingIndicator: 'loadingIndicator',
          },
        },
        toggleRefinement: () => {},
      };
      const wrapper = mount(<RefinementList {...props} />);

      expect(wrapper).toMatchSnapshot();
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
            item: item => item,
          },
        },
        toggleRefinement: () => {},
        createURL: () => {},
      };
      const wrapper = mount(<RefinementList {...props} />);

      expect(wrapper).toMatchSnapshot();
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
            item: item => item,
            showMoreText: x => x,
          },
        },
        toggleRefinement: () => {},
        createURL: () => {},
      };
      const wrapper = mount(<RefinementList {...props} />);

      expect(wrapper).toMatchSnapshot();
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
            item: item => item,
            showMoreText: x => x,
          },
        },
        toggleRefinement: () => {},
        createURL: () => {},
      };
      const wrapper = mount(<RefinementList {...props} />);

      expect(wrapper).toMatchSnapshot();
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
            item: item => item,
            reset: 'reset',
            submit: 'submit',
            loadingIndicator: 'loadingIndicator',
          },
        },
        toggleRefinement: () => {},
        createURL: () => {},
      };
      const wrapper = mount(<RefinementList {...props} />);

      expect(wrapper).toMatchSnapshot();
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
