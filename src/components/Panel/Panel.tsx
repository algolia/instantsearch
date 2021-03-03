/** @jsx h */

import { h } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import cx from 'classnames';
import Template from '../Template/Template';
import { PanelCSSClasses, PanelTemplates } from '../../widgets/panel/panel';
import { RenderOptions, UnknownWidgetFactory } from '../../types';

type PanelComponentCSSClasses = Required<
  Omit<
    {
      [TKey in keyof PanelCSSClasses]: string;
    },
    // `collapseIcon` is only used in the default templates of the widget
    'collapseIcon'
  >
>;

export type PanelProps<TWidget extends UnknownWidgetFactory> = {
  hidden: boolean;
  collapsible: boolean;
  isCollapsed: boolean;
  data: RenderOptions;
  cssClasses: PanelComponentCSSClasses;
  templates: Required<PanelTemplates<TWidget>>;
  bodyElement: HTMLElement;
};

function Panel<TWidget extends UnknownWidgetFactory>(
  props: PanelProps<TWidget>
) {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(props.isCollapsed);
  const [isControlled, setIsControlled] = useState<boolean>(false);
  const bodyRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!bodyRef.current) {
      return undefined;
    }

    bodyRef.current.appendChild(props.bodyElement);

    return () => {
      bodyRef!.current!.removeChild(props.bodyElement);
    };
  }, [bodyRef, props.bodyElement]);

  if (!isControlled && props.isCollapsed !== isCollapsed) {
    setIsCollapsed(props.isCollapsed);
  }

  return (
    <div
      className={cx(props.cssClasses.root, {
        [props.cssClasses.noRefinementRoot]: props.hidden,
        [props.cssClasses.collapsibleRoot]: props.collapsible,
        [props.cssClasses.collapsedRoot]: isCollapsed,
      })}
      hidden={props.hidden}
    >
      {props.templates.header && (
        <div className={props.cssClasses.header}>
          <Template
            templates={props.templates}
            templateKey="header"
            rootTagName="span"
            data={props.data}
          />

          {props.collapsible && (
            <button
              className={props.cssClasses.collapseButton}
              aria-expanded={!isCollapsed}
              onClick={event => {
                event.preventDefault();

                setIsControlled(true);
                setIsCollapsed(prevIsCollapsed => !prevIsCollapsed);
              }}
            >
              <Template
                templates={props.templates}
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
          templates={props.templates}
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
