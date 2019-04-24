type WidgetParam = {
  name: string;
  connector?: boolean;
};

export const createDocumentationLink = ({
  name,
  connector = false,
}: WidgetParam): string => {
  return [
    'https://www.algolia.com/doc/api-reference/widgets/',
    name,
    '/js/',
    connector ? '#connector' : '',
  ].join('');
};

type DocumentationMessageGenerator = (message?: string) => string;

export const createDocumentationMessageGenerator = (
  ...widgets: WidgetParam[]
): DocumentationMessageGenerator => {
  const links = widgets
    .map(widget => createDocumentationLink(widget))
    .join(', ');

  return (message?: string) =>
    [message, `See documentation: ${links}`].filter(Boolean).join('\n\n');
};
