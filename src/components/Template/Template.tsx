/** @jsx h */

import { createElement } from 'preact';
import { memo } from 'preact/compat';
import { renderTemplate, isEqual } from '../../lib/utils';
import { Template as WidgetTemplate } from '../../types';

export type TemplateProps<TData> = {
  templateKey: string;
  templates: { [templateKey: string]: WidgetTemplate<any> };
  rootTagName?: string;
  rootProps?: object;
  data?: TData;
};

function Template<TData = any>({
  templateKey,
  templates,
  data,
  rootProps,
  rootTagName = 'div',
}: TemplateProps<TData>) {
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

function areEqual<TData>(
  prevProps: TemplateProps<TData>,
  nextProps: TemplateProps<TData>
) {
  return (
    prevProps.templateKey === nextProps.templateKey &&
    isEqual(prevProps.data, nextProps.data) &&
    isEqual(prevProps.rootProps, nextProps.rootProps)
  );
}

export default memo(Template, areEqual);
