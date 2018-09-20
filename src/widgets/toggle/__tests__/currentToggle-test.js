import expect from 'expect';
import sinon from 'sinon';
import currentToggle from '../toggle.js';
import defaultTemplates from '../defaultTemplates.js';
import RefinementList from '../../../components/RefinementList/RefinementList.js';

import jsHelper from 'algoliasearch-helper';

describe('currentToggle()', () => {
  describe('good usage', () => {
    let ReactDOM;
    let containerNode;
    let widget;
    let attributeName;
    let label;
    let userValues;
    let collapsible;
    let cssClasses;
    let instantSearchInstance;

    beforeEach(() => {
      ReactDOM = { render: sinon.spy() };

      currentToggle.__Rewire__('render', ReactDOM.render);

      containerNode = document.createElement('div');
      label = 'Hello, ';
      attributeName = 'world!';
      cssClasses = {
        active: 'ais-toggle--item__active',
        body: 'ais-toggle--body',
        checkbox: 'ais-toggle--checkbox',
        count: 'ais-toggle--count',
        footer: 'ais-toggle--footer',
        header: 'ais-toggle--header',
        item: 'ais-toggle--item',
        label: 'ais-toggle--label',
        list: 'ais-toggle--list',
        root: 'ais-toggle',
      };
      collapsible = false;
      userValues = { on: true, off: undefined };
      widget = currentToggle({
        container: containerNode,
        attributeName,
        label,
      });
      instantSearchInstance = { templatesConfig: undefined };
    });

    it('configures disjunctiveFacets', () => {
      expect(widget.getConfiguration()).toEqual({
        disjunctiveFacets: ['world!'],
      });
    });

    describe('render', () => {
      let templateProps;
      let results;
      let helper;
      let state;
      let props;
      let createURL;

      beforeEach(() => {
        templateProps = {
          templatesConfig: undefined,
          templates: defaultTemplates,
          useCustomCompileOptions: {
            header: false,
            item: false,
            footer: false,
          },
          transformData: undefined,
        };
        helper = {
          state: {
            isDisjunctiveFacetRefined: sinon.stub().returns(false),
          },
          removeDisjunctiveFacetRefinement: sinon.spy(),
          addDisjunctiveFacetRefinement: sinon.spy(),
          search: sinon.spy(),
        };
        state = {
          removeDisjunctiveFacetRefinement: sinon.spy(),
          addDisjunctiveFacetRefinement: sinon.spy(),
          isDisjunctiveFacetRefined: sinon.stub().returns(false),
        };
        props = {
          cssClasses,
          collapsible: false,
          templateProps,
          createURL() {},
          toggleRefinement() {},
        };
        createURL = () => '#';
        widget.init({ state, helper, createURL, instantSearchInstance });
      });

      it('calls twice ReactDOM.render', () => {
        results = {
          hits: [{ Hello: ', world!' }],
          nbHits: 1,
          getFacetValues: sinon
            .stub()
            .returns([{ name: 'true', count: 2 }, { name: 'false', count: 1 }]),
        };
        widget = currentToggle({
          container: containerNode,
          attributeName,
          label,
          userValues,
        });
        widget.getConfiguration();
        widget.init({ helper, state, createURL, instantSearchInstance });
        widget.render({ results, helper, state });
        widget.render({ results, helper, state });
        expect(ReactDOM.render.calledTwice).toBe(
          true,
          'ReactDOM.render called twice'
        );
        expect(ReactDOM.render.firstCall.args[1]).toEqual(containerNode);
        expect(ReactDOM.render.secondCall.args[1]).toEqual(containerNode);
      });

      it('understands cssClasses', () => {
        results = {
          hits: [{ Hello: ', world!' }],
          nbHits: 1,
          getFacetValues: sinon
            .stub()
            .returns([
              { name: 'true', count: 2, isRefined: false },
              { name: 'false', count: 1, isRefined: false },
            ]),
        };
        props.cssClasses.root = 'ais-toggle test';
        props = {
          facetValues: [
            {
              count: 2,
              isRefined: false,
              name: label,
              offFacetValue: { count: 3, name: 'Hello, ', isRefined: false },
              onFacetValue: { count: 2, name: 'Hello, ', isRefined: false },
            },
          ],
          shouldAutoHideContainer: false,
          ...props,
        };
        cssClasses = props.cssClasses;
        widget = currentToggle({
          container: containerNode,
          attributeName,
          label,
          cssClasses: { root: 'test' },
          userValues,
          RefinementList,
          collapsible,
        });
        widget.getConfiguration();
        widget.init({ state, helper, createURL, instantSearchInstance });
        widget.render({ results, helper, state });
        expect(ReactDOM.render.firstCall.args[0]).toMatchSnapshot();
      });

      it('with facet values', () => {
        results = {
          hits: [{ Hello: ', world!' }],
          nbHits: 1,
          getFacetValues: sinon
            .stub()
            .returns([
              { name: 'true', count: 2, isRefined: false },
              { name: 'false', count: 1, isRefined: false },
            ]),
        };
        widget = currentToggle({
          container: containerNode,
          attributeName,
          label,
          userValues,
          RefinementList,
          collapsible,
        });
        widget.getConfiguration();
        widget.init({ state, helper, createURL, instantSearchInstance });
        widget.render({ results, helper, state });
        widget.render({ results, helper, state });

        props = {
          facetValues: [
            {
              count: 2,
              isRefined: false,
              name: label,
              offFacetValue: { count: 3, name: 'Hello, ', isRefined: false },
              onFacetValue: { count: 2, name: 'Hello, ', isRefined: false },
            },
          ],
          shouldAutoHideContainer: false,
          ...props,
        };

        expect(ReactDOM.render.firstCall.args[0]).toMatchSnapshot();
        expect(ReactDOM.render.secondCall.args[0]).toMatchSnapshot();
      });

      it('supports negative numeric off or on values', () => {
        results = {
          hits: [{ Hello: ', world!' }],
          nbHits: 1,
          getFacetValues: sinon
            .stub()
            .returns([
              { name: '-2', count: 2, isRefined: true },
              { name: '5', count: 1, isRefined: false },
            ]),
        };

        widget = currentToggle({
          container: containerNode,
          attributeName,
          label,
          values: {
            off: -2,
            on: 5,
          },
          collapsible,
        });

        const config = widget.getConfiguration();
        const altHelper = jsHelper({}, '', config);
        altHelper.search = () => {};

        widget.init({
          state: altHelper.state,
          helper: altHelper,
          createURL,
          instantSearchInstance,
        });
        widget.render({ results, helper: altHelper, state });
        widget.render({ results, helper: altHelper, state });

        props = {
          facetValues: [
            {
              count: 1,
              isRefined: false,
              name: label,
              offFacetValue: { count: 2, name: label, isRefined: true },
              onFacetValue: { count: 1, name: label, isRefined: false },
            },
          ],
          shouldAutoHideContainer: false,
          ...props,
        };

        // The first call is not the one expected, because of the new init rendering..
        expect(ReactDOM.render.firstCall.args[0]).toMatchSnapshot();
        expect(ReactDOM.render.secondCall.args[0]).toMatchSnapshot();

        widget.toggleRefinement({ isRefined: true });

        expect(
          altHelper.state.isDisjunctiveFacetRefined(attributeName, 5)
        ).toBe(false);
        expect(
          altHelper.state.isDisjunctiveFacetRefined(attributeName, '\\-2')
        ).toBe(true);
      });

      it('without facet values', () => {
        results = {
          hits: [],
          nbHits: 0,
          getFacetValues: sinon.stub().returns([]),
        };
        widget = currentToggle({
          container: containerNode,
          attributeName,
          label,
          userValues,
          RefinementList,
          collapsible,
        });
        widget.getConfiguration();
        widget.init({ state, helper, createURL, instantSearchInstance });
        widget.render({ results, helper, state });
        widget.render({ results, helper, state });

        props = {
          facetValues: [
            {
              name: label,
              isRefined: false,
              count: null,
              onFacetValue: { name: label, isRefined: false, count: null },
              offFacetValue: { name: label, isRefined: false, count: 0 },
            },
          ],
          shouldAutoHideContainer: true,
          ...props,
        };

        expect(ReactDOM.render.firstCall.args[0]).toMatchSnapshot();
        expect(ReactDOM.render.secondCall.args[0]).toMatchSnapshot();
      });

      it('when refined', () => {
        helper = {
          state: {
            isDisjunctiveFacetRefined: sinon.stub().returns(true),
          },
        };
        results = {
          hits: [{ Hello: ', world!' }],
          nbHits: 1,
          getFacetValues: sinon
            .stub()
            .returns([
              { name: 'true', count: 2, isRefined: true },
              { name: 'false', count: 1, isRefined: false },
            ]),
        };
        widget = currentToggle({
          container: containerNode,
          attributeName,
          label,
          userValues,
          RefinementList,
          collapsible,
        });
        widget.getConfiguration();
        widget.init({ state, helper, createURL, instantSearchInstance });
        widget.render({ results, helper, state });
        widget.render({ results, helper, state });

        props = {
          facetValues: [
            {
              count: 3,
              isRefined: true,
              name: label,
              onFacetValue: { name: label, isRefined: true, count: 2 },
              offFacetValue: { name: label, isRefined: false, count: 3 },
            },
          ],
          shouldAutoHideContainer: false,
          ...props,
        };

        expect(ReactDOM.render.firstCall.args[0]).toMatchSnapshot();
        expect(ReactDOM.render.secondCall.args[0]).toMatchSnapshot();
      });

      it('using props.refine', () => {
        results = {
          hits: [{ Hello: ', world!' }],
          nbHits: 1,
          getFacetValues: sinon
            .stub()
            .returns([{ name: 'true', count: 2 }, { name: 'false', count: 1 }]),
        };
        widget = currentToggle({
          container: containerNode,
          attributeName,
          label,
          cssClasses,
          userValues,
          RefinementList,
          collapsible,
        });
        widget.getConfiguration();
        widget.init({ state, helper, createURL, instantSearchInstance });
        widget.render({ results, helper, state });
        const { refine } = ReactDOM.render.firstCall.args[0].props;
        expect(typeof refine).toEqual('function');
        refine();
        expect(helper.addDisjunctiveFacetRefinement.calledOnce).toBe(true);
        expect(
          helper.addDisjunctiveFacetRefinement.calledWithExactly(
            attributeName,
            true
          )
        ).toBe(true);
        helper.hasRefinements = sinon.stub().returns(true);
      });
    });

    describe('refine', () => {
      let helper;

      function toggleOn() {
        widget.toggleRefinement({ isRefined: false });
      }
      function toggleOff() {
        widget.toggleRefinement({ isRefined: true });
      }

      beforeEach(() => {
        helper = {
          removeDisjunctiveFacetRefinement: sinon.spy(),
          addDisjunctiveFacetRefinement: sinon.spy(),
          search: sinon.spy(),
        };
      });

      describe('default values', () => {
        it('toggle on should add filter to true', () => {
          // Given
          widget = currentToggle({
            container: containerNode,
            attributeName,
            label,
            userValues,
          });
          widget.getConfiguration();
          const state = {
            isDisjunctiveFacetRefined: sinon.stub().returns(false),
          };
          const createURL = () => '#';
          widget.init({ state, helper, createURL, instantSearchInstance });

          // When
          toggleOn();

          // Then
          expect(
            helper.addDisjunctiveFacetRefinement.calledWith(attributeName, true)
          ).toBe(true);
          expect(helper.removeDisjunctiveFacetRefinement.called).toBe(false);
        });
        it('toggle off should remove all filters', () => {
          // Given
          widget = currentToggle({
            container: containerNode,
            attributeName,
            label,
            userValues,
          });
          widget.getConfiguration();
          const state = {
            isDisjunctiveFacetRefined: sinon.stub().returns(true),
          };
          const createURL = () => '#';
          widget.init({ state, helper, createURL, instantSearchInstance });

          // When
          toggleOff();

          // Then
          expect(
            helper.removeDisjunctiveFacetRefinement.calledWith(
              attributeName,
              true
            )
          ).toBe(true);
          expect(helper.addDisjunctiveFacetRefinement.called).toBe(false);
        });
      });
      describe('specific values', () => {
        it('toggle on should change the refined value', () => {
          // Given
          userValues = { on: 'on', off: 'off' };
          widget = currentToggle({
            container: containerNode,
            attributeName,
            label,
            values: userValues,
          });

          const config = widget.getConfiguration();
          const altHelper = jsHelper({}, '', config);
          altHelper.search = () => {};

          const createURL = () => '#';

          widget.init({
            state: altHelper.state,
            helper: altHelper,
            createURL,
            instantSearchInstance,
          });

          // When
          toggleOn();

          // Then
          expect(
            altHelper.state.isDisjunctiveFacetRefined(attributeName, 'off')
          ).toBe(false);
          expect(
            altHelper.state.isDisjunctiveFacetRefined(attributeName, 'on')
          ).toBe(true);
        });

        it('toggle off should change the refined value', () => {
          // Given
          userValues = { on: 'on', off: 'off' };
          widget = currentToggle({
            container: containerNode,
            attributeName,
            label,
            values: userValues,
          });
          widget.getConfiguration();
          const state = {
            isDisjunctiveFacetRefined: sinon.stub().returns(true),
          };
          const createURL = () => '#';
          widget.init({ state, helper, createURL, instantSearchInstance });

          // When
          toggleOff();

          // Then
          expect(
            helper.removeDisjunctiveFacetRefinement.calledWith(
              attributeName,
              'on'
            )
          ).toBe(true);
          expect(
            helper.addDisjunctiveFacetRefinement.calledWith(
              attributeName,
              'off'
            )
          ).toBe(true);
        });
      });
    });

    describe('custom off value', () => {
      const createURL = () => '#';
      it('should add a refinement for custom off value on init', () => {
        // Given
        userValues = { on: 'on', off: 'off' };
        widget = currentToggle({
          container: containerNode,
          attributeName,
          label,
          values: userValues,
        });
        const config = widget.getConfiguration();
        const helper = jsHelper({}, '', config);

        // When
        widget.init({
          state: helper.state,
          helper,
          createURL,
          instantSearchInstance,
        });

        // Then
        expect(
          helper.state.isDisjunctiveFacetRefined(attributeName, 'off')
        ).toBe(true);
      });

      it('should not add a refinement for custom off value on init if already checked', () => {
        // Given
        userValues = { on: 'on', off: 'off' };
        widget = currentToggle({
          container: containerNode,
          attributeName,
          label,
          values: userValues,
        });
        widget.getConfiguration();
        const state = {
          isDisjunctiveFacetRefined: sinon.stub().returns(true),
        };
        const helper = {
          addDisjunctiveFacetRefinement: sinon.spy(),
        };

        // When
        widget.init({ state, helper, createURL, instantSearchInstance });

        // Then
        expect(helper.addDisjunctiveFacetRefinement.called).toBe(false);
      });

      it('should not add a refinement for no custom off value on init', () => {
        // Given
        widget = currentToggle({
          container: containerNode,
          attributeName,
          label,
          values: userValues,
        });
        widget.getConfiguration();
        const state = {
          isDisjunctiveFacetRefined: () => false,
        };
        const helper = {
          addDisjunctiveFacetRefinement: sinon.spy(),
        };

        // When
        widget.init({ state, helper, createURL, instantSearchInstance });

        // Then
        expect(helper.addDisjunctiveFacetRefinement.called).toBe(false);
      });
    });

    afterEach(() => {
      currentToggle.__ResetDependency__('render');
    });
  });
});
