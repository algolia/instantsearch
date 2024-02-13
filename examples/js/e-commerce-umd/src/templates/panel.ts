import { refinementList } from 'instantsearch.js/es/widgets';
import { PanelTemplates } from 'instantsearch.js/es/widgets/panel/panel';

export const collapseButtonText: PanelTemplates<
  typeof refinementList
>['collapseButtonText'] = ({ collapsed }, { html }) => {
  if (collapsed) {
    return html`<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13">
      <path
        fill="#21243d"
        d="M6 6V0h1v6h6v1H7v6H6V7H0V6h6z"
        fill-rule="evenodd"
      />
    </svg>`;
  }

  return html`<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13">
    <path fill="#21243d" d="M0 6h13v1H0z" fill-rule="evenodd" />
  </svg>`;
};
