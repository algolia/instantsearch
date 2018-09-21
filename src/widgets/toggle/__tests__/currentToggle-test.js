import expect from 'expect';
import sinon from 'sinon';
import currentToggle from '../toggle.js';
import RefinementList from '../../../components/RefinementList/RefinementList.js';

import jsHelper from 'algoliasearch-helper';

describe('currentToggle()', () => {
  describe('good usage', () => {
    let ReactDOM;
    let containerNode;
    let widget;
    let attributeName;
    let instantSearchInstance;

    beforeEach(() => {
      ReactDOM = { render: sinon.spy() };

      currentToggle.__Rewire__('render', ReactDOM.render);

      containerNode = document.createElement('div');
      attributeName = 'world!';
      widget = currentToggle({
        container: containerNode,
        attributeName,
      });
      instantSearchInstance = { templatesConfig: undefined };
    });

    it('configures disjunctiveFacets', () => {
      expect(widget.getConfiguration()).toEqual({
        disjunctiveFacets: ['world!'],
      });
    });

    describe('render', () => {
      let results;
      let helper;
      let state;
      let createURL;

      beforeEach(() => {
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
          /* on: true, off: undefined */
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
        widget = currentToggle({
          container: containerNode,
          attributeName,
          cssClasses: {
            root: 'test',
            label: 'test-label',
            labelText: 'test-labelText',
            checkbox: 'test-checkbox',
          },
          /* on: true, off: undefined */
          RefinementList,
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
          /* on: true, off: undefined */
          RefinementList,
        });
        widget.getConfiguration();
        widget.init({ state, helper, createURL, instantSearchInstance });
        widget.render({ results, helper, state });
        widget.render({ results, helper, state });

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
          off: -2,
          on: 5,
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
          /* on: true, off: undefined */
          RefinementList,
        });
        widget.getConfiguration();
        widget.init({ state, helper, createURL, instantSearchInstance });
        widget.render({ results, helper, state });
        widget.render({ results, helper, state });

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
          /* on: true, off: undefined */
          RefinementList,
        });
        widget.getConfiguration();
        widget.init({ state, helper, createURL, instantSearchInstance });
        widget.render({ results, helper, state });
        widget.render({ results, helper, state });

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
          /* on: true, off: undefined */
          RefinementList,
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
            /* on: true, off: undefined */
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
            /* on: true, off: undefined */
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
          const userValues = { on: 'on', off: 'off' };
          widget = currentToggle({
            container: containerNode,
            attributeName,
            ...userValues,
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
          const userValues = { on: 'on', off: 'off' };
          widget = currentToggle({
            container: containerNode,
            attributeName,
            ...userValues,
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
        const userValues = { on: 'on', off: 'off' };
        widget = currentToggle({
          container: containerNode,
          attributeName,
          ...userValues,
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
        const userValues = { on: 'on', off: 'off' };
        widget = currentToggle({
          container: containerNode,
          attributeName,
          ...userValues,
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
        const userValues = { on: 'on' };
        widget = currentToggle({
          container: containerNode,
          attributeName,
          ...userValues,
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
