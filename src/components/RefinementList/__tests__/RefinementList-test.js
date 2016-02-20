/* eslint-env mocha */

import React from 'react';
import expect from 'expect';
import TestUtils from 'react-addons-test-utils';
import RefinementList from '../RefinementList';
import RefinementListItem from '../RefinementListItem';

import expectJSX from 'expect-jsx';
expect.extend(expectJSX);

describe('RefinementList', () => {
  let renderer;
  let parentListProps;
  let itemProps;

  beforeEach(() => {
    let {createRenderer} = TestUtils;
    let cssClasses = {
      list: 'list',
      item: 'item',
      active: 'active'
    };
    let templateData = {cssClasses};
    let commonItemProps = {
      handleClick: () => {},
      itemClassName: 'item',
      subItems: undefined,
      templateKey: 'item',
      templateProps: {}
    };

    parentListProps = {className: 'list'};
    itemProps = [{
      ...commonItemProps,
      itemClassName: 'item active',
      facetValueToRefine: 'facet1',
      isRefined: true,
      templateData: {
        ...templateData,
        name: 'facet1',
        isRefined: true
      }
    }, {
      ...commonItemProps,
      facetValueToRefine: 'facet2',
      isRefined: false,
      templateData: {
        ...templateData,
        name: 'facet2',
        isRefined: false
      }
    }];
    renderer = createRenderer();
  });


  it('should render default list', () => {
    let out = render();

    expect(out).toEqualJSX(
      <div {...parentListProps}>
        <RefinementListItem
          {...itemProps[0]}
        />
        <RefinementListItem
          {...itemProps[1]}
        />
      </div>
    );
    expect(out.props.children[0][0].key).toEqual('facet1/true');
    expect(out.props.children[0][1].key).toEqual('facet2/false');
  });

  it('should render default list highlighted', () => {
    let out = render({facetValues: [{name: 'facet1', isRefined: true, count: 42}]});
    itemProps[0].templateData = {
      ...itemProps[0].templateData,
      count: 42,
      isRefined: true
    };
    expect(out).toEqualJSX(
      <div {...parentListProps}>
        <RefinementListItem
          {...itemProps[0]}
        />
      </div>
    );
    expect(out.props.children[0][0].key).toEqual('facet1/true/42');
  });

  context('showMore', () => {
    it('should display the number accordingly to the state : closed', () => {
      const out = render({
        facetValues: [
          {name: 'facet1', isRefined: false, count: 42},
          {name: 'facet2', isRefined: false, count: 42}
        ],
        showMore: true,
        limitMin: 1,
        limitMax: 2
      });
      expect(out.props.children.length).toBe(2);
    });

    it('should display the number accordingly to the state : open', () => {
      // FIXME find a way to test this state...
    });
  });

  context('sublist', () => {
    it('works', () => {
      let customProps = {
        cssClasses: {
          depth: 'depth',
          item: 'item',
          list: 'list',
          active: 'active'
        },
        facetValues: [
          {
            name: 'facet1',
            isRefined: true,
            data: [
              {name: 'subfacet1'},
              {name: 'subfacet2'}
            ]
          }
        ]
      };
      parentListProps = {
        className: 'list depth0'
      };
      itemProps[0].templateData.cssClasses = customProps.cssClasses;
      itemProps[0].templateData = {
        ...itemProps[0].templateData,
        data: customProps.facetValues[0].data
      };
      itemProps[0].subItems = (
        <RefinementList
          attributeNameKey="name"
          cssClasses={customProps.cssClasses}
          depth={1}
          facetValues={customProps.facetValues[0].data}
          templateProps={{}}
        />
      );
      let out = render(customProps);
      expect(out).toEqualJSX(
        <div {...parentListProps}>
          <RefinementListItem
            {...itemProps[0]}
          />
        </div>
      );
    });
  });

  function render(extraProps = {}) {
    let props = getProps(extraProps);
    renderer.render(<RefinementList {...props} ref="list" templateProps={{}} />);
    return renderer.getRenderOutput();
  }

  function getProps(extraProps = {}) {
    return {
      cssClasses: {
        list: 'list',
        item: 'item',
        active: 'active'
      },
      facetValues: [
        {name: 'facet1', isRefined: true},
        {name: 'facet2', isRefined: false}
      ],
      ...extraProps
    };
  }
});

