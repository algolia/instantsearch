<script>
import { FACET_TREE } from '../store';
import algoliaComponent from '../component';

export default {
  mixins: [algoliaComponent],
  props: {
    attribute: {
      type: String,
      default: 'tree-menu',
    },
    attributes: {
      type: Array,
      required: true,
    },
    separator: {
      type: String,
      default: ' > ',
    },
    limit: {
      type: Number,
      default: 10,
    },
    sortBy: {
      default() {
        return ['name:asc'];
      },
    },
  },
  data() {
    return {
      widgetName: 'ais-tree-menu',
    };
  },
  created() {
    this.searchStore.addFacet(
      {
        name: this.attribute,
        attributes: this.attributes,
        separator: this.separator,
      },
      FACET_TREE
    );
  },
  destroyed() {
    this.searchStore.stop();
    this.searchStore.removeFacet(this.attribute);
    this.searchStore.start();
  },
  computed: {
    facetValues() {
      const values = this.searchStore.getFacetValues(
        this.attribute,
        this.sortBy
      );

      return values.data || [];
    },
    show() {
      return this.facetValues.length > 0;
    },
  },
  methods: {
    toggleRefinement(value) {
      return this.searchStore.toggleFacetRefinement(this.attribute, value.path);
    },
    _renderList(h, facetValues, isRoot = true) {
      const listItems = [];
      for (const facet of facetValues) {
        const listItemLabel = [];

        if (this.$scopedSlots.default) {
          listItemLabel.push(
            this.$scopedSlots.default({
              value: facet.name,
              count: facet.count,
              active: facet.isRefined,
            })
          );
        } else {
          listItemLabel.push(
            h(
              'span',
              {
                class: this.suit('value'),
              },
              facet.name
            ),
            h(
              'span',
              {
                class: this.suit('count'),
              },
              facet.count
            )
          );
        }

        const listItemChildren = [
          h(
            'a',
            {
              domProps: {
                href: '#',
              },
              on: {
                click: event => {
                  event.preventDefault();
                  this.toggleRefinement(facet);
                },
              },
            },
            listItemLabel
          ),
        ];

        if (facet.isRefined && facet.data && facet.data.length > 0) {
          listItemChildren.push(this._renderList(h, facet.data, false));
        }

        listItems.push(
          h(
            'li',
            {
              class: [
                this.suit('item'),
                facet.isRefined ? this.suit('item', 'active') : '',
              ],
            },
            listItemChildren
          )
        );
      }

      return h(
        'ul',
        {
          class: isRoot ? this.suit('list') : '',
        },
        listItems
      );
    },
  },
  render(h) {
    if (this.show === false) {
      return undefined;
    }

    const children = [];

    if (this.$slots.header) {
      children.push(this.$slots.header);
    }

    children.push(this._renderList(h, this.facetValues));

    if (this.$slots.footer) {
      children.push(this.$slots.footer);
    }

    return h(
      'div',
      {
        class: this.suit(),
      },
      children
    );
  },
};</script>
