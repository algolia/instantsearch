<template>
  <div class="ais-navigation-tree" v-if="show">
    <slot name="header"></slot>

    <ul v-if="facetValues.length > 0">
      <li v-for="facet in facetValues"
          class="ais-navigation-tree__item"
          :class="{'ais-navigation-tree__item--active': facet.isRefined}"
      >
        <label>
          <input type="checkbox"
                 v-model="facet.isRefined"
                 @change="toggleRefinement(facet)"
                 :value="facet.name"
          >
          <slot :value="facet.name" :count="facet.count" :active="facet.isRefined">
            <span class="ais-navigation-tree__value">{{facet.name}}</span>
            <span class="ais-navigation-tree__count">({{facet.count}})</span>
          </slot>
        </label>

        <template v-if="facet.isRefined && facet.data.length > 0">
          <ul>
            <li v-for="subfacet in facet.data"
                class="ais-navigation-tree__item"
                :class="{'ais-navigation-tree__item--active': subfacet.isRefined}"
            >
              <label>
                <input type="checkbox"
                       v-model="subfacet.isRefined"
                       @change="toggleRefinement(subfacet)"
                       :value="subfacet.name"
                >
                <slot :value="subfacet.name" :count="subfacet.count" :active="subfacet.isRefined">
                  <span class="ais-navigation-tree__value">{{subfacet.name}}</span>
                  <span class="ais-navigation-tree__count">({{subfacet.count}})</span>
                </slot>
              </label>
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

<style lang="scss" rel="stylesheet/scss">
  .ais-navigation-tree {

    label {
      font-weight: normal;
      cursor: pointer;

      &:hover .ais-navigation-tree__value {
        text-decoration: underline;
      }

    }

    ul {
      list-style: none;
    }

    & > ul {
      padding-left: 0;
    }

    &__item--active > label {
      font-weight: bold;
    }

  }
</style>
