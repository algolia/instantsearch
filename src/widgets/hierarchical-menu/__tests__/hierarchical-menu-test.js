/* eslint-env mocha */

import React from 'react';
import expect from 'expect';
import sinon from 'sinon';
import jsdom from 'mocha-jsdom';

import expectJSX from 'expect-jsx';
expect.extend(expectJSX);

import hierarchicalMenu from '../hierarchical-menu';
import RefinementList from '../../../components/RefinementList/RefinementList';

describe('hierarchicalMenu()', () => {
  let autoHideContainer;
  let container;
  let attributes;
  let headerFooter;
  let options;
  let widget;
  let ReactDOM;

  jsdom({useEach: true});

  beforeEach(() => {
    container = document.createElement('div');
    attributes = ['hello', 'world'];
    options = {};
    ReactDOM = {render: sinon.spy()};
    hierarchicalMenu.__Rewire__('ReactDOM', ReactDOM);
    autoHideContainer = sinon.stub().returnsArg(0);
    hierarchicalMenu.__Rewire__('autoHideContainerHOC', autoHideContainer);
    headerFooter = sinon.stub().returnsArg(0);
    hierarchicalMenu.__Rewire__('headerFooterHOC', headerFooter);
  });

  context('instanciated with wrong parameters', () => {
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

  context('autoHideContainer', () => {
    beforeEach(() => options = {container, attributes});

    it('should be called if autoHideContainer set to true', () => {
      hierarchicalMenu({...options, autoHideContainer: true});
      expect(autoHideContainer.calledOnce).toBe(true);
    });

    it('should not be called if autoHideContainer set to false', () => {
      hierarchicalMenu({container, attributes, autoHideContainer: false});
      expect(autoHideContainer.called).toBe(false);
    });
  });

  it('uses headerFooter', () => {
    options = {container, attributes};
    hierarchicalMenu(options);
    expect(headerFooter.calledOnce).toBe(true);
  });

  context('getConfiguration', () => {
    beforeEach(() => options = {container, attributes});

    it('has defaults', () => {
      expect(
        hierarchicalMenu(options).getConfiguration()
      ).toEqual({
        hierarchicalFacets: [{
          name: 'hello',
          rootPath: null,
          attributes: ['hello', 'world'],
          separator: ' > ',
          showParentLevel: true
        }]
      });
    });

    it('understand the separator option', () => {
      expect(
        hierarchicalMenu({separator: ' ? ', ...options}).getConfiguration()
      ).toEqual({
        hierarchicalFacets: [{
          name: 'hello',
          rootPath: null,
          attributes: ['hello', 'world'],
          separator: ' ? ',
          showParentLevel: true
        }]
      });
    });

    it('understand the showParentLevel option', () => {
      expect(
        hierarchicalMenu({showParentLevel: false, ...options}).getConfiguration()
      ).toEqual({
        hierarchicalFacets: [{
          name: 'hello',
          rootPath: null,
          attributes: ['hello', 'world'],
          separator: ' > ',
          showParentLevel: false
        }]
      });
    });

    it('understand the rootPath option', () => {
      expect(
        hierarchicalMenu({rootPath: 'Beer', ...options}).getConfiguration()
      ).toEqual({
        hierarchicalFacets: [{
          name: 'hello',
          rootPath: 'Beer',
          attributes: ['hello', 'world'],
          separator: ' > ',
          showParentLevel: true
        }]
      });
    });
  });

  context('render', () => {
    let results;
    let data;
    let cssClasses;
    let defaultTemplates = {
      header: 'header',
      item: 'item',
      footer: 'footer'
    };
    let templateProps;

    beforeEach(() => {
      hierarchicalMenu.__Rewire__('defaultTemplates', defaultTemplates);
      templateProps = {
        transformData: undefined,
        templatesConfig: undefined,
        templates: defaultTemplates,
        useCustomCompileOptions: {header: false, item: false, footer: false}
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
        root: 'ais-hierarchical-menu'
      };
      data = {data: ['foo', 'bar']};
      results = {getFacetValues: sinon.spy(() => {
        return data;
      })};

      options = {container, attributes};
    });

    it('understand provided cssClasses', () => {
      let userCssClasses = {
        root: ['root', 'cx'],
        header: 'header',
        body: 'body',
        footer: 'footer',
        list: 'list',
        item: 'item',
        active: 'active',
        link: 'link',
        count: 'count'
      };

      widget = hierarchicalMenu({...options, cssClasses: userCssClasses});
      widget.render({results});
      let actual = ReactDOM.render.firstCall.args[0].props.cssClasses;
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
        count: 'ais-hierarchical-menu--count count'
      });
    });

    it('calls ReactDOM.render', () => {
      widget = hierarchicalMenu(options);
      widget.render({results});
      expect(ReactDOM.render.calledOnce).toBe(true);
      expect(ReactDOM.render.firstCall.args[0]).toEqualJSX(
        <RefinementList
          attributeNameKey="path"
          createURL={() => {}}
          cssClasses={cssClasses}
          facetValues={['foo', 'bar']}
          shouldAutoHideContainer={false}
          templateProps={templateProps}
          toggleRefinement={() => {}}
        />
      );
    });

    it('asks for results.getFacetValues', () => {
      widget = hierarchicalMenu(options);
      widget.render({results});
      expect(results.getFacetValues.calledOnce).toBe(true);
      expect(results.getFacetValues.getCall(0).args).toEqual([
        'hello', {
          sortBy: [
            'name:asc'
          ]
        }
      ]);
    });

    it('has a sortBy option', () => {
      widget = hierarchicalMenu({...options, sortBy: ['count:asc']});
      widget.render({results});
      expect(results.getFacetValues.calledOnce).toBe(true);
      expect(results.getFacetValues.getCall(0).args).toEqual([
        'hello', {
          sortBy: [
            'count:asc'
          ]
        }
      ]);
    });

    it('has a templates option', () => {
      widget = hierarchicalMenu({...options, templates: {
        header: 'header2',
        item: 'item2',
        footer: 'footer2'
      }});
      widget.render({results});
      expect(ReactDOM.render.firstCall.args[0].props.templateProps.templates)
        .toEqual({
          header: 'header2',
          item: 'item2',
          footer: 'footer2'
        });
    });

    it('sets shouldAutoHideContainer to true when no results', () => {
      data = {};
      widget = hierarchicalMenu(options);
      widget.render({results});
      expect(ReactDOM.render.firstCall.args[0].props.shouldAutoHideContainer).toBe(true);
    });

    it('sets facetValues to empty array when no results', () => {
      data = {};
      widget = hierarchicalMenu(options);
      widget.render({results});
      expect(ReactDOM.render.firstCall.args[0].props.facetValues).toEqual([]);
    });

    it('has a toggleRefinement method', () => {
      let search = sinon.spy();
      let toggleRefinement = sinon.spy(
        () => ({
          search
        })
      );

      let helper = {toggleRefinement};

      widget = hierarchicalMenu(options);
      widget.render({results, helper});
      let elementToggleRefinement = ReactDOM.render.firstCall.args[0].props.toggleRefinement;
      elementToggleRefinement('mom');
      expect(toggleRefinement.calledOnce).toBe(true);
      expect(toggleRefinement.getCall(0).args)
        .toEqual(['hello', 'mom']);
      expect(search.calledOnce).toBe(true);
      expect(toggleRefinement.calledBefore(search)).toBe(true);
    });

    it('has a limit option', () => {
      let secondLevel = [
        {name: 'six'},
        {name: 'seven'},
        {name: 'eight'},
        {name: 'nine'}
      ];

      let firstLevel = [
        {name: 'one'},
        {name: 'two', data: secondLevel},
        {name: 'three'},
        {name: 'four'},
        {name: 'five'}
      ];

      data = {data: firstLevel};
      let expectedFacetValues = [
        {name: 'one'},
        {name: 'two', data: [
          {name: 'six'},
          {name: 'seven'},
          {name: 'eight'}
        ]},
        {name: 'three'}
      ];
      widget = hierarchicalMenu({...options, limit: 3});
      widget.render({results});
      let actualFacetValues = ReactDOM.render.firstCall.args[0].props.facetValues;
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
