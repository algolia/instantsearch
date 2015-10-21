/* eslint-env mocha */

import React from 'react';
import expect from 'expect';
import TestUtils from 'react-addons-test-utils';
import RefinementList from '../RefinementList';
import Template from '../../Template';

describe('RefinementList', () => {
  var renderer;
  var parentListProps;
  var itemProps;
  var templateProps;

  beforeEach(() => {
    let {createRenderer} = TestUtils;
    parentListProps = {
      className: 'list'
    };
    itemProps = {
      className: 'item',
      onClick: () => {}
    };
    templateProps = {
      templateKey: 'item',
      data: {
        cssClasses: {
          list: 'list',
          item: 'item'
        }
      }
    };
    renderer = createRenderer();
  });


  it('should render default list', () => {
    var out = render();
    expect(out).toEqualJSX(
      <div {...parentListProps}>
        <div {...itemProps}>
          <Template
            {...templateProps}
            data={{...templateProps.data, name: 'facet1'}}
          />
        </div>
        <div {...itemProps}>
          <Template
            {...templateProps}
            data={{...templateProps.data, name: 'facet2'}}
          />
        </div>
      </div>
    );
  });

  context('sublist', () => {
    it('uses autoHide() and headerFooter()', () => {
      var customProps = {
        cssClasses: {
          depth: 'depth',
          item: 'item',
          list: 'list'
        },
        facetValues: [
          {
            name: 'facet1',
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
      itemProps = {
        className: 'item',
        onClick: () => {}
      };
      templateProps = {
        templateKey: 'item',
        data: {
          cssClasses: {
            depth: 'depth',
            list: 'list',
            item: 'item'
          }
        }
      };
      var out = render(customProps);
      expect(out).toEqualJSX(
        <div {...parentListProps}>
          <div {...itemProps}>
            <Template
              {...templateProps}
              data={{
                ...templateProps.data,
                name: 'facet1',
                data: customProps.facetValues[0].data
              }}
            />
            <RefinementList
              {...templateProps.data}
              depth={1}
              facetNameKey="name"
              facetValues={customProps.facetValues[0].data}
              templateProps={{}}
            />
          </div>
        </div>
      );
    });
  });

  function render(extraProps = {}) {
    var props = getProps(extraProps);
    renderer.render(<RefinementList {...props} templateProps={{}} />);
    return renderer.getRenderOutput();
  }

  function getProps(extraProps = {}) {
    return {
      cssClasses: {
        list: 'list',
        item: 'item'
      },
      facetValues: [
        {name: 'facet1'},
        {name: 'facet2'}
      ],
      ...extraProps
    };
  }
});

