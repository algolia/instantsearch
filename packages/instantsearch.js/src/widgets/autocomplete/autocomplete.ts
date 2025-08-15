import { connectAutocomplete } from '../../connectors';
import {
  checkRendering,
  createDocumentationMessageGenerator,
  getContainerNode,
} from '../../lib/utils';

import type { WidgetFactory, WidgetRenderState } from '../../types';

const withUsage = createDocumentationMessageGenerator({ name: 'autocomplete' });

export type AutocompleteWidgetParams = {
  container: string | HTMLElement;
  placeholder?: string;
  submitButton?: boolean;
  resetButton?: boolean;
  autofocus?: boolean;
  cssClasses?: Partial<AutocompleteCSSClasses>;
  templates?: Partial<AutocompleteTemplates>;
};

export type AutocompleteCSSClasses = {
  root: string;
  form: string;
  input: string;
  submit: string;
  reset: string;
};

export type AutocompleteTemplates = {
  submit: string;
  reset: string;
};

export type AutocompleteRenderState = {
  refine: (query: string) => void;
  query: string;
  widgetParams: AutocompleteWidgetParams;
};

const defaultTemplates: AutocompleteTemplates = {
  submit: '<button type="submit">🔍</button>',
  reset: '<button type="reset">✖</button>',
};

const defaultCSSClasses: AutocompleteCSSClasses = {
  root: 'ais-Autocomplete',
  form: 'ais-Autocomplete-form',
  input: 'ais-Autocomplete-input',
  submit: 'ais-Autocomplete-submit',
  reset: 'ais-Autocomplete-reset',
};

export type AutocompleteConnectorParams = Record<string, never>;

export type AutocompleteWidgetDescription = {
  $$type: 'ais.autocomplete';
  $$widgetType: 'ais.autocomplete';
  renderState: WidgetRenderState<
    AutocompleteRenderState,
    AutocompleteWidgetParams
  >;
  indexRenderState: {
    autocomplete: WidgetRenderState<
      AutocompleteRenderState,
      AutocompleteWidgetParams
    >;
  };
};

export type AutocompleteWidget = WidgetFactory<
  AutocompleteWidgetDescription & { $$widgetType: 'ais.autocomplete' },
  AutocompleteConnectorParams,
  AutocompleteWidgetParams
>;

const autocomplete: AutocompleteWidget = (widgetParams) => {
  const {
    container,
    placeholder = '',
    submitButton = true,
    resetButton = true,
    autofocus = false,
    cssClasses = {},
    templates = {},
  } = widgetParams || {};

  if (!container) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  const containerNode = getContainerNode(container);

  const mergedCSSClasses = { ...defaultCSSClasses, ...cssClasses };
  const mergedTemplates = { ...defaultTemplates, ...templates };

  let input!: HTMLInputElement;

  const makeWidget = connectAutocomplete((renderOptions, isFirstRender) => {
    const { currentRefinement: query, refine, indices } = renderOptions;

    if (isFirstRender) {
      renderInput(query, refine);

      const form = containerNode.querySelector('form')!;
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        // refine is handled on input event
      });

      input.addEventListener('input', (event) => {
        refine((event.target as HTMLInputElement).value);
      });

      if (resetButton) {
        const reset = containerNode.querySelector(`.${mergedCSSClasses.reset}`);
        if (reset) {
          reset.addEventListener('click', () => {
            input.value = '';
            refine('');
          });
        }
      }
    } else {
      input.value = query || '';
      renderResults(indices, refine);
    }
  });

  return {
    $$widgetType: 'ais.autocomplete',
    ...makeWidget({
      ...widgetParams,
    }),
  } as unknown as ReturnType<AutocompleteWidget>;

  function renderInput(query: string, refine: (q: string) => void) {
    containerNode.innerHTML = `
      <form class="${mergedCSSClasses.form}">
        <input
          class="${mergedCSSClasses.input}"
          type="search"
          placeholder="${placeholder}"
          ${autofocus ? 'autofocus' : ''}
          value="${query}"
        />
        ${submitButton ? mergedTemplates.submit : ''}
        ${resetButton ? mergedTemplates.reset : ''}
      </form>
    `;

    input = containerNode.querySelector('input')!;

    const form = containerNode.querySelector('form')!;
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      refine(input.value);
    });

    input.addEventListener('input', () => {
      refine(input.value);
    });

    if (resetButton) {
      const reset = containerNode.querySelector(`.${mergedCSSClasses.reset}`);
      if (reset) {
        reset.addEventListener('click', () => {
          input.value = '';
          refine('');
        });
      }
    }
  }

  function renderResults(indices: any, refine: (q: string) => void) {
    // Placeholder for rendering autocomplete results.
    // You can customize this to display suggestions below the input.
    // For now, we'll clear any previous results.
    const existingResults = containerNode.querySelector(
      '.ais-Autocomplete-results'
    );
    if (existingResults) {
      existingResults.remove();
    }

    // Example: render a simple list of hits if available
    if (
      indices &&
      indices.length > 0 &&
      indices[0].hits &&
      indices[0].hits.length > 0
    ) {
      const resultsContainer = document.createElement('div');
      resultsContainer.className = 'ais-Autocomplete-results';

      const ul = document.createElement('ul');
      indices[0].hits.forEach((hit: any) => {
        const li = document.createElement('li');
        li.textContent = hit.query || hit.name || JSON.stringify(hit);
        li.addEventListener('click', () => {
          refine(li.textContent || '');
          input.value = li.textContent || '';
        });
        ul.appendChild(li);
      });

      resultsContainer.appendChild(ul);
      containerNode.appendChild(resultsContainer);
    }
  }
};

export default autocomplete;
