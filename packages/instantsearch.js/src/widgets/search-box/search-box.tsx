/** @jsx h */

import { connectSearchBox } from 'instantsearch-core';
import { isChatBusy, openChat } from 'instantsearch-core/internal';
import { createDocumentationMessageGenerator } from 'instantsearch-core/internal';
import { suitComponent as component } from 'instantsearch-core/internal';
import { createSearchBoxComponent, cx } from 'instantsearch-ui-components';
import { createRef, Fragment, h, render } from 'preact';

import TemplateComponent from '../../components/Template/Template';
import { renderTemplate } from '../../lib/templating';
import { getContainerNode } from '../../lib/utils';

import type { ComponentCSSClasses, Template, Templates } from '../../types';
import type {
  SearchBoxConnectorParams,
  SearchBoxRenderState,
  SearchBoxWidgetDescription,
} from 'instantsearch-core';
import type { WidgetFactory, RendererOptions } from 'instantsearch-core';
import type { ChatRenderState } from 'instantsearch-core';
import type { SearchBoxProps as SearchBoxUiComponentProps } from 'instantsearch-ui-components';

const withUsage = createDocumentationMessageGenerator({ name: 'search-box' });
const suit = component('SearchBox');
const aiModeSuit = component('AiModeButton');

const SearchBoxUiComponent = createSearchBoxComponent({
  createElement: h,
  Fragment,
});

export type SearchBoxComponentCSSClasses =
  ComponentCSSClasses<SearchBoxCSSClasses>;

export type SearchBoxTemplates = Partial<{
  /**
   * Template used for displaying the submit button.
   */
  submit: Template<{ cssClasses: SearchBoxComponentCSSClasses }>;
  /**
   * Template used for displaying the reset button.
   */
  reset: Template<{ cssClasses: SearchBoxComponentCSSClasses }>;
  /**
   * Template used for displaying the loading indicator.
   */
  loadingIndicator: Template<{ cssClasses: SearchBoxComponentCSSClasses }>;
  /**
   * Template used for displaying the AI mode button content (icon and label).
   */
  aiMode: Template<{ cssClasses: SearchBoxComponentCSSClasses }>;
}>;

export type SearchBoxCSSClasses = Partial<{
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
   * CSS classes added to the loading indicator element.
   */
  loadingIndicator: string | string[];
  /**
   * CSS classes added to the loading indicator icon.
   */
  loadingIcon: string | string[];
  /**
   * CSS classes added to the AI mode button.
   */
  aiModeButton: string | string[];
  /**
   * CSS classes added to the AI mode button icon.
   */
  aiModeIcon: string | string[];
  /**
   * CSS classes added to the AI mode button label.
   */
  aiModeLabel: string | string[];
}>;

export type SearchBoxWidgetParams = {
  /**
   * CSS Selector or HTMLElement to insert the widget
   */
  container: string | HTMLElement;
  /**
   * The placeholder of the input
   */
  placeholder?: string;
  /**
   * Whether the input should be autofocused
   */
  autofocus?: boolean;
  /**
   * If set, trigger the search
   * once `<Enter>` is pressed only.
   */
  searchAsYouType?: boolean;
  /**
   * Whether to update the search state in the middle of a
   * composition session.
   * @default false
   */
  ignoreCompositionEvents?: boolean;
  /**
   * Whether to show the reset button
   */
  showReset?: boolean;
  /**
   * Whether to show the submit button
   */
  showSubmit?: boolean;
  /**
   * Whether to show the loading indicator (replaces the submit if
   * the search is stalled)
   */
  showLoadingIndicator?: boolean;
  /**
   * CSS classes to add
   */
  cssClasses?: SearchBoxCSSClasses;
  /**
   * The accessible name and tooltip (`title`) of the submit button.
   * @default 'Submit the search query'
   */
  submitTitle?: string;
  /**
   * The accessible name and tooltip (`title`) of the reset button.
   * @default 'Clear the search query'
   */
  resetTitle?: string;

  /**
   * Templates used for customizing the rendering of the searchbox
   */
  templates?: SearchBoxTemplates;
  /**
   * A function that is called every time a new search is done. You
   * will get the query as the first parameter and a search (query) function to call as the second parameter.
   * This `queryHook` can be used to debounce the number of searches done from the search box.
   */
  queryHook?: (query: string, hook: (value: string) => void) => void;
  /**
   * When true, renders an AI mode button inside the search box
   * that opens the Chat widget and sends the current query.
   * Requires a Chat widget on the same index.
   */
  aiMode?: boolean;
};

