import { render as preactRender, VNode } from 'preact';
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
import voiceSearch, { VoiceSearchWidgetParams } from '../voice-search';
import { VoiceSearchHelper } from '../../../lib/voiceSearchHelper/types';
import { VoiceSearchProps } from '../../../components/VoiceSearch/VoiceSearch';

const render = castToJestMock(preactRender);
jest.mock('preact', () => {
  const module = jest.requireActual('preact');

  module.render = jest.fn();

  return module;
});

type DefaultSetupWrapper = {
  container: HTMLDivElement;
  widget: Widget;
  widgetInit: (helper: Helper) => void;
  widgetRender: (helper: Helper) => void;
};

function defaultSetup(
  opts: Omit<VoiceSearchWidgetParams, 'container'> = {}
): DefaultSetupWrapper {
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
          // @ts-expect-error
          container: undefined,
        });
      }).toThrowErrorMatchingInlineSnapshot(`
"The \`container\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/voice-search/js/"
`);
    });

    it('creates custom voice helper', () => {
      const voiceHelper: VoiceSearchHelper = {
        isBrowserSupported: () => true,
        dispose: () => {},
        getState: () => ({
          isSpeechFinal: true,
          status: 'askingPermission',
          transcript: '',
        }),
        isListening: () => true,
        startListening: () => {},
        stopListening: () => {},
      };

      const { widgetInit, widget } = defaultSetup({
        createVoiceSearchHelper: () => voiceHelper,
      });

      widgetInit(helper);

      expect((widget as any)._voiceSearchHelper).toBe(voiceHelper);
    });
  });

  describe('Rendering', () => {
    test('renders during init()', () => {
      const { widgetInit } = defaultSetup();
      widgetInit(helper);

      const firstRender = render.mock.calls[0][0] as VNode<VoiceSearchProps>;

      expect(render).toHaveBeenCalledTimes(1);
      expect(firstRender.props).toMatchSnapshot();
    });

    test('renders during render()', () => {
      const { container, widgetInit, widgetRender } = defaultSetup();
      widgetInit(helper);
      widgetRender(helper);

      const firstRender = render.mock.calls[0][0] as VNode<VoiceSearchProps>;
      const secondRender = render.mock.calls[1][0] as VNode<VoiceSearchProps>;
      const firstContainer = render.mock.calls[0][1];
      const secondContainer = render.mock.calls[1][1];

      expect(render).toHaveBeenCalledTimes(2);
      expect(firstRender.props).toMatchSnapshot();
      expect(firstContainer).toEqual(container);
      expect(secondRender.props).toMatchSnapshot();
      expect(secondContainer).toEqual(container);
    });

    test('sets the correct CSS classes', () => {
      const { widgetInit } = defaultSetup();

      widgetInit(helper);

      const firstRender = render.mock.calls[0][0] as VNode<VoiceSearchProps>;

      expect(
        (firstRender.props as VoiceSearchProps).cssClasses
      ).toMatchSnapshot();
    });
  });
});
