<script>
import { connectPagination } from 'instantsearch-core';
import { createPaginationComponent } from 'instantsearch-ui-components';

import { createPanelConsumerMixin } from '../mixins/panel';
import { createSuitMixin } from '../mixins/suit';
import { createWidgetMixin } from '../mixins/widget';
import { Fragment, getScopedSlot, renderReactCompat } from '../util/vue-compat';

const slotNames = {
  firstPage: 'first',
  previousPage: 'previous',
  page: 'item',
  nextPage: 'next',
  lastPage: 'last',
};

export default {
  name: 'AisPagination',
  mixins: [
    createSuitMixin({ name: 'Pagination' }),
    createWidgetMixin(
      {
        connector: connectPagination,
      },
      {
        $$widgetType: 'ais.pagination',
      }
    ),
    createPanelConsumerMixin(),
  ],
  props: {
    padding: {
      type: Number,
      default: undefined,
      validator(value) {
        return value > 0;
      },
    },
    totalPages: {
      type: Number,
      default: undefined,
      validator(value) {
        return value > 0;
      },
    },
    showFirst: {
      type: Boolean,
      default: true,
    },
    showLast: {
      type: Boolean,
      default: true,
    },
    showNext: {
      type: Boolean,
      default: true,
    },
    showPrevious: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    widgetParams() {
      return {
        padding: this.padding,
        totalPages: this.totalPages,
      };
    },
  },
  emits: ['page-change'],
  methods: {
    refine(page) {
      const p = Math.min(Math.max(page, 0), this.state.nbPages - 1);
      this.state.refine(p);
      // TODO: do this in a general way
      this.$emit('page-change', p);
    },
  },
  render: renderReactCompat(function (h) {
    if (!this.state) {
      return null;
    }

    const rootClassName = [
      this.suit(),
      this.state.nbPages <= 1 && this.suit('', 'noRefinement'),
    ];

    const defaultSlot = getScopedSlot(this, 'default');
    if (defaultSlot) {
      return h('div', { className: rootClassName }, [
        defaultSlot({
          refine: this.refine,
          createURL: this.state.createURL,
          currentRefinement: this.state.currentRefinement,
          nbHits: this.state.nbHits,
          nbPages: this.state.nbPages,
          pages: this.state.pages,
          isFirstPage: this.state.isFirstPage,
          isLastPage: this.state.isLastPage,
        }),
      ]);
    }

    const Pagination = createPaginationComponent({
      createElement: h,
      Fragment,
    });

    const slots = {};
    Object.keys(slotNames).forEach((type) => {
      slots[type] = getScopedSlot(this, slotNames[type]);
    });
    const hasItemSlot = Object.keys(slots).some((type) => slots[type]);

    return h(Pagination, {
      classNames: this.classNames && {
        root: this.classNames['ais-Pagination'],
        noRefinementRoot: this.classNames['ais-Pagination--noRefinement'],
        list: this.classNames['ais-Pagination-list'],
        item: this.classNames['ais-Pagination-item'],
        firstPageItem: this.classNames['ais-Pagination-item--firstPage'],
        previousPageItem: this.classNames['ais-Pagination-item--previousPage'],
        pageItem: this.classNames['ais-Pagination-item--page'],
        selectedItem: this.classNames['ais-Pagination-item--selected'],
        disabledItem: this.classNames['ais-Pagination-item--disabled'],
        nextPageItem: this.classNames['ais-Pagination-item--nextPage'],
        lastPageItem: this.classNames['ais-Pagination-item--lastPage'],
        link: this.classNames['ais-Pagination-link'],
      },
      pages: this.state.pages,
      currentPage: this.state.currentRefinement,
      nbPages: this.state.nbPages,
      isFirstPage: this.state.isFirstPage,
      isLastPage: this.state.isLastPage,
      showFirst: this.showFirst,
      showPrevious: this.showPrevious,
      showNext: this.showNext,
      showLast: this.showLast,
      createURL: this.state.createURL,
      onNavigate: this.refine,
      // The `first`, `previous`, `item`, `next` and `last` slots replace the
      // link inside its `<li>`.
      itemComponent: hasItemSlot
        ? ({ type, page, className, key, children }) => {
            const slot = slots[type];
            if (!slot) {
              return h('li', { key, className }, [children]);
            }

            const slotProps = {
              createURL: () => this.state.createURL(page),
              isFirstPage: this.state.isFirstPage,
              isLastPage: this.state.isLastPage,
              refine: () => this.refine(page),
            };
            if (type === 'page') {
              slotProps.page = page;
            }

            return h('li', { key, className }, [slot(slotProps)]);
          }
        : undefined,
    });
  }),
};
</script>
