import { promptSuggestions } from 'instantsearch.js/es/widgets';

import { SHOWCASE_AGENT_ID } from '../../constants';
import { useWidget } from '../../hooks/useWidget';

type Props = Pick<
  Parameters<typeof promptSuggestions>[0],
  'configurationId' | 'context' | 'transformHits'
> & {
  contextDescription: string;
};

function WidgetPromptSuggestions({
  configurationId,
  context,
  contextDescription,
  transformHits,
}: Props) {
  const ref = useWidget((el) =>
    promptSuggestions({
      container: el,
      agentId: SHOWCASE_AGENT_ID,
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
      configurationId="algolia_prompt_suggestions_553c8924-df38-403e-a302-f977a8963700"
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
      configurationId="algolia_prompt_suggestions_15a040ea-25ed-41ac-9615-3184383c57d4"
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
      configurationId="algolia_prompt_suggestions_b31fd5dd-0d44-4567-b2a0-f6891c5b71a1"
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
