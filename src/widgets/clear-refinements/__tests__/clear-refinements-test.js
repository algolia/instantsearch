import { render } from 'preact';
import algoliasearchHelper from 'algoliasearch-helper';
import {
  createInitOptions,
  createRenderOptions,
} from '../../../../test/mock/createWidget';
import clearRefinements from '../clear-refinements';
import { createSearchClient } from '../../../../test/mock/createSearchClient';

jest.mock('preact', () => {
  const module = require.requireActual('preact');

  module.render = jest.fn();

  return module;
});

describe('Usage', () => {
  it('throws without container', () => {
    expect(() => {
      clearRefinements({ container: undefined });
    }).toThrowErrorMatchingInlineSnapshot(`
"The \`container\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/clear-refinements/js/"
`);
  });
});

describe('clearRefinements()', () => {
  beforeEach(() => {
    render.mockClear();
  });

  describe('without refinements', () => {
    it('calls twice render(<ClearRefinements props />, container)', () => {
      const helper = algoliasearchHelper(createSearchClient(), 'indexName', {
        facetsRefinements: {},
      });
      const container = document.createElement('div');
      const widget = clearRefinements({
        container,
      });

      widget.init(createInitOptions({ helper }));
      widget.render(createRenderOptions({ helper, state: helper.state }));
      widget.render(createRenderOptions({ helper, state: helper.state }));

      expect(render).toHaveBeenCalledTimes(2);

      const [firstRender, secondRender] = render.mock.calls;

      expect(firstRender[0].props).toMatchSnapshot();
      expect(firstRender[1]).toEqual(container);

      expect(secondRender[0].props).toMatchSnapshot();
      expect(secondRender[1]).toEqual(container);
    });
  });

  describe('with refinements', () => {
    it('calls twice render(<ClearAll props />, container)', () => {
      const helper = algoliasearchHelper(createSearchClient(), 'indexName', {
        facetsRefinements: {
          facet: ['value'],
        },
      });
      const container = document.createElement('div');
      const widget = clearRefinements({
        container,
      });

      widget.init(createInitOptions({ helper }));
      widget.render(createRenderOptions({ helper, state: helper.state }));
      widget.render(createRenderOptions({ helper, state: helper.state }));

      expect(render).toHaveBeenCalledTimes(2);

      const [firstRender, secondRender] = render.mock.calls;

      expect(firstRender[0].props).toMatchSnapshot();
      expect(firstRender[1]).toEqual(container);

      expect(secondRender[0].props).toMatchSnapshot();
      expect(secondRender[1]).toEqual(container);
    });
  });

  describe('cssClasses', () => {
    it('should add the default CSS classes', () => {
      const helper = algoliasearchHelper(createSearchClient(), 'indexName');
      const container = document.createElement('div');
      const widget = clearRefinements({
        container,
      });

      widget.init(createInitOptions({ helper }));
      widget.render(createRenderOptions({ helper, state: helper.state }));

      expect(render.mock.calls[0][0].props.cssClasses).toMatchInlineSnapshot(`
        Object {
          "button": "ais-ClearRefinements-button",
          "disabledButton": "ais-ClearRefinements-button--disabled",
          "root": "ais-ClearRefinements",
        }
      `);
    });

    it('should allow overriding CSS classes', () => {
      const helper = algoliasearchHelper(createSearchClient(), 'indexName');
      const container = document.createElement('div');
      const widget = clearRefinements({
        container,
        cssClasses: {
          root: 'myRoot',
          button: ['myButton', 'myPrimaryButton'],
          disabledButton: ['disabled'],
        },
      });

      widget.init(createInitOptions({ helper }));
      widget.render(createRenderOptions({ helper, state: helper.state }));

      expect(render.mock.calls[0][0].props.cssClasses).toMatchInlineSnapshot(`
        Object {
          "button": "ais-ClearRefinements-button myButton myPrimaryButton",
          "disabledButton": "ais-ClearRefinements-button--disabled disabled",
          "root": "ais-ClearRefinements myRoot",
        }
      `);
    });
  });
});
