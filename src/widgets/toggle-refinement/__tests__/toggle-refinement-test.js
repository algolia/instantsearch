import { render } from 'preact';
import jsHelper, { SearchParameters } from 'algoliasearch-helper';
import toggleRefinement from '../toggle-refinement';
import RefinementList from '../../../components/RefinementList/RefinementList';

jest.mock('preact', () => {
  const module = require.requireActual('preact');

  module.render = jest.fn();

  return module;
});

describe('toggleRefinement()', () => {
  describe('Usage', () => {
    it('throws without container', () => {
      expect(() => {
        toggleRefinement({ container: undefined });
      }).toThrowErrorMatchingInlineSnapshot(`
"The \`container\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/toggle-refinement/js/"
`);
    });
  });

  describe('Lifecycle', () => {
    let containerNode;
    let widget;
    let attribute;
    let instantSearchInstance;

    beforeEach(() => {
      render.mockClear();

      containerNode = document.createElement('div');
      attribute = 'world!';
      widget = toggleRefinement({
        container: containerNode,
        attribute,
      });
      instantSearchInstance = { templatesConfig: undefined };
    });

    describe('render', () => {
      let results;
      let helper;
      let state;
      let createURL;

      beforeEach(() => {
        helper = {
          state: {
            isDisjunctiveFacetRefined: jest.fn().mockReturnValue(false),
          },
          removeDisjunctiveFacetRefinement: jest.fn(),
          addDisjunctiveFacetRefinement: jest.fn(),
          search: jest.fn(),
        };
        state = {
          removeDisjunctiveFacetRefinement: jest.fn(),
          addDisjunctiveFacetRefinement: jest.fn(),
          isDisjunctiveFacetRefined: jest.fn().mockReturnValue(false),
        };
        createURL = () => '#';
        widget.init({ state, helper, createURL, instantSearchInstance });
      });

      it('calls twice render', () => {
        results = {
          hits: [{ Hello: ', world!' }],
          nbHits: 1,
          getFacetValues: jest.fn().mockReturnValue([
            { name: 'true', count: 2 },
            { name: 'false', count: 1 },
          ]),
        };
        widget = toggleRefinement({
          container: containerNode,
          attribute,
          /* on: true, off: undefined */
        });
        widget.getWidgetSearchParameters(new SearchParameters({}), {
          uiState: {},
        });
        widget.init({ helper, state, createURL, instantSearchInstance });
        widget.render({ results, helper, state });
        widget.render({ results, helper, state });

        const [firstRender, secondRender] = render.mock.calls;

        expect(render).toHaveBeenCalledTimes(2);
        expect(firstRender[1]).toEqual(containerNode);
        expect(secondRender[1]).toEqual(containerNode);
      });

      it('understands cssClasses', () => {
        results = {
          hits: [{ Hello: ', world!' }],
          nbHits: 1,
          getFacetValues: jest.fn().mockReturnValue([
            { name: 'true', count: 2, isRefined: false },
            { name: 'false', count: 1, isRefined: false },
          ]),
        };
        widget = toggleRefinement({
          container: containerNode,
          attribute,
          cssClasses: {
            root: 'test',
            label: 'test-label',
            labelText: 'test-labelText',
            checkbox: 'test-checkbox',
          },
          /* on: true, off: undefined */
          RefinementList,
        });
        widget.getWidgetSearchParameters(new SearchParameters({}), {
          uiState: {},
        });
        widget.init({ state, helper, createURL, instantSearchInstance });
        widget.render({ results, helper, state });

        const [firstRender] = render.mock.calls;

        expect(firstRender[0].props).toMatchSnapshot();
      });

      it('with facet values', () => {
        results = {
          hits: [{ Hello: ', world!' }],
          nbHits: 1,
          getFacetValues: jest.fn().mockReturnValue([
            { name: 'true', count: 2, isRefined: false },
            { name: 'false', count: 1, isRefined: false },
          ]),
        };
        widget = toggleRefinement({
          container: containerNode,
          attribute,
          /* on: true, off: undefined */
          RefinementList,
        });
        widget.getWidgetSearchParameters(new SearchParameters({}), {
          uiState: {},
        });
        widget.init({ state, helper, createURL, instantSearchInstance });
        widget.render({ results, helper, state });
        widget.render({ results, helper, state });

        const [firstRender, secondRender] = render.mock.calls;

        expect(firstRender[0].props).toMatchSnapshot();
        expect(secondRender[0].props).toMatchSnapshot();
      });

      it('supports negative numeric off or on values', () => {
        results = {
          hits: [{ Hello: ', world!' }],
          nbHits: 1,
          getFacetValues: jest.fn().mockReturnValue([
            { name: '-2', count: 2, isRefined: true },
            { name: '5', count: 1, isRefined: false },
          ]),
        };

        widget = toggleRefinement({
          container: containerNode,
          attribute,
          off: -2,
          on: 5,
        });

        const config = widget.getWidgetSearchParameters(
          new SearchParameters({}),
          { uiState: {} }
        );
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

        const [firstRender, secondRender] = render.mock.calls;

        // The first call is not the one expected, because of the new init rendering..
        expect(firstRender[0].props).toMatchSnapshot();
        expect(secondRender[0].props).toMatchSnapshot();

        widget.toggleRefinement({ isRefined: true });

        expect(altHelper.state.isDisjunctiveFacetRefined(attribute, 5)).toBe(
          false
        );
        expect(
          altHelper.state.isDisjunctiveFacetRefined(attribute, '\\-2')
        ).toBe(true);
      });

      it('without facet values', () => {
        results = {
          hits: [],
          nbHits: 0,
          getFacetValues: jest.fn().mockReturnValue([]),
        };
        widget = toggleRefinement({
          container: containerNode,
          attribute,
          /* on: true, off: undefined */
          RefinementList,
        });
        widget.getWidgetSearchParameters(new SearchParameters({}), {
          uiState: {},
        });
        widget.init({ state, helper, createURL, instantSearchInstance });
        widget.render({ results, helper, state });
        widget.render({ results, helper, state });

        const [firstRender, secondRender] = render.mock.calls;

        expect(firstRender[0].props).toMatchSnapshot();
        expect(secondRender[0].props).toMatchSnapshot();
      });

      it('when refined', () => {
        helper = {
          state: {
            isDisjunctiveFacetRefined: jest.fn().mockReturnValue(true),
          },
        };
        results = {
          hits: [{ Hello: ', world!' }],
          nbHits: 1,
          getFacetValues: jest.fn().mockReturnValue([
            { name: 'true', count: 2, isRefined: true },
            { name: 'false', count: 1, isRefined: false },
          ]),
        };
        widget = toggleRefinement({
          container: containerNode,
          attribute,
          /* on: true, off: undefined */
          RefinementList,
        });
        widget.getWidgetSearchParameters(new SearchParameters({}), {
          uiState: {},
        });
        widget.init({ state, helper, createURL, instantSearchInstance });
        widget.render({ results, helper, state });
        widget.render({ results, helper, state });

        const [firstRender, secondRender] = render.mock.calls;

        expect(firstRender[0].props).toMatchSnapshot();
        expect(secondRender[0].props).toMatchSnapshot();
      });

      it('using props.refine', () => {
        results = {
          hits: [{ Hello: ', world!' }],
          nbHits: 1,
          getFacetValues: jest.fn().mockReturnValue([
            { name: 'true', count: 2 },
            { name: 'false', count: 1 },
          ]),
        };
        widget = toggleRefinement({
          container: containerNode,
          attribute,
          /* on: true, off: undefined */
          RefinementList,
        });
        widget.getWidgetSearchParameters(new SearchParameters({}), {
          uiState: {},
        });
        widget.init({ state, helper, createURL, instantSearchInstance });
        widget.render({ results, helper, state });

        const [firstRender] = render.mock.calls;
        const { refine } = firstRender[0].props;

        expect(typeof refine).toEqual('function');
        refine();
        expect(helper.addDisjunctiveFacetRefinement).toHaveBeenCalledTimes(1);
        expect(helper.addDisjunctiveFacetRefinement).toHaveBeenCalledWith(
          attribute,
          true
        );
        helper.hasRefinements = jest.fn().mockReturnValue(true);
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
          removeDisjunctiveFacetRefinement: jest.fn(),
          addDisjunctiveFacetRefinement: jest.fn(),
          search: jest.fn(),
        };
      });

      describe('default values', () => {
        it('toggle on should add filter to true', () => {
          // Given
          widget = toggleRefinement({
            container: containerNode,
            attribute,
            /* on: true, off: undefined */
          });
          widget.getWidgetSearchParameters(new SearchParameters({}), {
            uiState: {},
          });
          const state = {
            isDisjunctiveFacetRefined: jest.fn().mockReturnValue(false),
          };
          const createURL = () => '#';
          widget.init({ state, helper, createURL, instantSearchInstance });

          // When
          toggleOn();

          // Then
          expect(helper.addDisjunctiveFacetRefinement).toHaveBeenCalledWith(
            attribute,
            true
          );
          expect(
            helper.removeDisjunctiveFacetRefinement
          ).not.toHaveBeenCalled();
        });
        it('toggle off should remove all filters', () => {
          // Given
          widget = toggleRefinement({
            container: containerNode,
            attribute,
            /* on: true, off: undefined */
          });
          widget.getWidgetSearchParameters(new SearchParameters({}), {
            uiState: {},
          });
          const state = {
            isDisjunctiveFacetRefined: jest.fn().mockReturnValue(true),
          };
          const createURL = () => '#';
          widget.init({ state, helper, createURL, instantSearchInstance });

          // When
          toggleOff();

          // Then
          expect(helper.removeDisjunctiveFacetRefinement).toHaveBeenCalledWith(
            attribute,
            true
          );
          expect(helper.addDisjunctiveFacetRefinement).not.toHaveBeenCalled();
        });
      });
      describe('specific values', () => {
        it('toggle on should change the refined value', () => {
          // Given
          const userValues = { on: 'on', off: 'off' };
          widget = toggleRefinement({
            container: containerNode,
            attribute,
            ...userValues,
          });

          const config = widget.getWidgetSearchParameters(
            new SearchParameters({}),
            { uiState: {} }
          );
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
            altHelper.state.isDisjunctiveFacetRefined(attribute, 'off')
          ).toBe(false);
          expect(
            altHelper.state.isDisjunctiveFacetRefined(attribute, 'on')
          ).toBe(true);
        });

        it('toggle off should change the refined value', () => {
          // Given
          const userValues = { on: 'on', off: 'off' };
          widget = toggleRefinement({
            container: containerNode,
            attribute,
            ...userValues,
          });
          widget.getWidgetSearchParameters(new SearchParameters({}), {
            uiState: {},
          });
          const state = {
            isDisjunctiveFacetRefined: jest.fn().mockReturnValue(true),
          };
          const createURL = () => '#';
          widget.init({ state, helper, createURL, instantSearchInstance });

          // When
          toggleOff();

          // Then
          expect(helper.removeDisjunctiveFacetRefinement).toHaveBeenCalledWith(
            attribute,
            'on'
          );
          expect(helper.addDisjunctiveFacetRefinement).toHaveBeenCalledWith(
            attribute,
            'off'
          );
        });
      });
    });

    describe('custom off value', () => {
      const createURL = () => '#';
      it('should add a refinement for custom off value on init', () => {
        // Given
        const userValues = { on: 'on', off: 'off' };
        widget = toggleRefinement({
          container: containerNode,
          attribute,
          ...userValues,
        });
        const config = widget.getWidgetSearchParameters(
          new SearchParameters({}),
          { uiState: {} }
        );
        const helper = jsHelper({}, '', config);

        // When
        widget.init({
          state: helper.state,
          helper,
          createURL,
          instantSearchInstance,
        });

        // Then
        expect(helper.state.isDisjunctiveFacetRefined(attribute, 'off')).toBe(
          true
        );
      });

      it('should not add a refinement for custom off value on init if already checked', () => {
        // Given
        const userValues = { on: 'on', off: 'off' };
        widget = toggleRefinement({
          container: containerNode,
          attribute,
          ...userValues,
        });
        widget.getWidgetSearchParameters(new SearchParameters({}), {
          uiState: {},
        });
        const state = {
          isDisjunctiveFacetRefined: jest.fn().mockReturnValue(true),
        };
        const helper = {
          addDisjunctiveFacetRefinement: jest.fn(),
        };

        // When
        widget.init({ state, helper, createURL, instantSearchInstance });

        // Then
        expect(helper.addDisjunctiveFacetRefinement).not.toHaveBeenCalled();
      });

      it('should not add a refinement for no custom off value on init', () => {
        // Given
        const userValues = { on: 'on' };
        widget = toggleRefinement({
          container: containerNode,
          attribute,
          ...userValues,
        });
        widget.getWidgetSearchParameters(new SearchParameters({}), {
          uiState: {},
        });
        const state = {
          isDisjunctiveFacetRefined: () => false,
        };
        const helper = {
          addDisjunctiveFacetRefinement: jest.fn(),
        };

        // When
        widget.init({ state, helper, createURL, instantSearchInstance });

        // Then
        expect(helper.addDisjunctiveFacetRefinement).not.toHaveBeenCalled();
      });
    });
  });
});
