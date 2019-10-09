/** @jsx h */

import { createElement } from 'preact';
import { memo } from 'preact/compat';
import { renderTemplate, isEqual } from '../../lib/utils';
import { Template as WidgetTemplate } from '../../types';

export type TemplateProps<TTemplateData> = {
  template: WidgetTemplate<TTemplateData>;
  templateHelpers?: any;
  rootTagName?: string;
  rootProps?: object;
  data?: TTemplateData;
};

function Template<TTemplateData = void>({
  template,
  templateHelpers,
  data,
  rootProps,
  rootTagName = 'div',
}: TemplateProps<TTemplateData>) {
  const content: string = renderTemplate({
    template,
    data,
    helpers: templateHelpers,
  });

  return createElement(rootTagName, {
    ...rootProps,
    dangerouslySetInnerHTML: { __html: content },
  });
}

function areEqual<TTemplateData>(
  prevProps: TemplateProps<TTemplateData>,
  nextProps: TemplateProps<TTemplateData>
) {
  return (
    isEqual(prevProps.data, nextProps.data) &&
    isEqual(prevProps.rootProps, nextProps.rootProps)
  );
}

export default memo(Template, areEqual);
