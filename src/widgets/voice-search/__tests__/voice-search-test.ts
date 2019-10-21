import { render as preactRender } from 'preact';
import algoliasearch from 'algoliasearch';
import algoliasearchHelper, {
  AlgoliaSearchHelper as Helper,
  SearchResults,
  SearchParameters,
} from 'algoliasearch-helper';
import {
  createInitOptions,
  createRenderOptions,
} from '../../../../test/mock/createWidget';
import { createSingleSearchResponse } from '../../../../test/mock/createAPIResponse';
import { castToJestMock } from '../../../../test/utils/castToJestMock';
import { Widget } from '../../../types';
import voiceSearch from '../voice-search';

const render = castToJestMock(preactRender);

jest.mock('preact', () => {
  const module = require.requireActual('preact');

  module.render = jest.fn();

  return module;
});

interface DefaultSetupWrapper {
  container: HTMLDivElement;
  widget: Widget;
  widgetInit: (helper: Helper) => void;
  widgetRender: (helper: Helper) => void;
}

function defaultSetup(opts = {}): DefaultSetupWrapper {
  const container = document.createElement('div');
  const widget = voiceSearch({ container, ...opts });

  const widgetInit = (helper: Helper): void => {
    if (!widget.init) {
      throw new Error('VoiceSearch widget has no init method.');
    }

    widget.init(
      createInitOptions({
        helper,
        state: helper.state,
      })
    );
  };

  const widgetRender = (helper: Helper): void => {
    if (!widget.render) {
      throw new Error('VoiceSearch widget has no render method.');
    }

    widget.render(
      createRenderOptions({
        helper,
        state: helper.state,
        results: new SearchResults(helper.state, [
          createSingleSearchResponse(),
        ]),
      })
    );
  };

  return { container, widget, widgetInit, widgetRender };
}

describe('voiceSearch()', () => {
  let helper: Helper;

  beforeEach(() => {
    render.mockClear();

    helper = algoliasearchHelper(algoliasearch('APP_ID', 'API_KEY'), '', {});
    helper.setQuery = jest.fn();
    helper.search = jest.fn();
    helper.state = new SearchParameters({ query: '' });
  });

  describe('Usage', () => {
    it('throws without container', () => {
      expect(() => {
        voiceSearch({
          // @ts-ignore
          container: undefined,
        });
      }).toThrowErrorMatchingInlineSnapshot(`
"The \`container\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/voice-search/js/"
`);
    });
  });

  describe('Rendering', () => {
    test('renders during init()', () => {
      const { widgetInit } = defaultSetup();
      widgetInit(helper);

      const [firstRender] = render.mock.calls;

      expect(render).toHaveBeenCalledTimes(1);
      expect(firstRender[0].props).toMatchSnapshot();
    });

    test('renders during render()', () => {
      const { container, widgetInit, widgetRender } = defaultSetup();
      widgetInit(helper);
      widgetRender(helper);

      const [firstRender, secondRender] = render.mock.calls;

      expect(render).toHaveBeenCalledTimes(2);
      expect(firstRender[0].props).toMatchSnapshot();
      expect(firstRender[1]).toEqual(container);
      expect(secondRender[0].props).toMatchSnapshot();
      expect(secondRender[1]).toEqual(container);
    });

    test('sets the correct CSS classes', () => {
      const { widgetInit } = defaultSetup();

      widgetInit(helper);

      const [firstRender] = render.mock.calls;

      expect(firstRender[0].props.cssClasses).toMatchSnapshot();
    });
  });
});
