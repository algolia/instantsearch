/* eslint-disable no-console */
/** @jsx h */
import { h, render } from 'preact';

import TemplateComponent from '../../components/Template/Template';
import connectBetterAutocomplete from '../../connectors/better-autocomplete/connectBetterAutocomplete';
import { prepareTemplateProps } from '../../lib/templating';
import { getContainerNode } from '../../lib/utils';

import type {
  BetterAutocompleteConnectorParams,
  BetterAutocompleteRenderState,
  BetterAutocompleteWidgetDescription,
} from '../../connectors/better-autocomplete/connectBetterAutocomplete';
import type { PreparedTemplateProps } from '../../lib/templating';
import type { Renderer, Template, WidgetFactory } from '../../types';

export type BetterAutocompleteTemplates = Partial<{
  item: Template<{
    item: unknown;
  }>;
}>;

export type BetterAutocompleteWidgetParams = {
  container: string | HTMLElement;
  templates?: BetterAutocompleteTemplates;
};

const defaultTemplates: BetterAutocompleteTemplates = {
  item({ item }) {
    return (
      <div style={{ whiteSpace: 'nowrap' }}>
        {JSON.stringify(item, null, 2)}
      </div>
    );
  },
};

const renderer =
  ({
    containerNode,
    renderState,
    templates,
  }: {
    containerNode: HTMLElement;
    renderState: {
      templateProps?: PreparedTemplateProps<BetterAutocompleteTemplates>;
    };
    templates: BetterAutocompleteTemplates;
  }): Renderer<
    BetterAutocompleteRenderState,
    Partial<BetterAutocompleteWidgetParams>
  > =>
  (
    { autocomplete, state, collections, instantSearchInstance },
    isFirstRendering
  ) => {
    console.log('[widget] render', { collections });

    if (isFirstRendering) {
      renderState.templateProps = prepareTemplateProps({
        defaultTemplates,
        templatesConfig: instantSearchInstance.templatesConfig,
        templates,
      });
    }

    const { onChange, ...inputProps } = autocomplete.getInputProps({});

    render(
      <div
        className="ais-BetterAutocomplete"
        {...autocomplete.getRootProps({})}
      >
        <input
          className="ais-SearchBox-input"
          onInput={onChange}
          onChange={onChange}
          {...inputProps}
        />
        <div {...autocomplete.getPanelProps()}>
          {state?.isOpen &&
            collections.map((collection, index) => {
              const { source, items } = collection;

              return (
                <div key={`source-${index}`}>
                  {items.length > 0 && (
                    <ul {...autocomplete.getListProps()}>
                      {items.map((item) => (
                        <TemplateComponent
                          {...renderState.templateProps}
                          templateKey="item"
                          rootTagName="li"
                          rootProps={autocomplete.getItemProps({
                            item,
                            source,
                          })}
                          key={item.__autocomplete_id}
                          data={item}
                        />
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
        </div>
      </div>,
      containerNode
    );
  };

export type BetterAutocompleteWidget = WidgetFactory<
  BetterAutocompleteWidgetDescription & {
    $$widgetType: 'ais.betterAutocomplete';
  },
  BetterAutocompleteConnectorParams,
  BetterAutocompleteWidgetParams
>;

const betterAutocomplete: BetterAutocompleteWidget =
  function betterAutocomplete(widgetParams) {
    const {
      container,
      templates = {},
      ...connectorWidgetParams
    } = widgetParams || {};

    if (!container) {
      throw new Error('The container option is required.');
    }

    const containerNode = getContainerNode(container);

    const specializedRenderer = renderer({
      containerNode,
      templates,
      renderState: {},
    });

    const makeWidget = connectBetterAutocomplete(specializedRenderer, () =>
      render(null, containerNode)
    );

    return {
      ...makeWidget(connectorWidgetParams),
      $$widgetType: 'ais.betterAutocomplete',
    };
  };

export default betterAutocomplete;
