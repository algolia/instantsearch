import type {
  Renderer,
  Connector,
  WidgetFactory,
} from 'instantsearch.js/es';

/*
 * Parameters send only to the widget creator function
 * These parameters will be used by the widget creator to create the widget renderer and factory
 */
export type WidgetParams = {
  container: Element | string;
  // TODO: add the widget params
};

/*
 * Parameters send to the widget creator function
 * These parameters will be used by the widget creator to manage the widget logic
 */
export type ConnectorParams = {
  // TODO: add the widget params
};

export type RenderState = {
  // TODO: add the render state params
};

type WidgetDescription = {
  $$type: '';
  renderState: RenderState;
  indexRenderState: {
    : {
      // TODO: add the return type of getRenderState
    };
  };
  indexUiState: {
    : {
      // TODO: add the return type of getWidgetUiState
    }
  };
};

/*
 * Connector type, constructed from the Renderer and Connector parameters
 */
export type Connector = Connector<
  WidgetDescription,
  ConnectorParams
>;

/*
 * Renderer type, constructed from the Renderer and Connector parameters
 */
export type RendererCreator = (
  widgetParams: WidgetParams
) => {
  render: Renderer<
    WidgetDescription['renderState'],
    ConnectorParams
  >;
  dispose: () => void;
};

/*
 * Widget type, constructed from the Renderer, Connector and Widget parameters
 */
export type WidgetCreator = WidgetFactory<
  WidgetDescription & {
    $$widgetType: '';
  },
  ConnectorParams,
  WidgetParams
>;
