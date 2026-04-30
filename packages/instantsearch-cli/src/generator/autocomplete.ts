import { jsString } from '../utils/codegen';

type AutocompleteOptions = {
  indexName: string;
  hitsSchema?: { title: string; image?: string; description?: string };
  typescript: boolean;
};

export function generateAutocomplete(options: AutocompleteOptions): string {
  const { indexName, hitsSchema, typescript } = options;
  const title = hitsSchema?.title ?? 'objectID';
  const image = hitsSchema?.image;

  const typeAnnotation = typescript
    ? `
type HitProps = {
  item: Record<string, string>;
};
`
    : '';

  const itemParamAnnotation = typescript ? ': HitProps' : '';

  const imageElement = image
    ? `<img src={item[${jsString(image)}]} alt={item[${jsString(title)}]} />\n      `
    : '';

  return `import { EXPERIMENTAL_Autocomplete } from 'react-instantsearch';
${typeAnnotation}
function HitItem({ item }${itemParamAnnotation}) {
  return (
    <a href="#">
      ${imageElement}<span>{item[${jsString(title)}]}</span>
    </a>
  );
}

export function Autocomplete() {
  return (
    <EXPERIMENTAL_Autocomplete
      placeholder="Search"
      indices={[
        {
          indexName: ${jsString(indexName)},
          itemComponent: HitItem,
        },
      ]}
    />
  );
}
`;
}
