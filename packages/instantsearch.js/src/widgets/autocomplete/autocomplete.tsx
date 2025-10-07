/** @jsx h */
import { cx } from 'instantsearch-ui-components';
import { Fragment, h, render } from 'preact';

import SearchBox from '../../components/SearchBox/SearchBox';
import TemplateComponent from '../../components/Template/Template';
import { connectAutocomplete, connectSearchBox } from '../../connectors';
import { component } from '../../lib/suit';
import {
  createDocumentationMessageGenerator,
  getContainerNode,
} from '../../lib/utils';
import configure from '../configure/configure';
import index from '../index/index';

import type { SearchBoxComponentTemplates } from '../../components/SearchBox/SearchBox';
import type {
  UiState,
  BaseHit,
  ComponentCSSClasses,
  Hit,
  Template,
} from '../../types';
import type { PlainSearchParameters } from 'algoliasearch-helper';

const withUsage = createDocumentationMessageGenerator({
  name: 'autocomplete',
});
const suit = component('Autocomplete');

export type AutocompleteCSSClasses = Partial<{
  /**
   * CSS class to add to the wrapping `<div>`
   */
  root: string | string[];
  /**
   * CSS class to add to the form
   */
  form: string | string[];
  /**
   * CSS class to add to the input.
   */
  input: string | string[];
  /**
   * CSS classes added to the submit button.
   */
  submit: string | string[];
  /**
   * CSS classes added to the submit icon.
   */
  submitIcon: string | string[];
  /**
   * CSS classes added to the reset button.
   */
  reset: string | string[];
  /**
   * CSS classes added to the reset icon.
   */
  resetIcon: string | string[];
  /**
   * CSS classes added to the loading indicator.
   */
  loadingIndicator: string | string[];
  /**
   * CSS classes added to the loading icon.
   */
  loadingIcon: string | string[];
  /**
   * CSS class to add to the panel that wraps the suggestions.
   */
  panel: string | string[];
}>;
type AutocompleteComponentCSSClasses =
  ComponentCSSClasses<AutocompleteCSSClasses>;

export type AutocompleteTemplates = Partial<{
  /**
   * Template used for displaying the submit button. Can accept a function or a Hogan string.
   */
  submit: Template<{ cssClasses: AutocompleteComponentCSSClasses }>;
  /**
   * Template used for displaying the reset button. Can accept a function or a Hogan string.
   */
  reset: Template<{ cssClasses: AutocompleteComponentCSSClasses }>;
  /**
   * Template used for displaying the loading indicator. Can accept a function or a Hogan string.
   */
  loadingIndicator: Template<{ cssClasses: AutocompleteComponentCSSClasses }>;
}>;

type AutocompleteComponentTemplates = Required<AutocompleteTemplates>;

export type IndexConfig<TItem extends Hit<BaseHit> = Hit<BaseHit>> = {
  indexName: string;
  indexId?: string;
  searchParameters?: PlainSearchParameters;
  templates?: Partial<{
    /**
     * Template used for displaying an item in the autocomplete list. Can accept a function or a Hogan string.
     */
    item: Template<{ item: TItem }>;
  }>;
  getQuery?: (item: TItem) => string;
  getURL?: (item: TItem) => string;
};

export type AutocompleteWidgetParams = {
  container: string | HTMLElement;
  /**
   * The indices that are used in the autocomplete.
   */
  indices?: IndexConfig[];
  cssClasses?: AutocompleteCSSClasses;
  templates?: AutocompleteTemplates;
};

const defaultTemplates: AutocompleteComponentTemplates = {
  reset({ cssClasses }) {
    return (
      <svg
        className={cssClasses.resetIcon}
        viewBox="0 0 20 20"
        width="10"
        height="10"
        aria-hidden="true"
      >
        <path d="M8.114 10L.944 2.83 0 1.885 1.886 0l.943.943L10 8.113l7.17-7.17.944-.943L20 1.886l-.943.943-7.17 7.17 7.17 7.17.943.944L18.114 20l-.943-.943-7.17-7.17-7.17 7.17-.944.943L0 18.114l.943-.943L8.113 10z" />
      </svg>
    );
  },
  submit({ cssClasses }) {
    return (
      <svg
        className={cssClasses.submitIcon}
        width="10"
        height="10"
        viewBox="0 0 40 40"
        aria-hidden="true"
      >
        <path d="M26.804 29.01c-2.832 2.34-6.465 3.746-10.426 3.746C7.333 32.756 0 25.424 0 16.378 0 7.333 7.333 0 16.378 0c9.046 0 16.378 7.333 16.378 16.378 0 3.96-1.406 7.594-3.746 10.426l10.534 10.534c.607.607.61 1.59-.004 2.202-.61.61-1.597.61-2.202.004L26.804 29.01zm-10.426.627c7.323 0 13.26-5.936 13.26-13.26 0-7.32-5.937-13.257-13.26-13.257C9.056 3.12 3.12 9.056 3.12 16.378c0 7.323 5.936 13.26 13.258 13.26z" />
      </svg>
    );
  },
  loadingIndicator({ cssClasses }) {
    /* eslint-disable react/no-unknown-property */
    // Preact supports kebab case attributes, and using camel case would
    // require using `preact/compat`.
    return (
      <svg
        aria-label="Results are loading"
        className={cssClasses.loadingIcon}
        width="16"
        height="16"
        viewBox="0 0 38 38"
        stroke="#444"
        aria-hidden="true"
      >
        <g fill="none" fill-rule="evenodd">
          <g transform="translate(1 1)" stroke-width="2">
            <circle stroke-opacity=".5" cx="18" cy="18" r="18" />
            <path d="M36 18c0-9.94-8.06-18-18-18">
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 18 18"
                to="360 18 18"
                dur="1s"
                repeatCount="indefinite"
              />
            </path>
          </g>
        </g>
      </svg>
    );
    /* eslint-enable react/no-unknown-property */
  },
};

