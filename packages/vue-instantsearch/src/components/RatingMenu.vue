<script>
import { connectRatingMenu } from 'instantsearch-core';
import { createRatingMenuComponent } from 'instantsearch-ui-components';

import { createPanelConsumerMixin } from '../mixins/panel';
import { createSuitMixin } from '../mixins/suit';
import { createWidgetMixin } from '../mixins/widget';
import { Fragment, getScopedSlot, renderReactCompat } from '../util/vue-compat';

export default {
  name: 'AisRatingMenu',
  mixins: [
    createSuitMixin({ name: 'RatingMenu' }),
    createWidgetMixin(
      {
        connector: connectRatingMenu,
      },
      {
        $$widgetType: 'ais.ratingMenu',
      }
    ),
    createPanelConsumerMixin(),
  ],
  props: {
    attribute: {
      type: String,
      required: true,
    },
    max: {
      type: Number,
      default: undefined,
    },
  },
  computed: {
    widgetParams() {
      return {
        attribute: this.attribute,
        max: this.max,
      };
    },
  },
  render: renderReactCompat(function (h) {
    if (!this.state) {
      return null;
    }

    const defaultSlot = getScopedSlot(this, 'default');
    if (defaultSlot) {
      return h(
        'div',
        {
          className: [
            this.suit(),
            !this.state.canRefine && this.suit('', 'noRefinement'),
          ],
        },
        [
          defaultSlot({
            items: this.state.items,
            refine: this.state.refine,
            createURL: this.state.createURL,
            sendEvent: this.state.sendEvent,
            canRefine: this.state.canRefine,
          }),
        ]
      );
    }

    const RatingMenu = createRatingMenuComponent({
      createElement: h,
      Fragment,
    });

    return h(RatingMenu, {
      items: this.state.items,
      canRefine: this.state.canRefine,
      createURL: this.state.createURL,
      onRefine: (item) => this.state.refine(item.value),
      andUpComponent: getScopedSlot(this, 'andUp'),
      classNames: this.classNames && {
        root: this.classNames['ais-RatingMenu'],
        noRefinementRoot: this.classNames['ais-RatingMenu--noRefinement'],
        list: this.classNames['ais-RatingMenu-list'],
        item: this.classNames['ais-RatingMenu-item'],
        selectedItem: this.classNames['ais-RatingMenu-item--selected'],
        disabledItem: this.classNames['ais-RatingMenu-item--disabled'],
        link: this.classNames['ais-RatingMenu-link'],
        starIcon: this.classNames['ais-RatingMenu-starIcon'],
        fullStarIcon: this.classNames['ais-RatingMenu-starIcon--full'],
        emptyStarIcon: this.classNames['ais-RatingMenu-starIcon--empty'],
        label: this.classNames['ais-RatingMenu-label'],
        count: this.classNames['ais-RatingMenu-count'],
      },
    });
  }),
};
</script>
