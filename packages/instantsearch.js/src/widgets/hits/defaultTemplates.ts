import type { HitsTemplates } from './hits';

const defaultTemplates: HitsTemplates = {
  empty() {
    return 'No results';
  },
  item(data, { html }) {
    return html`<div style="word-break: break-all;">
      ${JSON.stringify(data).slice(0, 100)}…
    </div>`;
  },
};

export default defaultTemplates;
