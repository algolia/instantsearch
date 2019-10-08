/** @jsx h */

import { createElement } from 'preact';
import { memo } from 'preact/compat';
import { renderTemplate, isEqual } from '../../lib/utils';
import { Template as WidgetTemplate } from '../../types';

export type TemplateProps = {
  templateKey: string;
  templates: { [templateKey: string]: WidgetTemplate<any> };
  rootTagName?: string;
  rootProps?: object;
  data?: any;
};

function Template({
  data = {},
  templateKey,
  rootProps,
  rootTagName = 'div',
  templates,
}: TemplateProps) {
  const content: string = renderTemplate({
    templates,
    templateKey,
    data,
    helpers: {},
  });

  return createElement(rootTagName, {
    ...rootProps,
    dangerouslySetInnerHTML: { __html: content },
  });
}

function areEqual(prevProps: TemplateProps, nextProps: TemplateProps) {
  return (
    prevProps.templateKey === nextProps.templateKey &&
    isEqual(prevProps.data, nextProps.data) &&
    isEqual(prevProps.rootProps, nextProps.rootProps)
  );
}

export default memo(Template, areEqual);
