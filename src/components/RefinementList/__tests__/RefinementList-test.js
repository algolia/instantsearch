import React from 'react';
import { shallow, mount } from 'enzyme';
import RefinementList from '../RefinementList';
import RefinementListItem from '../RefinementListItem';

const defaultProps = {
  templateProps: {},
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
      const props = {
        ...defaultProps,
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

      const root = shallowRender(props);
      const mainItem = root.find(RefinementListItem).at(0);
      const subList = shallow(mainItem.props().subItems);
      const subItems = subList.find(RefinementListItem);

      expect(mainItem.props().facetValueToRefine).toEqual('foo');
      expect(subItems.at(0).props().facetValueToRefine).toEqual('bar');
      expect(subItems.at(1).props().facetValueToRefine).toEqual('baz');
    });

    it('should add depth class for each depth', () => {
      const props = {
        ...defaultProps,
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

      const root = shallowRender(props);
      const mainItem = root.find(RefinementListItem).at(0);
      const subList = shallow(mainItem.props().subItems);

      expect(root.props().children[2].props.className).toContain('depth-0');
      expect(subList.props().children[2].props.className).toContain('depth-1');
    });

    it('should not add root class on sub lists', () => {
      const props = {
        ...defaultProps,
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

      const root = shallowRender(props);
      const mainItem = root.find(RefinementListItem).at(0);
      const subList = shallow(mainItem.props().subItems);

      expect(root.hasClass(props.cssClasses.root)).toBe(true);
      expect(subList.hasClass(props.cssClasses.root)).toBe(false);
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
        templateProps: {
          templates: {
            item: item => `
              <label>
                <input type="radio" checked=${item.isRefined} />
                ${item.value}
              </span>
            `,
          },
        },
        toggleRefinement,
        createURL: () => {},
      };
      const wrapper = mount(<RefinementList {...props} />);

      const items = wrapper.find(RefinementListItem);
      const secondItem = items.at(1);

      secondItem.simulate('click');

      expect(toggleRefinement).not.toHaveBeenCalled();
    });
  });
});
