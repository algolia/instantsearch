/** @jsx h */

import { cx } from 'instantsearch-ui-components';
import { h } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';

import Template from '../Template/Template';

import type { ComponentCSSClasses, UnknownWidgetFactory } from '../../types';
import type {
  PanelCSSClasses,
  PanelSharedOptions,
  PanelTemplates,
} from '../../widgets/panel/panel';

export type PanelComponentCSSClasses = ComponentCSSClasses<PanelCSSClasses>;

export type PanelComponentTemplates<TWidget extends UnknownWidgetFactory> =
  PanelTemplates<TWidget>;

export type PanelProps<TWidget extends UnknownWidgetFactory> = {
  hidden: boolean;
  collapsible: boolean;
  isCollapsed: boolean;
  data: PanelSharedOptions<TWidget>;
  cssClasses: PanelComponentCSSClasses;
  templates: PanelComponentTemplates<TWidget>;
  bodyElement: HTMLElement;
};

function Panel<TWidget extends UnknownWidgetFactory>(
  props: PanelProps<TWidget>
) {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(props.isCollapsed);
  const [isControlled, setIsControlled] = useState<boolean>(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  const defaultTemplates: PanelComponentTemplates<TWidget> = {
    collapseButtonText: ({ collapsed: isCollapsed }) =>
      `<svg
          aria-hidden="true"
          focusable="false"
          class="${props.cssClasses.collapseIcon}"
          style="width: 1em; height: 1em;"
          viewBox="0 0 500 500"
        >
        <path d="${
          isCollapsed ? 'M100 250l300-150v300z' : 'M250 400l150-300H100z'
        }" fill="currentColor" />
        </svg>`,
  };
  const templates = { ...defaultTemplates, ...props.templates };

  useEffect(() => {
    const node = bodyRef.current;
    if (!node) {
      return undefined;
    }

    node.appendChild(props.bodyElement);

    return () => {
      node.removeChild(props.bodyElement);
    };
  }, [bodyRef, props.bodyElement]);

  if (!isControlled && props.isCollapsed !== isCollapsed) {
    setIsCollapsed(props.isCollapsed);
  }

  return (
    <div
      className={cx(
        props.cssClasses.root,
        props.hidden && props.cssClasses.noRefinementRoot,
        props.collapsible && props.cssClasses.collapsibleRoot,
        isCollapsed && props.cssClasses.collapsedRoot
      )}
      hidden={props.hidden}
    >
      {props.templates.header && (
        <div className={props.cssClasses.header}>
          <Template
            templates={templates}
            templateKey="header"
            rootTagName="span"
            data={props.data}
          />

          {props.collapsible && (
            <button
              className={props.cssClasses.collapseButton}
              aria-expanded={!isCollapsed}
              aria-label={
                props.templates.collapseButtonText !== undefined
                  ? undefined
                  : isCollapsed
                    ? 'Expand panel'
                    : 'Collapse panel'
              }
              onClick={(event) => {
                event.preventDefault();

                setIsControlled(true);
                setIsCollapsed((prevIsCollapsed) => !prevIsCollapsed);
              }}
            >
              <Template
                templates={templates}
                templateKey="collapseButtonText"
                rootTagName="span"
                data={{ collapsed: isCollapsed }}
              />
            </button>
          )}
        </div>
      )}

      <div className={props.cssClasses.body} ref={bodyRef} />

      {props.templates.footer && (
        <Template
          templates={templates}
          templateKey="footer"
          rootProps={{
            className: props.cssClasses.footer,
          }}
          data={props.data}
        />
      )}
    </div>
  );
}

export default Panel;
