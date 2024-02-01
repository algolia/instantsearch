import { createHighlightComponent } from 'instantsearch-ui-components';

import { createSuitMixin } from '../mixins/suit';
import { renderCompat } from '../util/vue-compat';

export default {
  name: 'AisHighlight',
  mixins: [createSuitMixin({ name: 'Highlight' })],
  // props: {
  //   hit: {
  //     type: Object,
  //     required: true,
  //   },
  //   attribute: {
  //     type: String,
  //     required: true,
  //   },
  //   highlightedTagName: {
  //     type: String,
  //     default: 'mark',
  //   },
  // },
  render: renderCompat((h) => {
    const InternalHighlight = createHighlightComponent({
      createElement: h,
      Fragment: (x) => x,
    });

    return (
      <InternalHighlight
        classNames={{
          root: cx('ais-Highlight', classNames.root),
          highlighted: cx('ais-Highlight-highlighted', classNames.highlighted),
          nonHighlighted: cx(
            'ais-Highlight-nonHighlighted',
            classNames.nonHighlighted
          ),
          separator: cx('ais-Highlight-separator', classNames.separator),
        }}
        {...props}
      />
    );
  }),
};
