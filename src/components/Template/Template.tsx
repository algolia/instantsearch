/** @jsx h */

import { createElement } from 'preact';
import { memo } from 'preact/compat';
import { renderTemplate, isEqual } from '../../lib/utils';
import { Template as WidgetTemplate } from '../../types';
import { HoganRenderer } from '../../lib/createHelpers';

export type TemplateProps<TTemplateData = void> = {
  template: WidgetTemplate<any>;
  templateHelpers?: {
    [helper: string]: (value: unknown, render: HoganRenderer) => string;
  };
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
