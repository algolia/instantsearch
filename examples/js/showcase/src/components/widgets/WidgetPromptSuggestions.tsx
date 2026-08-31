import { promptSuggestions } from 'instantsearch.js/es/widgets';

import { useWidget } from '../../hooks/useWidget';

type Props = Pick<
  Parameters<typeof promptSuggestions>[0],
  'configurationId' | 'context' | 'transformHits'
> & {
  contextDescription: string;
};

const AGENT_ID = 'eedef238-5468-470d-bc37-f99fa741bd25';

function WidgetPromptSuggestions({
  configurationId,
  context,
  contextDescription,
  transformHits,
}: Props) {
  const ref = useWidget((el) =>
    promptSuggestions({
      container: el,
      agentId: AGENT_ID,
      configurationId,
      context,
      transformHits,
    })
  );

  return (
    <div class="flex flex-col gap-3">
      <p class="text-xs text-neutral-500 dark:text-neutral-400">
        Context: {contextDescription}
      </p>
      <div ref={ref} />
    </div>
  );
}

export function WidgetPromptSuggestionsPlp() {
  return (
    <WidgetPromptSuggestions
      configurationId="algolia_prompt_suggestions_c567a834-c9f6-48af-8d7d-38e4741ff9c6"
      contextDescription="current query, filters, and first five search results"
      transformHits={(hits) =>
        hits.slice(0, 5).map((hit) => ({
          objectID: hit.objectID,
          name: hit.name,
          brand: hit.brand,
          categories: hit.categories,
          price: hit.price,
          rating: hit.rating,
        }))
      }
    />
  );
}

export function WidgetPromptSuggestionsPdp() {
  return (
    <WidgetPromptSuggestions
      configurationId="algolia_prompt_suggestions_df9c9163-926d-4d41-959f-1f31aa37fa8c"
      contextDescription="Amazon Fire TV Stick product details"
      context={{
        focalProduct: {
          objectID: 'amazon-fire-tv-stick',
          name: 'Amazon Fire TV Stick',
          brand: 'Amazon',
          category: 'Streaming media players',
          description:
            'A compact streaming device with voice control and access to major streaming services.',
          price: 39.99,
        },
      }}
    />
  );
}

export function WidgetPromptSuggestionsCustom() {
  return (
    <WidgetPromptSuggestions
      configurationId="algolia_prompt_suggestions_8e802b98-8610-490f-96d8-17ce3d2be306"
      contextDescription="Home entertainment buying guide for budget-conscious shoppers"
      context={{
        pageTitle: 'Home entertainment buying guide',
        pageContent:
          'Compare streaming and smart-home devices by compatibility, features, and price.',
        audience: 'Budget-conscious shoppers',
      }}
    />
  );
}
