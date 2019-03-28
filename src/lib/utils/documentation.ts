type WidgetParam = {
  name: string;
  connector?: boolean;
};

export function createDocumentationLink({
  name,
  connector = false,
}: WidgetParam) {
  return [
    'https://www.algolia.com/doc/api-reference/widgets/',
    name,
    '/js/',
    connector ? '#connector' : '',
  ].join('');
}

export function createDocumentationMessageGenerator(...widgets: WidgetParam[]) {
  const links = widgets
    .map(widget => createDocumentationLink(widget))
    .join(', ');

  return function(message: string) {
    return [message, `See documentation: ${links}`]
      .filter(Boolean)
      .join('\n\n');
  };
}
