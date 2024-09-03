import { cx } from 'instantsearch-ui-components';
import { createRenderArgs } from 'instantsearch.js/es/lib/utils';
import React from 'react';

import type { Widget } from 'instantsearch.js';

type RenderState<TWidget extends Widget> =
  TWidget['getWidgetRenderState'] extends (
    renderOptions: any
  ) => infer TRenderState
    ? TRenderState extends Record<string, unknown>
      ? TRenderState
      : never
    : Record<string, unknown>;

export type PanelProps<TWidget extends Widget = Widget> = {
  headerComponent: React.JSXElementConstructor<RenderState<TWidget>>;
  footerComponent: React.JSXElementConstructor<RenderState<TWidget>>;
  children: React.ReactNode;
  hidden?: (options: RenderState<TWidget>) => boolean;
  collapsed?: (options: RenderState<TWidget>) => boolean;
};

const PanelContext = React.createContext<{
  widget: Widget | null;
}>({
  widget: null,
});

function usePanel({
  hidden,
  collapsed,
}: Pick<PanelProps, 'hidden' | 'collapsed'>) {
  const { widget } = React.useContext(PanelContext);

  const renderState = widget?.getWidgetRenderState
    ? widget.getWidgetRenderState(createRenderArgs(search, parent, widget))
    : null;

  return {
    collapsible: Boolean(collapsed),
    isCollapsed: collapsed && renderState ? collapsed(renderState) : false,
    isHidden: hidden && renderState ? hidden(renderState) : false,
    renderState,
  };
}

export function Panel({
  headerComponent: HeaderComponent,
  footerComponent: FooterComponent,
  children,
  hidden,
  collapsed,
}: PanelProps) {
  const { collapsible, isCollapsed, isHidden, renderState } = usePanel({
    hidden,
    collapsed,
  });

  return (
    <div
      className={cx(
        'ais-Panel',
        collapsible && 'ais-Panel--collapsible',
        isCollapsed && 'ais-Panel--collapsed'
      )}
      hidden={isHidden}
    >
      <div className="ais-Panel-header">
        <HeaderComponent {...renderState} />
        {collapsible && (
          <button className="ais-Panel-collapseButton" aria-expanded="true">
            <svg
              className="ais-Panel-collapseIcon"
              style={{ width: '1em', height: '1em' }}
              viewBox="0 0 500 500"
            >
              {isCollapsed ? (
                <path d="M250 400l150-300H100z" fill="currentColor" />
              ) : (
                <path d="M100 250l300-150v300z" fill="currentColor" />
              )}
            </svg>
          </button>
        )}
      </div>
      <div className="ais-Panel-body">{children}</div>
      <div className="ais-Panel-footer">
        <FooterComponent {...renderState} />
      </div>
    </div>
  );
}