/**
 * The autocomplete widget provides an input box that suggests results from multiple indices.
 **/
export function EXPERIMENTAL_autocomplete({
  container,
  indices = [],
  cssClasses: userCssClasses = {},
  templates: userTemplates = {},
}: AutocompleteWidgetParams) {
  if (!container) {
    throw new Error(withUsage('The `container` option is required.'));
  }
  const containerNode = getContainerNode(container);

  const cssClasses = {
    root: cx(suit(), userCssClasses.root),
    form: cx(suit({ descendantName: 'form' }), userCssClasses.form),
    input: cx(suit({ descendantName: 'input' }), userCssClasses.input),
    submit: cx(suit({ descendantName: 'submit' }), userCssClasses.submit),
    submitIcon: cx(
      suit({ descendantName: 'submitIcon' }),
      userCssClasses.submitIcon
    ),
    reset: cx(suit({ descendantName: 'reset' }), userCssClasses.reset),
    resetIcon: cx(
      suit({ descendantName: 'resetIcon' }),
      userCssClasses.resetIcon
    ),
    loadingIndicator: cx(
      suit({ descendantName: 'loadingIndicator' }),
      userCssClasses.loadingIndicator
    ),
    loadingIcon: cx(
      suit({ descendantName: 'loadingIcon' }),
      userCssClasses.loadingIcon
    ),
    panel: cx(suit({ descendantName: 'panel' }), userCssClasses.panel),
  };
  const templates = {
    ...defaultTemplates,
    ...userTemplates,
  };

  const autocompleteWidget = connectAutocomplete(function renderAutocomplete({
    indices: results,
    currentRefinement,
    refine,
  }) {
    // Index widget that autocomplete() is mounted into. Includes the search box.
    const globalParent = autocompleteWidget.parent!.parent!;

    const query =
      typeof currentRefinement === 'undefined'
        ? // There is no ui state for this autocomplete, means that we either
          // have just initialized the Autocomplete, or submitted a query.
          // In both cases, we want to use the UI state from the parent.
          globalParent.getWidgetUiState<UiState>({})[globalParent.getIndexId()]
            .query
        : currentRefinement;

    render(
      <div className="ais-Autocomplete">
        <SearchBox
          query={query}
          refine={refine}
          onSubmit={(event) => {
            event.preventDefault();
            globalParent.setIndexUiState((s) => ({
              ...s,
              query,
            }));
          }}
          onFocus={() => {
            refine(query || '');
          }}
          cssClasses={cssClasses}
          templates={templates as SearchBoxComponentTemplates}
        />
        <div
          className={cssClasses.panel}
          hidden={results.every(({ hits }) => hits.length === 0)}
        >
          <ol>
            {results.map(({ indexId, hits = [] }, i) =>
              hits.length ? (
                <Fragment key={indexId}>
                  {hits.map((hit) => (
                    <li key={hit.objectID}>
                      <TemplateComponent
                        templates={indices[i].templates}
                        templateKey="item"
                        data={{ item: hit }}
                        rootTagName="div"
                        rootProps={{
                          onClick: (e: MouseEvent) => {
                            e.preventDefault();
                            if (indices[i].getQuery) {
                              globalParent.setIndexUiState((s) => ({
                                ...s,
                                query: indices[i].getQuery!(hit),
                              }));
                            }
                          },
                        }}
                      />
                    </li>
                  ))}
                </Fragment>
              ) : null
            )}
          </ol>
        </div>
      </div>,
      containerNode
    );
  })({});

  return [
    connectSearchBox(() => null)({}),
    index({ EXPERIMENTAL_isolated: true }).addWidgets([
      ...indices.map(({ indexName, indexId, searchParameters = {} }) =>
        index({ indexName, indexId }).addWidgets([configure(searchParameters)])
      ),
      autocompleteWidget,
    ]),
  ];
}

export type AutocompleteWidget = typeof EXPERIMENTAL_autocomplete;
