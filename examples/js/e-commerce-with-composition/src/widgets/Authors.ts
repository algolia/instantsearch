import { panel, refinementList } from 'instantsearch.js/es/widgets';

import { collapseButtonText } from '../templates/panel';

const authorRefinementList = panel<typeof refinementList>({
  templates: {
    header() {
      return 'Authors';
    },
    collapseButtonText,
  },
  collapsed: () => false,
})(refinementList);

export const authors = authorRefinementList({
  container: '[data-widget="authors"]',
  attribute: 'author',
  searchable: true,
  searchablePlaceholder: 'Search for authors\u2026',
  templates: {
    searchableSubmit: (_, { html }) => {
      return html`
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 14 14"
        >
          <g
            fill="none"
            fill-rule="evenodd"
            stroke="#21243D"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.33"
            transform="translate(1 1)"
          >
            <circle cx="5.333" cy="5.333" r="5.333" />
            <path d="M12 12L9.1 9.1" />
          </g>
        </svg>
      `;
    },
  },
});
