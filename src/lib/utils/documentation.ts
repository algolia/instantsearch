type WidgetParam = {
  name: string;
  connector?: boolean;
};

export const createDocumentationLink = ({
  name,
  connector = false,
}: WidgetParam) => {
  return [
    'https://www.algolia.com/doc/api-reference/widgets/',
    name,
    '/js/',
    connector ? '#connector' : '',
  ].join('');
};

export const createDocumentationMessageGenerator = (
  ...widgets: WidgetParam[]
) => {
  const links = widgets
    .map(widget => createDocumentationLink(widget))
    .join(', ');

  return (message: string) => {
    return [message, `See documentation: ${links}`]
      .filter(Boolean)
      .join('\n\n');
  };
};
