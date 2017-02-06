/* eslint-env mocha */

import React from 'react';
import expect from 'expect';
import sinon from 'sinon';
import expectJSX from 'expect-jsx';
expect.extend(expectJSX);
import hierarchicalMenu from '../hierarchical-menu';
import RefinementList from '../../../components/RefinementList/RefinementList';
import defaultTemplates from '../../../connectors/hierarchical-menu/defaultTemplates.js';

describe('hierarchicalMenu()', () => {
  let container;
  let attributes;
  let options;
  let widget;
  let ReactDOM;

  beforeEach(() => {
    container = document.createElement('div');
    attributes = ['hello', 'world'];
    options = {};
    ReactDOM = {render: sinon.spy()};
    hierarchicalMenu.__Rewire__('ReactDOM', ReactDOM);
  });

  context('instantiated with wrong parameters', () => {
    it('should fail if no attributes', () => {
      options = {container, attributes: undefined};
      expect(() => hierarchicalMenu(options)).toThrow(/^Usage:/);
    });

    it('should fail if attributes empty', () => {
      options = {container, attributes: []};
      expect(() => hierarchicalMenu(options)).toThrow(/^Usage:/);
    });

    it('should fail if no container', () => {
      options = {container: undefined, attributes};
      expect(() => hierarchicalMenu(options)).toThrow(/^Usage:/);
    });
  });

  context('getConfiguration', () => {
    beforeEach(() => { options = {container, attributes}; });

    it('has defaults', () => {
      expect(
        hierarchicalMenu(options).getConfiguration({})
      ).toEqual({
        hierarchicalFacets: [{
          name: 'hello',
          rootPath: null,
          attributes: ['hello', 'world'],
          separator: ' > ',
          showParentLevel: true,
        }],
        maxValuesPerFacet: 10,
      });
    });

    it('understand the separator option', () => {
      expect(
        hierarchicalMenu({separator: ' ? ', ...options}).getConfiguration({})
      ).toEqual({
        hierarchicalFacets: [{
          name: 'hello',
          rootPath: null,
          attributes: ['hello', 'world'],
          separator: ' ? ',
          showParentLevel: true,
        }],
        maxValuesPerFacet: 10,
      });
    });

    it('understand the showParentLevel option', () => {
      expect(
        hierarchicalMenu({showParentLevel: false, ...options}).getConfiguration({})
      ).toEqual({
        hierarchicalFacets: [{
          name: 'hello',
          rootPath: null,
          attributes: ['hello', 'world'],
          separator: ' > ',
          showParentLevel: false,
        }],
        maxValuesPerFacet: 10,
      });
    });

    it('understand the rootPath option', () => {
      expect(
        hierarchicalMenu({rootPath: 'Beer', ...options}).getConfiguration({})
      ).toEqual({
        hierarchicalFacets: [{
          name: 'hello',
          rootPath: 'Beer',
          attributes: ['hello', 'world'],
          separator: ' > ',
          showParentLevel: true,
        }],
        maxValuesPerFacet: 10,
      });
    });

    context('limit option', () => {
      it('configures maxValuesPerFacet', () =>
        expect(
          hierarchicalMenu({limit: 20, ...options})
          .getConfiguration({})
          .maxValuesPerFacet
        ).toBe(20)
      );

      it('uses provided maxValuesPerFacet when higher', () =>
        expect(
          hierarchicalMenu({limit: 20, ...options})
          .getConfiguration({maxValuesPerFacet: 30})
          .maxValuesPerFacet
        ).toBe(30)
      );

      it('ignores provided maxValuesPerFacet when lower', () =>
        expect(
          hierarchicalMenu({limit: 10, ...options})
          .getConfiguration({maxValuesPerFacet: 3})
          .maxValuesPerFacet
        ).toBe(10)
      );
    });
  });

  context('render', () => {
    let results;
    let data;
    let cssClasses;
    let templateProps;
    let helper;
    let state;
    let createURL;

    beforeEach(() => {
      templateProps = {
        transformData: undefined,
        templatesConfig: undefined,
        templates: defaultTemplates,
        useCustomCompileOptions: {header: false, item: false, footer: false},
      };
      cssClasses = {
        active: 'ais-hierarchical-menu--item__active',
        body: 'ais-hierarchical-menu--body',
        count: 'ais-hierarchical-menu--count',
        depth: 'ais-hierarchical-menu--list__lvl',
        footer: 'ais-hierarchical-menu--footer',
        header: 'ais-hierarchical-menu--header',
        item: 'ais-hierarchical-menu--item',
        link: 'ais-hierarchical-menu--link',
        list: 'ais-hierarchical-menu--list',
        root: 'ais-hierarchical-menu',
      };
      data = {data: [{name: 'foo'}, {name: 'bar'}]};
      results = {getFacetValues: sinon.spy(() => data)};
      helper = {
        toggleRefinement: sinon.stub().returnsThis(),
        search: sinon.spy(),
      };
      state = {
        toggleRefinement: sinon.spy(),
      };
      options = {container, attributes};
      createURL = () => '#';
    });

    it('understand provided cssClasses', () => {
      const userCssClasses = {
        root: ['root', 'cx'],
        header: 'header',
        body: 'body',
        footer: 'footer',
        list: 'list',
        item: 'item',
        active: 'active',
        link: 'link',
        count: 'count',
      };

      widget = hierarchicalMenu({...options, cssClasses: userCssClasses});
      widget.init({helper, createURL});
      widget.render({results, state});
      const actual = ReactDOM.render.firstCall.args[0].props.cssClasses;
      expect(actual).toEqual({
        root: 'ais-hierarchical-menu root cx',
        header: 'ais-hierarchical-menu--header header',
        body: 'ais-hierarchical-menu--body body',
        footer: 'ais-hierarchical-menu--footer footer',
        list: 'ais-hierarchical-menu--list list',
        depth: 'ais-hierarchical-menu--list__lvl',
        item: 'ais-hierarchical-menu--item item',
        active: 'ais-hierarchical-menu--item__active active',
        link: 'ais-hierarchical-menu--link link',
        count: 'ais-hierarchical-menu--count count',
      });
    });

    it('calls ReactDOM.render', () => {
      widget = hierarchicalMenu(options);
      widget.init({helper, createURL});
      widget.render({results, state});
      expect(ReactDOM.render.calledOnce).toBe(true);
      expect(ReactDOM.render.firstCall.args[0]).toEqualJSX(
        <RefinementList
          attributeNameKey="path"
          collapsible={false}
          createURL={() => {}}
          cssClasses={cssClasses}
          facetValues={[{name: 'foo'}, {name: 'bar'}]}
          shouldAutoHideContainer={false}
          templateProps={templateProps}
          toggleRefinement={() => {}}
        />
      );
    });

    it('asks for results.getFacetValues', () => {
      widget = hierarchicalMenu(options);
      widget.init({helper, createURL});
      widget.render({results, state});
      expect(results.getFacetValues.calledOnce).toBe(true);
      expect(results.getFacetValues.getCall(0).args).toEqual([
        'hello', {
          sortBy: [
            'name:asc',
          ],
        },
      ]);
    });

    it('has a sortBy option', () => {
      widget = hierarchicalMenu({...options, sortBy: ['count:asc']});
      widget.init({helper, createURL});
      widget.render({results, state});
      expect(results.getFacetValues.calledOnce).toBe(true);
      expect(results.getFacetValues.getCall(0).args).toEqual([
        'hello', {
          sortBy: [
            'count:asc',
          ],
        },
      ]);
    });

    it('has a templates option', () => {
      widget = hierarchicalMenu({...options, templates: {
        header: 'header2',
        item: 'item2',
        footer: 'footer2',
      }});
      widget.init({helper, createURL});
      widget.render({results, state});
      expect(ReactDOM.render.firstCall.args[0].props.templateProps.templates)
        .toEqual({
          header: 'header2',
          item: 'item2',
          footer: 'footer2',
        });
    });

    it('sets shouldAutoHideContainer to true when no results', () => {
      data = {};
      widget = hierarchicalMenu(options);
      widget.init({helper, createURL});
      widget.render({results, state});
      expect(ReactDOM.render.firstCall.args[0].props.shouldAutoHideContainer).toBe(true);
    });

    it('sets facetValues to empty array when no results', () => {
      data = {};
      widget = hierarchicalMenu(options);
      widget.init({helper, createURL});
      widget.render({results, state});
      expect(ReactDOM.render.firstCall.args[0].props.facetValues).toEqual([]);
    });

    it('has a toggleRefinement method', () => {
      widget = hierarchicalMenu(options);
      widget.init({helper, createURL});
      widget.render({results, state});
      const elementToggleRefinement = ReactDOM.render.firstCall.args[0].props.toggleRefinement;
      elementToggleRefinement('mom');
      expect(helper.toggleRefinement.calledOnce).toBe(true);
      expect(helper.toggleRefinement.getCall(0).args)
        .toEqual(['hello', 'mom']);
      expect(helper.search.calledOnce).toBe(true);
      expect(helper.toggleRefinement.calledBefore(helper.search)).toBe(true);
    });

    it('has a limit option', () => {
      const secondLevel = [
        {name: 'six'},
        {name: 'seven'},
        {name: 'eight'},
        {name: 'nine'},
      ];

      const firstLevel = [
        {name: 'one'},
        {name: 'two', data: secondLevel},
        {name: 'three'},
        {name: 'four'},
        {name: 'five'},
      ];

      data = {data: firstLevel};
      const expectedFacetValues = [
        {name: 'one'},
        {name: 'two', data: [
          {name: 'six'},
          {name: 'seven'},
          {name: 'eight'},
        ]},
        {name: 'three'},
      ];
      widget = hierarchicalMenu({...options, limit: 3});
      widget.init({helper, createURL});
      widget.render({results, state});
      const actualFacetValues = ReactDOM.render.firstCall.args[0].props.facetValues;
      expect(actualFacetValues)
        .toEqual(expectedFacetValues);
    });

    afterEach(() => {
      hierarchicalMenu.__ResetDependency__('defaultTemplates');
    });
  });

  afterEach(() => {
    hierarchicalMenu.__ResetDependency__('ReactDOM');
    hierarchicalMenu.__ResetDependency__('autoHideContainerHOC');
    hierarchicalMenu.__ResetDependency__('headerFooterHOC');
  });
});
