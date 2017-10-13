<script>
  import algoliaComponent from '../component';
  import {FACET_TREE} from '../store';

  export default {
    mixins: [algoliaComponent],

    props: {
      attribute: {
        type: String,
      },
      limit: {
        type: Number,
        default: 10
      },
      sortBy: {
        default() {
          return ['name:asc']
        }
      }
    },

    computed: {
      facetValues() {
        const {data = []} = this.searchStore.getFacetValues(
          this.attribute,
          this.sortBy
        );

        return data;
      }
    },

    methods: {
      handleClick(event, path) {
        event.preventDefault();
        this.searchStore.toggleFacetRefinement(this.attribute, path);
      }
    },

    data() {
      return {
        blockClassName: 'ais-menu',
      };
    },

    created() {
      this.searchStore.addFacet({
        name: this.attribute,
        attributes: [this.attribute]
      }, FACET_TREE);
    },

    destroyed() {
      this.searchStore.removeFacet(this.attribute);
    },

    render(h) {
      if (this.show === false) return undefined;

      const children = [];
      if (this.$slots.header) children.push(this.$slots.header);

      children.push(this.facetValues.map(({name, path, count, isRefined}) => (
        h(
          'div',
          { class: [this.bem('item'), isRefined ? this.bem('item', 'active') : ''] },
          [
            h(
              'a',
              {
                class: this.bem('link'),
                domProps: { href: '#' },
                on: { click: (event) => this.handleClick(event, path) }
              },
              [
                name,
                h('span', {class: this.bem('count')}, count)
              ]
            )
          ]
        )
      )));

      if (this.$slots.footer) children.push(this.$slots.footer);

      return h('div', { class: this.bem() }, children);
    }
  }
</script>