type SearchBoxIconTemplates = Pick<
  SearchBoxTemplates,
  'submit' | 'reset' | 'loadingIndicator'
>;

/**
 * Returns whether a template renders `null`, which removes its element (like
 * the `Template` component does when its content is `null`).
 */
function rendersNull(
  templates: SearchBoxTemplates,
  templateKey: keyof SearchBoxTemplates,
  cssClasses: Partial<SearchBoxComponentCSSClasses>
) {
  return (
    templates[templateKey] !== undefined &&
    renderTemplate({
      templates: templates as Templates,
      templateKey,
      data: { cssClasses },
    }) === null
  );
}

/**
 * Maps the search box templates onto the shared component's props. A missing
 * template keeps the shared default icon, and a template rendering `null`
 * hides its element.
 */
export function getSearchBoxTemplateProps(
  templates: SearchBoxIconTemplates,
  cssClasses: Partial<SearchBoxComponentCSSClasses>,
  {
    showSubmit = true,
    showReset = true,
    showLoadingIndicator = true,
  }: {
    showSubmit?: boolean;
    showReset?: boolean;
    showLoadingIndicator?: boolean;
  } = {}
) {
  function createIconComponent(templateKey: keyof SearchBoxTemplates) {
    if (!(templates as SearchBoxTemplates)[templateKey]) {
      return undefined;
    }

    return function IconTemplate() {
      return (
        <TemplateComponent
          templateKey={templateKey}
          rootTagName="fragment"
          templates={templates}
          data={{ cssClasses }}
        />
      );
    };
  }

  return {
    submitIconComponent: createIconComponent('submit'),
    resetIconComponent: createIconComponent('reset'),
    loadingIconComponent: createIconComponent('loadingIndicator'),
    showSubmit: showSubmit && !rendersNull(templates, 'submit', cssClasses),
    showReset: showReset && !rendersNull(templates, 'reset', cssClasses),
    showLoadingIndicator:
      showLoadingIndicator &&
      !rendersNull(templates, 'loadingIndicator', cssClasses),
  };
}

