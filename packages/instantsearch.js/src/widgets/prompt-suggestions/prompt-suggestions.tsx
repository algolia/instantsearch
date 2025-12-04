/** @jsx h */

import { createPromptSuggestionsComponent } from 'instantsearch-ui-components';
import { h, render } from 'preact';

import TemplateComponent from '../../components/Template/Template';
import connectChat from '../../connectors/chat/connectChat';
import { prepareTemplateProps } from '../../lib/templating';
import {
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';

import type {
  ChatRenderState,
  ChatConnectorParams,
  ChatWidgetDescription as PromptSuggestionsWidgetDescription,
} from '../../connectors/chat/connectChat';
import type { PreparedTemplateProps } from '../../lib/templating';
import type {
  WidgetFactory,
  Renderer,
  TemplateWithBindEvent,
  Template,
} from '../../types';
import type {
  ClientSideToolComponentProps,
  PromptSuggestionsClassNames,
  PromptSuggestionsTranslations,
  UserClientSideTool,
} from 'instantsearch-ui-components';

const withUsage = createDocumentationMessageGenerator({
  name: 'prompt-suggestions',
});

const PromptSuggestions = createPromptSuggestionsComponent({
  createElement: h,
});

const createRenderer = ({
  cssClasses,
  renderState,
  containerNode,
  templates,
}: {
  cssClasses: PromptSuggestionsCSSClasses;
  containerNode: HTMLElement;
  renderState: {
    templateProps?: PreparedTemplateProps<PromptSuggestionsTemplates>;
  };
  templates: PromptSuggestionsTemplates;
}): Renderer<ChatRenderState, Partial<PromptSuggestionsWidgetParams>> => {
  const state = createLocalState();

  return (props, isFirstRendering) => {
    const { instantSearchInstance, suggestions, status, error } = props;

    const onSuggestionClick = (suggestion: string) => {
      instantSearchInstance.renderState[
        instantSearchInstance.mainIndex.getIndexId()
      ].chat?.setOpen(true);
      instantSearchInstance.renderState[
        instantSearchInstance.mainIndex.getIndexId()
      ].chat?.sendMessage({ text: suggestion });
    };

    if (__DEV__ && error) {
      throw error;
    }

    if (isFirstRendering) {
      renderState.templateProps = prepareTemplateProps({
        defaultTemplates: {} as unknown as PromptSuggestionsTemplates,
        templatesConfig: instantSearchInstance.templatesConfig,
        templates,
      });
      return;
    }

    const loadingComponent = templates.loading
      ? () => (
          <TemplateComponent
            {...renderState.templateProps}
            templateKey="loading"
            rootTagName="fragment"
          />
        )
      : undefined;

    const translations: PromptSuggestionsTranslations = {
      suggestionsHeaderText: templates.suggestionsHeaderText,
    };

    state.subscribe(rerender);

    function rerender() {
      render(
        <PromptSuggestions
          classNames={cssClasses}
          status={status}
          suggestions={suggestions}
          onSuggestionClick={onSuggestionClick}
          loadingComponent={loadingComponent}
          translations={translations}
        />,
        containerNode
      );
    }

    rerender();
  };
};

export type UserClientSideToolTemplates = Partial<{
  layout: TemplateWithBindEvent<ClientSideToolComponentProps>;
}>;

type UserClientSideToolWithTemplate = Omit<
  UserClientSideTool,
  'layoutComponent'
> & {
  templates: UserClientSideToolTemplates;
};
type UserClientSideToolsWithTemplate = Record<
  string,
  UserClientSideToolWithTemplate
>;

export type Tool = UserClientSideToolWithTemplate;
export type Tools = UserClientSideToolsWithTemplate;

export type PromptSuggestionsCSSClasses = Partial<PromptSuggestionsClassNames>;

export type PromptSuggestionsTemplates = Partial<{
  /**
   * Template for the loading state.
   */
  loading: Template;
  /**
   * Header text for the suggestions list.
   */
  suggestionsHeaderText: string;
}>;

type PromptSuggestionsWidgetParams = {
  /**
   * CSS Selector or HTMLElement to insert the widget.
   */
  container: string | HTMLElement;

  /**
   * Templates to use for the widget.
   */
  templates?: PromptSuggestionsTemplates;

  /**
   * CSS classes to add.
   */
  cssClasses?: PromptSuggestionsCSSClasses;
};

export type PromptSuggestionsWidget = WidgetFactory<
  PromptSuggestionsWidgetDescription & {
    $$widgetType: 'ais.prompt-suggestions';
  },
  ChatConnectorParams,
  PromptSuggestionsWidgetParams
>;

export default (function promptSuggestions(
  widgetParams: PromptSuggestionsWidgetParams & ChatConnectorParams
) {
  const {
    container,
    templates = {},
    cssClasses = {},
    resume = false,
    ...options
  } = widgetParams || {};

  if (!container) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  const containerNode = getContainerNode(container);

  const specializedRenderer = createRenderer({
    containerNode,
    cssClasses,
    renderState: {},
    templates,
  });

  const makeWidget = connectChat(specializedRenderer, () =>
    render(null, containerNode)
  );

  return {
    ...makeWidget({
      resume,
      ...options,
    }),
    $$widgetType: 'ais.prompt-suggestions',
  };
} satisfies PromptSuggestionsWidget);

function createLocalState() {
  const state: unknown[] = [];
  const subscriptions = new Set<() => void>();
  let cursor = 0;

  function use<T>(initialValue: T): [T, (value: T) => T] {
    const index = cursor++;
    if (state[index] === undefined) {
      state[index] = initialValue;
    }

    return [
      state[index] as T,
      (value: T) => {
        const prev = state[index] as T;
        if (prev === value) {
          return prev;
        }

        state[index] = value;
        subscriptions.forEach((fn) => fn());
        return value;
      },
    ];
  }

  return {
    init() {
      cursor = 0;
    },
    subscribe(fn: () => void): () => void {
      subscriptions.add(fn);

      return () => subscriptions.delete(fn);
    },
    use,
  };
}
