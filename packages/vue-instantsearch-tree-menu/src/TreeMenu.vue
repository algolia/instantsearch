<template>
  <div class="ais-tree-menu" v-if="show">
    <slot name="header"></slot>

    <ul v-if="facetValues.length > 0">
      <li v-for="facet in facetValues"
          class="ais-tree-menu__item"
          :class="{'ais-tree-menu__item--active': facet.isRefined}"
      >
        <a href="#" @click.prevent="toggleRefinement(facet)">
          <slot :value="facet.name" :count="facet.count" :active="facet.isRefined">
            <span class="ais-tree-menu__value">{{facet.name}}</span>
            <span class="ais-tree-menu__count">{{facet.count}}</span>
          </slot>
        </a>

        <template v-if="facet.isRefined && facet.data.length > 0">
          <ul>
            <li v-for="subfacet in facet.data"
                class="ais-tree-menu__item"
                :class="{'ais-tree-menu__item--active': subfacet.isRefined}"
            >
              <a href="#" @click.prevent="toggleRefinement(subfacet)">
                <slot :value="subfacet.name" :count="subfacet.count" :active="subfacet.isRefined">
                  <span class="ais-tree-menu__value">{{subfacet.name}}</span>
                  <span class="ais-tree-menu__count">{{subfacet.count}}</span>
                </slot>
              </a>
            </li>
          </ul>
        </template>

      </li>
    </ul>

    <slot name="footer"></slot>
  </div>
</template>

<script>
  import {FACET_TREE} from 'instantsearch-store'
  import algoliaComponent from 'vue-instantsearch-component'

  export default {
    mixins: [algoliaComponent],
    props: {
      attribute: {
        type: String,
        required: false,
        default: 'tree'
      },
      attributes: {
        type: Array,
        required: true
      },
      separator: {
        type: String,
        required: false,
        default: ' > '
      },
      limit: {
        type: Number,
        default: 10
      },
      sortBy: {
        default () {
          return ['name:asc']
        }
      }
    },
    mounted () {
      this.searchStore.addFacet({
        name: this.attribute,
        attributes: this.attributes,
        separator: this.separator
      }, FACET_TREE)
    },
    destroyed () {
      this.searchStore.removeFacet(this.attribute)
    },
    computed: {
      facetValues () {
        let values = this.searchStore.getFacetValues(this.attribute, this.sortBy)

        return values.data || []
      },
      show () {
        return this.facetValues.length > 0
      }
    },
    methods: {
      toggleRefinement (value) {
        return this.searchStore.toggleFacetRefinement(this.attribute, value.path)
      }
    }
  }
</script>