const renderer = ({
  containerNode,
  cssClasses,
  userCssClasses,
  placeholder,
  templates,
  autofocus,
  searchAsYouType,
  ignoreCompositionEvents,
  showReset,
  showSubmit,
  showLoadingIndicator,
  submitTitle,
  resetTitle,
  aiMode,
}: {
  containerNode: HTMLElement;
  cssClasses: SearchBoxComponentCSSClasses;
  userCssClasses: SearchBoxCSSClasses;
  placeholder: string;
  templates: SearchBoxTemplates;
  autofocus: boolean;
  searchAsYouType: boolean;
  ignoreCompositionEvents: boolean;
  showReset: boolean;
  showSubmit: boolean;
  showLoadingIndicator: boolean;
  submitTitle: string;
  resetTitle: string;
  aiMode?: boolean;
}) => {
  const inputRef = createRef<HTMLInputElement>();
  // The value typed in the input. It's synced with the connector's query on
  // render, except while the input is focused so that a render doesn't
  // replace what the user is typing.
  // @see https://github.com/algolia/instantsearch/issues/4141
  let inputValue: string | undefined = undefined;
  let isFocused = false;
  let renderOptions: SearchBoxRenderState &
    RendererOptions<SearchBoxConnectorParams>;

  const templateProps = getSearchBoxTemplateProps(templates, cssClasses, {
    showSubmit,
    showReset,
    showLoadingIndicator,
  });
  const hasAiModeButton =
    aiMode && !rendersNull(templates, 'aiMode', cssClasses);
  const aiModeComponent = templates.aiMode
    ? function AiModeTemplate() {
        return (
          <TemplateComponent
            templateKey="aiMode"
            rootTagName="fragment"
            templates={templates}
            data={{ cssClasses }}
          />
        );
      }
    : undefined;

  const onInput = (event: Event) => {
    if (ignoreCompositionEvents && (event as KeyboardEvent).isComposing) {
      return;
    }

    inputValue = (event.target as HTMLInputElement).value;

    if (searchAsYouType) {
      renderOptions.refine(inputValue);
    }

    renderSearchBox();
  };

  const inputProps = {
    onInput,
    // Preact only binds lowercase composition events.
    // @see https://github.com/preactjs/preact/issues/1978
    oncompositionend: onInput,
    onFocus: () => {
      isFocused = true;
    },
    onBlur: () => {
      isFocused = false;
    },
  } as unknown as SearchBoxUiComponentProps['inputProps'];

  function renderSearchBox() {
    const { refine, instantSearchInstance } = renderOptions;
    const value = inputValue || '';

    const getChatRenderState = () => {
      const indexId = instantSearchInstance.mainIndex.getIndexId();
      return instantSearchInstance.renderState[indexId]?.chat as
        | Partial<ChatRenderState>
        | undefined;
    };

    render(
      <SearchBoxUiComponent
        value={value}
        placeholder={placeholder}
        autoFocus={autofocus}
        isSearchStalled={instantSearchInstance.status === 'stalled'}
        inputRef={inputRef}
        inputProps={inputProps}
        onSubmit={() => {
          if (!searchAsYouType) {
            refine(value);
          }
        }}
        onReset={() => {
          inputValue = '';
          refine('');
          renderSearchBox();
        }}
        onAiModeClick={
          hasAiModeButton
            ? () => {
                if (
                  openChat(getChatRenderState(), {
                    message: value,
                    referer: 'ai-mode',
                  })
                ) {
                  inputValue = '';
                  refine('');
                }
              }
            : undefined
        }
        aiModeButtonDisabled={
          hasAiModeButton ? isChatBusy(getChatRenderState()) : undefined
        }
        {...templateProps}
        aiModeComponent={aiModeComponent}
        classNames={userCssClasses}
        translations={{
          submitButtonTitle: submitTitle,
          resetButtonTitle: resetTitle,
        }}
      />,
      containerNode
    );
  }

  return (
    options: SearchBoxRenderState & RendererOptions<SearchBoxConnectorParams>
  ) => {
    renderOptions = options;

    if (inputValue === undefined || !isFocused) {
      inputValue = options.query;
    }

    renderSearchBox();
  };
};

/**
 * The searchbox widget is used to let the user set a text based query.
 *
 * This is usually the  main entry point to start the search in an instantsearch context. For that
 * reason is usually placed on top, and not hidden so that the user can start searching right
 * away.
 *
 */
export type SearchBoxWidget = WidgetFactory<
  SearchBoxWidgetDescription & { $$widgetType: 'ais.searchBox' },
  SearchBoxConnectorParams,
  SearchBoxWidgetParams
>;

const searchBox: SearchBoxWidget = function searchBox(widgetParams) {
  const {
    container,
    placeholder = '',
    cssClasses: userCssClasses = {},
    autofocus = false,
    searchAsYouType = true,
    ignoreCompositionEvents = false,
    showReset = true,
    showSubmit = true,
    showLoadingIndicator = true,
    submitTitle = 'Submit the search query',
    resetTitle = 'Clear the search query',
    queryHook,
    templates: userTemplates = {},
    aiMode,
  } = widgetParams || {};
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
    aiModeButton: cx(aiModeSuit(), userCssClasses.aiModeButton),
    aiModeIcon: cx(
      aiModeSuit({ descendantName: 'icon' }),
      userCssClasses.aiModeIcon
    ),
    aiModeLabel: cx(
      aiModeSuit({ descendantName: 'label' }),
      userCssClasses.aiModeLabel
    ),
  };
  const specializedRenderer = renderer({
    containerNode,
    cssClasses,
    userCssClasses,
    placeholder,
    templates: userTemplates,
    autofocus,
    searchAsYouType,
    ignoreCompositionEvents,
    showReset,
    showSubmit,
    showLoadingIndicator,
    submitTitle,
    resetTitle,
    aiMode,
  });

  const widgetFactory = connectSearchBox(specializedRenderer, () => {
    render(null, containerNode);
  });

  return {
    ...widgetFactory({ queryHook }),
    $$widgetType: 'ais.searchBox',
    ...(aiMode ? { opensChat: true as const } : {}),
  };
};

export default searchBox;
