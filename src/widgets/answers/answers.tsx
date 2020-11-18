/** @jsx h */

import { h, render } from 'preact';
import cx from 'classnames';
import { WidgetFactory, SearchClient, Template, Hit } from '../../types';
import defaultTemplates from './defaultTemplates';
import {
  createDocumentationMessageGenerator,
  getContainerNode,
  prepareTemplateProps,
  warning,
} from '../../lib/utils';
import { component } from '../../lib/suit';
import TemplateRenderer from '../../components/Template/Template';

const withUsage = createDocumentationMessageGenerator({ name: 'answers' });
const suit = component('Answers');

export type AnswersTemplates = {
  header?: Template<{
    hits: Hit[];
    isLoading: boolean;
  }>;

  loader?: Template;

  item?: Template<Hit>;
};

export type AnswersCSSClasses = {
  root?: string | string[];

  emptyRoot?: string | string[];

  header?: string | string[];

  loader?: string | string[];

  list?: string | string[];

  item?: string | string[];
};

export type AnswersWidgetParams = {
  /**
   * CSS Selector or HTMLElement to insert the widget.
   */
  container: string | HTMLElement;

  attributesForPrediction: string[];

  searchClient: SearchClient;

  queryLanguages?: string[];

  nbHits?: number;

  templates?: AnswersTemplates;

  cssClasses?: AnswersCSSClasses;
};

export type AnswersWidget = WidgetFactory<
  {},
  AnswersWidgetParams,
  AnswersWidgetParams
>;

const answersWidget: AnswersWidget = widgetParams => {
  const {
    container,
    attributesForPrediction,
    searchClient,
    queryLanguages = ['en'],
    nbHits = 1,
    templates = defaultTemplates,
    cssClasses: userCssClasses = {},
  } = widgetParams || ({} as typeof widgetParams);

  if (!container) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  const containerNode = getContainerNode(container);
  const cssClasses = {
    root: cx(suit(), userCssClasses.root),
    emptyRoot: cx(suit({ modifierName: 'empty' }), userCssClasses.emptyRoot),
    header: cx(suit({ descendantName: 'header' }), userCssClasses.header),
    loader: cx(suit({ descendantName: 'loader' }), userCssClasses.loader),
    list: cx(suit({ descendantName: 'list' }), userCssClasses.list),
    item: cx(suit({ descendantName: 'item' }), userCssClasses.item),
  };

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
      debouncedFindAnswers({ query, index }).then(({ hits }) => {
        render(
          <div
            className={`${cssClasses.root} ${
              hits && hits.length > 0 ? '' : cssClasses.emptyRoot
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
              {(hits || []).map((hit, key) => (
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
};

export default answersWidget;
