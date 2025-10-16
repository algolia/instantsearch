import { createSearchClient } from '@instantsearch/mocks';

import instantsearch from '../../../index.es';
import { EXPERIMENTAL_autocomplete } from '../autocomplete';

describe('autocomplete', () => {
  it('exports the autocomplete widget', () => {
    expect(EXPERIMENTAL_autocomplete).toBeDefined();
    expect(typeof EXPERIMENTAL_autocomplete).toBe('function');
  });

  it('returns an array of widgets', () => {
    const widgets = EXPERIMENTAL_autocomplete({
      container: document.createElement('div'),
    });
    expect(Array.isArray(widgets)).toBe(true);
    expect(widgets.length).toBe(2);
  });

  it('can be added to an InstantSearch instance', () => {
    const widgets = EXPERIMENTAL_autocomplete({
      container: document.createElement('div'),
    });
    const searchClient = createSearchClient();
    const search = instantsearch({ searchClient }).addWidgets(widgets);

    expect(search.mainIndex.getWidgets()).toEqual(widgets);
  });
});
