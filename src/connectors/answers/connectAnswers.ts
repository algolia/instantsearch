import {
  checkRendering,
  createDocumentationMessageGenerator,
  noop,
} from '../../lib/utils';
import { Connector, Hits } from '../../types';

const withUsage = createDocumentationMessageGenerator({
  name: 'answers',
  connector: true,
});

export type AnswersRendererOptions = {
  /**
   * The matched hits from Algolia API.
   */
  hits: Hits;

  /**
   * whether it's still loading the results from the /answers API
   */
  isLoading: boolean;
};

export type AnswersConnectorParams = {};

export type AnswersConnector = Connector<
  AnswersRendererOptions,
  AnswersConnectorParams
>;

const connectAnswers: AnswersConnector = function connectAnswers(
  renderFn,
  unmountFn = noop
) {
  checkRendering(renderFn, withUsage());

  return widgetParams => {
    // const {} = widgetParams || ({} as typeof widgetParams);

    return {
      $$type: 'ais.answers',

      init(initOptions) {
        renderFn(
          {
            ...this.getWidgetRenderState(initOptions),
            instantSearchInstance: initOptions.instantSearchInstance,
          },
          true
        );
      },

      render(renderOptions) {
        renderFn(
          {
            ...this.getWidgetRenderState(renderOptions),
            instantSearchInstance: renderOptions.instantSearchInstance,
          },
          false
        );
      },

      getRenderState(renderState, renderOptions) {
        return {
          ...renderState,
          answers: this.getWidgetRenderState(renderOptions),
        };
      },

      getWidgetRenderState() {
        return {
          hits: [],
          isLoading: false,
          widgetParams,
        };
      },

      dispose({ state }) {
        unmountFn();
        return state;
      },

      getWidgetSearchParameters(state) {
        return state;
      },
    };
  };
};

export default connectAnswers;

/*
  let lastQuery;

  const findAnswers = ({ query, index }) => {
    const answersIndex = searchClient.initIndex(index);
    if (!answersIndex.findAnswers) {
      // FIXME: put the correct version which supports findAnswers both in lite and full version
      warning(false, '`algoliasearch` >= x.y.z required.');
      return Promise.resolve([]);
    }
    return answersIndex.findAnswers(query, queryLanguages, {
      nbHits,
      attributesForPrediction,
    });
  };

  const debouncedFindAnswers = async ({ query, index }) => {
    if (query === '') {
      return [];
    }
    // TODO: debounce + concurrent-safe
    const answers = await findAnswers({ query, index });
    return answers;
  };







  return {
    init() {
      // TODO: remove this customization once the engine accepts url encoded query params
      if (searchClient.transporter) {
        searchClient.transporter.userAgent.value = 'answers-test';
      }
    },
    render({ state: { query, index }, instantSearchInstance }) {
      const templateProps = prepareTemplateProps({
        defaultTemplates,
        templatesConfig: instantSearchInstance.templatesConfig,
        templates,
      });
      if (lastQuery === query) {
        return;
      }

      lastQuery = query;
      render(
        <div className={cssClasses.root}>
          {templates.header && (
            <div className={cssClasses.header}>
              <TemplateRenderer
                {...templateProps}
                templateKey="header"
                data={{ hits: [], isLoading: true }}
              />
            </div>
          )}
          {templates.loader && (
            <TemplateRenderer {...templateProps} templateKey="loader" />
          )}
        </div>,
        containerNode
      );
      debouncedFindAnswers({ query, index }).then(({ hits = [] }) => {
        render(
          <div
            className={`${cssClasses.root} ${
              hits.length > 0 ? '' : cssClasses.emptyRoot
            }`}
          >
            {templates.header && (
              <div className={cssClasses.header}>
                <TemplateRenderer
                  {...templateProps}
                  templateKey="header"
                  data={{ hits, isLoading: false }}
                />
              </div>
            )}
            <ul className={cssClasses.list}>
              {hits.map((hit, key) => (
                <li key={key} className={cssClasses.item}>
                  <TemplateRenderer
                    {...templateProps}
                    templateKey="item"
                    data={hit}
                  />
                </li>
              ))}
            </ul>
          </div>,
          containerNode
        );
      });
    },
  };
*/
